import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, BrainCircuit, Maximize2, Minimize2 } from 'lucide-react';
import { apiClient } from '../api/client';

export default function Chatbot({ appState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('caccs_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { role: 'model', text: 'Hi Suramyaa. I am your research-thinking companion. Let\'s explore some patterns together.' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('caccs_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    // We send everything EXCEPT complex objects that might crash JSON.stringify if too nested
    // appState is already plain JS objects mostly so it's safe.
    // We can omit functions or huge arrays if we want, but letting the backend clip it is fine.
    
    try {
      const res = await apiClient.chat(userMsg.text, messages.slice(1), appState);
      setMessages(prev => [...prev, { role: 'model', text: res.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Could not reach the assistant API.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-zinc-900 border border-zinc-700 text-white rounded-full flex justify-center items-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-50 animate-in fade-in zoom-in"
      >
        <MessageSquare size={22} />
      </button>
    );
  }

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-0 w-full h-full rounded-none' : 'bottom-8 right-8 w-96 h-[600px] rounded-2xl'} bg-white border border-zinc-200 shadow-2xl flex flex-col z-50 transition-all duration-300 overflow-hidden text-zinc-900`}
    >
      <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
        <div className="flex items-center gap-2 font-serif font-semibold text-lg text-zinc-800">
          <BrainCircuit className="text-zinc-500" size={20} />
          Research Companion
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-400 hover:text-zinc-700 transition-colors p-1">
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-700 transition-colors p-1">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-white font-sans">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
            m.role === 'user' 
              ? 'self-end bg-zinc-900 text-white rounded-2xl rounded-br-sm' 
              : 'self-start bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-2xl rounded-bl-sm shadow-sm'
          }`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="self-start max-w-[85%] px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl rounded-bl-sm">
            <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin inline-block"></span>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-zinc-100 bg-zinc-50">
        <form 
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="flex gap-3"
        >
          <input
            type="text"
            className="flex-1 bg-white border border-zinc-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 font-sans placeholder-zinc-400"
            placeholder="Explore structural assumptions..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={`w-11 h-11 rounded-full flex justify-center items-center transition-colors shadow-sm ${
              !input.trim() || loading ? 'bg-zinc-200 text-zinc-400' : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
