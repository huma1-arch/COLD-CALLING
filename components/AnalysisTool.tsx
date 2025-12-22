import React, { useState } from 'react';
    import { Upload, Video, FileAudio, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
    import { analyzeVideo } from '../services/geminiService';
    
    export const AnalysisTool: React.FC = () => {
      const [file, setFile] = useState<File | null>(null);
      const [analysis, setAnalysis] = useState<string>('');
      const [loading, setLoading] = useState(false);
      const [prompt, setPrompt] = useState('');
      const [dragActive, setDragActive] = useState(false);
    
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          setAnalysis('');
        }
      };
    
      const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        try {
          // Convert file to base64
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const result = await analyzeVideo(base64Data, file.type, prompt);
            setAnalysis(result);
            setLoading(false);
          };
          reader.onerror = () => {
            alert("Error reading file");
            setLoading(false);
          };
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      };
    
      return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Call Analysis Center</h2>
              <p className="text-slate-400">Upload video recordings of your sales calls. Gemini Pro will analyze body language, tone, and objections.</p>
            </div>
    
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Upload & Config */}
              <div className="space-y-6">
                <div 
                    className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center transition-colors relative ${
                        dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                    }`}
                >
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onDragEnter={() => setDragActive(true)}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={() => setDragActive(false)}
                  />
                  {file ? (
                    <div className="text-center p-4">
                      {file.type.startsWith('video') ? <Video className="w-12 h-12 text-blue-400 mx-auto mb-3" /> : <FileAudio className="w-12 h-12 text-purple-400 mx-auto mb-3" />}
                      <p className="font-medium text-white break-all">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                        }}
                        className="mt-4 text-xs text-red-400 hover:text-red-300 underline z-10 relative"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 pointer-events-none">
                      <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="font-medium text-slate-300">Drop video or audio here</p>
                      <p className="text-sm text-slate-500 mt-1">Supports MP4, MOV, MP3, WEBM</p>
                    </div>
                  )}
                </div>
    
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Analysis Instructions (Optional)</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Focus on the negotiation phase. Did I sound confident? What objections did I miss?"
                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                </div>
    
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                  {loading ? 'Analyzing Media...' : 'Start Analysis'}
                </button>
              </div>
    
              {/* Right: Results */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-inner h-[600px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" /> AI Feedback
                </h3>
                {analysis ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{analysis}</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                        {loading ? (
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                                <p>Processing detailed analysis...</p>
                            </div>
                        ) : (
                            <>
                                <AlertCircle className="w-12 h-12 mb-4" />
                                <p>Upload media to see AI insights</p>
                            </>
                        )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };
    