import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, BrainCircuit, Maximize2, Minimize2 } from 'lucide-react';
import { apiClient } from '../api/client';

export default function Chatbot({ appState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am your context-aware CACCS assistant. Ask me anything about your current session and causal graph!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const endOfMessagesRef = useRef(null);

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
        className="glass-button primary fade-in"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(88, 166, 255, 0.4)',
          zIndex: 9999
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div 
      className="glass-panel fade-in"
      style={{
        position: 'fixed',
        bottom: isExpanded ? '0' : '30px',
        right: isExpanded ? '0' : '30px',
        width: isExpanded ? '100vw' : '400px',
        height: isExpanded ? '100vh' : '600px',
        maxHeight: '100vh',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        borderRadius: isExpanded ? '0' : '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--panel-border)',
        background: 'rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <BrainCircuit className="text-accent" size={20} />
          CACCS Assistant
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: m.role === 'user' ? 'var(--accent)' : 'rgba(22, 27, 34, 0.8)',
            color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
            padding: '12px 16px',
            borderRadius: '12px',
            borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
            borderBottomLeftRadius: m.role === 'model' ? '2px' : '12px',
            border: m.role === 'model' ? '1px solid var(--panel-border)' : 'none',
            fontSize: '0.95rem',
            whiteSpace: 'pre-wrap'
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(22, 27, 34, 0.8)',
            padding: '12px 16px',
            borderRadius: '12px',
            borderBottomLeftRadius: '2px',
            border: '1px solid var(--panel-border)'
          }}>
            <span className="loader" style={{ width: '16px', height: '16px', display: 'inline-block' }}></span>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}>
        <form 
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="glass-input"
            style={{ flex: 1, borderRadius: '24px' }}
            placeholder="Ask about the causal graph, game theory, etc..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="glass-button primary" 
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
