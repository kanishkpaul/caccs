import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Brain, Play, Download } from 'lucide-react';

export default function NarrativeInput({ appState, updateState }) {
  const [narrative, setNarrative] = useState(appState.narrative || '');
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch examples on mount
    apiClient.getExamples().then(data => {
      setExamples(data);
    }).catch(console.error);
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
      
      // Navigate to next step
      navigate('/graph');
    } catch (err) {
      console.error(err);
      alert('Failed to extract. Please check backend is running and API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    if (examples.microgrid?.narrative) {
      setNarrative(examples.microgrid.narrative);
      updateState('exampleConfig', examples.microgrid.config);
      updateState('exampleStateUpdate', examples.microgrid.state_update_fn);
    }
  };

  return (
    <div className="view-container fade-in">
      <div className="view-header">
        <h1>Narrative Ingestion</h1>
        <p>Describe your socio-technical system. The AI engine will extract variables, feedback loops, and stakeholder objectives.</p>
      </div>
      
      <div className="glass-panel" style={{ height: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>System Description</h3>
          <button className="glass-button" onClick={loadExample} disabled={loading}>
            <Download size={16} /> Load Microgrid Example
          </button>
        </div>
        
        <textarea
          className="glass-input"
          style={{ flex: 1, resize: 'none', fontSize: '1rem', lineHeight: '1.6' }}
          value={narrative}
          onChange={e => setNarrative(e.target.value)}
          placeholder="Paste policy documents, stakeholder interview transcripts, or unstructured system descriptions here..."
          disabled={loading}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button 
            className="glass-button primary" 
            onClick={handleExtract} 
            disabled={!narrative.trim() || loading}
          >
            {loading ? <span className="loader"></span> : <Brain size={18} />}
            {loading ? 'Processing via Gemini...' : 'Extract Causal Engine'}
          </button>
        </div>
      </div>
    </div>
  );
}
