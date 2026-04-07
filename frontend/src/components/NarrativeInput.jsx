import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Brain, Download, Save } from 'lucide-react';

export default function NarrativeInput({ appState, updateState }) {
  const [narrative, setNarrative] = useState(appState.narrative || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [library, setLibrary] = useState([]);
  const navigate = useNavigate();

  const refreshLibrary = async () => {
    try {
      const data = await apiClient.getLibrary();
      setLibrary(data.narratives || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshLibrary();
  }, []);

  const handleExtract = async () => {
    if (!narrative.trim()) return;
    
    setLoading(true);
    updateState('narrative', narrative);
    
    try {
      const res = await apiClient.extract(narrative);
      updateState('extraction', res.extraction);
      updateState('graph', res.graph);
      updateState('loops', res.loops);
      navigate('/graph');
    } catch (err) {
      console.error(err);
      alert('Failed to extract. Please check backend is running and API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const loadFromLibrary = (e) => {
    const id = e.target.value;
    if (!id) return;
    const item = library.find(n => n.id === id);
    if (item) {
      setNarrative(item.narrative || '');
      updateState('exampleConfig', item.config || {});
      updateState('exampleStateUpdate', item.state_update_fn || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Narrative Ingestion</h1>
        <p className="text-zinc-500 font-normal leading-relaxed">Enter an unstructured description of your socio-technical system. The intelligence engine will synthesize causal structures, feedback thresholds, and agent dynamics directly from your philosophical framework.</p>
      </div>
      
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-6 flex flex-col gap-6" style={{ minHeight: '500px' }}>
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
          <h3 className="text-lg font-medium text-zinc-800">System Source Text</h3>
          <div className="flex items-center gap-3">
            <Download size={14} className="text-zinc-400" />
            <select 
              className="text-sm bg-zinc-50 border border-zinc-200 text-zinc-700 py-1.5 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all" 
              onChange={loadFromLibrary} 
              defaultValue=""
            >
              <option value="" disabled>Import Library Narrative...</option>
              {library.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
            </select>
          </div>
        </div>
        
        <textarea
          className="flex-1 w-full bg-zinc-50/50 border border-zinc-200 rounded-lg p-4 text-zinc-800 text-base leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none transition-all placeholder:text-zinc-400"
          value={narrative}
          onChange={e => setNarrative(e.target.value)}
          placeholder="Paste policy documents, philosophical frameworks, or ethnographic transcripts here..."
          disabled={loading || saving}
        />
        
        <div className="flex justify-end gap-3 pt-2">
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              !narrative.trim() || loading || saving ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm'
            }`}
            onClick={async () => {
              const title = window.prompt("Enter a title for this narrative entry:");
              if (!title) return;
              setSaving(true);
              try {
                await apiClient.createLibraryEntry({
                  title,
                  narrative,
                  description: "Saved from live session",
                  config: appState.exampleConfig || {},
                  state_update_fn: appState.exampleStateUpdate || ''
                });
                await refreshLibrary();
                alert("Successfully saved to library.");
              } catch (e) {
                alert("Failed to save to library.");
              } finally {
                setSaving(false);
              }
            }}
            disabled={!narrative.trim() || loading || saving}
          >
            {saving ? <span className="w-4 h-4 border-2 border-zinc-400/20 border-t-zinc-400 rounded-full animate-spin"></span> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save into Library'}
          </button>

          <button 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              !narrative.trim() || loading || saving ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
            }`}
            onClick={handleExtract} 
            disabled={!narrative.trim() || loading || saving}
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <Brain size={16} />}
            {loading ? 'Synthesizing...' : 'Extract Causal Engine'}
          </button>
        </div>
      </div>
    </div>
  );
}
