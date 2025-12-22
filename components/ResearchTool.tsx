import React, { useState } from 'react';
import { Search, Loader2, Globe, ExternalLink } from 'lucide-react';
import { searchProspects } from '../services/geminiService';
import { SearchResult } from '../types';

export const ResearchTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchProspects(query);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch research data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-6 overflow-y-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Prospect Intelligence</h2>
        <p className="text-slate-400">Leverage real-time Google Search data to find updated info on companies and leads.</p>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Recent news about Acme Corp CEO..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500 shadow-xl"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Research"}
        </button>
      </form>

      {result && (
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" /> Intelligence Report
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-slate-300">{result.text}</p>
            </div>
          </div>

          {result.groundingMetadata?.groundingChunks && result.groundingMetadata.groundingChunks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.groundingMetadata.groundingChunks.map((chunk, idx) => (
                  chunk.web?.uri && (
                    <a
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
                    >
                      <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{chunk.web.title}</p>
                        <p className="text-xs text-slate-500 truncate">{chunk.web.uri}</p>
                      </div>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
