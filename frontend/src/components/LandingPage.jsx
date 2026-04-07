import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ExternalLink, ArrowRight } from 'lucide-react';

export default function LandingPage({ onInitialize }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInitialize = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    // Simulate initialization and store key
    localStorage.setItem('OPENROUTER_API_KEY', apiKey.trim());
    
    setTimeout(() => {
      onInitialize(apiKey.trim());
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 font-sans text-zinc-900 border-t-4 border-zinc-900">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border border-zinc-100 overflow-hidden">
            <img src="/logo.png" alt="Sunflower Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-serif font-semibold tracking-tight text-zinc-800 mb-2">CACCS-AI</h1>
          <p className="text-zinc-500 font-medium tracking-wide uppercase text-xs text-center border-y border-zinc-200 py-2 w-full">
            Context-Aware Cognitive Control System
          </p>
        </div>

        <div className="bg-white border border-zinc-200 shadow-xl rounded-2xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
          
          <form onSubmit={handleInitialize} className="relative z-10">
            <div className="mb-6">
              <label htmlFor="api-key" className="block text-sm font-semibold text-zinc-700 mb-3 ml-1 uppercase tracking-wider">
                OpenRouter API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  id="api-key"
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all duration-300 shadow-inner"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
            </div>

            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 mb-8 transition-colors duration-300 ml-1 group/link"
            >
              <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              Setup OpenRouter API Key
            </a>

            <button
              type="submit"
              disabled={!apiKey.trim() || loading}
              className={`w-full group py-4 px-6 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-500 flex items-center justify-center gap-3 ${
                !apiKey.trim() || loading
                  ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xl hover:shadow-zinc-300 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Initialize System
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            
            <p className="mt-6 text-center text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-300">
              Model: Minimax 2.5 (Free)
            </p>
          </form>
        </div>

        <footer className="text-center">
          <p className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase mb-1">
            Based on the presentation by <span className="text-zinc-900 font-bold">Suramyaa Sarkar</span>
          </p>
          <p className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase mb-6">
            Coded by <span className="text-zinc-900 font-bold">Kanishk Paul</span>
          </p>
          
          <div className="flex flex-col gap-2">
            <a href="mailto:suramyaa.sarkar-1@ou.edu" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">
              suramyaa.sarkar-1@ou.edu
            </a>
            <a href="mailto:kanishkpaul1729@gmail.com" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">
              kanishkpaul1729@gmail.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
