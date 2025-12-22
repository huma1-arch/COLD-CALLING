import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RefreshCw, Volume2, User, Bot, Loader2 } from 'lucide-react';
import { transcribeAudio, generateSpeech, generateScript } from '../services/geminiService';
import { blobToBase64, decodeBase64, decodeAudioData, playAudioBuffer } from '../services/audioUtils';
import { Message } from '../types';

export const RoleplaySim: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "I'm playing the role of a busy CTO at a tech startup. Try to book a meeting with me for your new SaaS product. Ring ring... Hello?",
      timestamp: new Date()
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize AudioContext on user interaction/mount
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    setIsRecording(false);
    setIsProcessing(true);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      try {
        // 1. Transcribe User Audio
        const base64Audio = await blobToBase64(audioBlob);
        const userText = await transcribeAudio(base64Audio, 'audio/webm');
        
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newUserMsg]);

        // 2. Get AI Response (Model Role)
        const responseText = await generateScript(
            userText, 
            messages.map(m => ({ role: m.role, text: m.text }))
        );

        const newAiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newAiMsg]);

        // 3. TTS for AI Response
        if (audioContext) {
            const ttsPcmBase64 = await generateSpeech(responseText);
            if (ttsPcmBase64) {
                const pcmData = decodeBase64(ttsPcmBase64);
                const buffer = await decodeAudioData(pcmData, audioContext, 24000, 1);
                await playAudioBuffer(audioContext, buffer);
            }
        }

      } catch (err) {
        console.error("Sim error:", err);
        alert("Simulation failed. Check console.");
      } finally {
        setIsProcessing(false);
      }
    };

    mediaRecorderRef.current.stop();
    // Stop all tracks
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  };

  const playTTS = async (text: string) => {
    if (!audioContext || isProcessing) return;
    setIsProcessing(true);
    try {
        const ttsPcmBase64 = await generateSpeech(text);
        if (ttsPcmBase64) {
            const pcmData = decodeBase64(ttsPcmBase64);
            const buffer = await decodeAudioData(pcmData, audioContext, 24000, 1);
            await playAudioBuffer(audioContext, buffer);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Voice Roleplay Sim</h2>
          <p className="text-slate-400">Practice your pitch against an AI prospect. Speak to respond.</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold animate-pulse uppercase tracking-wider">
            Live Simulation
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 rounded-xl bg-slate-900/50 p-4 border border-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${
                msg.role === 'user' ? 'items-end' : 'items-start'
            }`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm' 
                    : 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-tl-sm'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                {msg.role === 'model' && (
                    <button 
                        onClick={() => playTTS(msg.text)}
                        className="mt-2 text-xs flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <Volume2 size={14} /> Replay Voice
                    </button>
                )}
            </div>
          </div>
        ))}
        {isProcessing && (
            <div className="flex items-center gap-2 text-slate-500 text-sm animate-pulse ml-14">
                <Loader2 size={16} className="animate-spin" />
                AI is thinking...
            </div>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center justify-center gap-8 shadow-2xl relative overflow-hidden">
        {/* Animated background pulse when recording */}
        {isRecording && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
              : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? <Square fill="currentColor" size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
        </button>
        
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            {isRecording ? "Recording... Tap to stop" : "Tap to speak"}
        </div>
      </div>
    </div>
  );
};
