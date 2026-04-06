import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ArchetypeMatch({ appState, updateState }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMatch = async () => {
    setLoading(true);
    try {
      const res = await apiClient.matchArchetypes(appState.graph, appState.loops);
      updateState('matches', res.matches);
      updateState('compositions', res.compositions);
    } catch (err) {
      console.error(err);
      alert('Failed to match archetypes.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Only proceed to Game Theory if we have at least one match
    if (appState.matches && appState.matches.length > 0) {
      updateState('selectedMatch', appState.matches[0]);
      navigate('/game-theory');
    }
  };

  if (!appState.graph) {
    return (
      <div className="view-container fade-in">
        <div className="view-header"><h1>Archetype Matching</h1></div>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <p>Extract narrative first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Archetype Identification</h1>
          <p>Pattern-matching extracted feedback structures against the 10 canonical Senge archetypes.</p>
        </div>
        {!appState.matches && (
          <button className="glass-button primary" onClick={handleMatch} disabled={loading}>
            {loading ? <span className="loader"></span> : <Search size={18} />} Detect Archetypes
          </button>
        )}
        {appState.matches && appState.matches.length > 0 && (
          <button className="glass-button primary" onClick={handleNext}>
             Analyze Game Dynamics <ArrowRight size={18} />
          </button>
        )}
      </div>

      {appState.matches && (
        <div className="dashboard-grid">
          <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
            <h2>Top Matches</h2>
            {appState.matches.length === 0 && <p>No specific canonical archetype detected with high confidence.</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appState.matches.map((match, i) => (
                <div key={i} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ textTransform: 'capitalize', color: i === 0 ? 'var(--accent)' : 'inherit' }}>
                      {match.archetype.replace(/_/g, ' ')}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px' }}>
                        <div style={{ width: `${match.confidence * 100}%`, background: 'var(--success)', height: '100%', borderRadius: '4px' }}></div>
                      </div>
                      <span className="text-secondary" style={{ fontSize: '14px', minWidth: '40px' }}>
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {match.semantic_validation && (
                    <div style={{ marginLeft: '32px', maxWidth: '300px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: match.semantic_validation.valid ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                          {match.semantic_validation.valid ? 'Semantically Validated' : <><AlertTriangle size={16}/> Semantic Warning</>}
                       </div>
                       <p style={{ fontSize: '0.85rem', marginTop: '6px', marginBottom: 0 }}>
                          {match.semantic_validation.rationale}
                       </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {appState.compositions && appState.compositions.length > 0 && (
             <div className="glass-panel">
               <h2>Multi-Archetype Compositions</h2>
               <p className="text-warning" style={{ fontSize: '0.9rem' }}>The system exhibits compounded complexity.</p>
               {appState.compositions.map((comp, i) => (
                 <div key={i} style={{ marginTop: '16px', padding: '12px', borderLeft: '3px solid var(--warning)', background: 'rgba(210, 153, 34, 0.05)' }}>
                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{comp.archetype_1.replace(/_/g, ' ')} & {comp.archetype_2.replace(/_/g, ' ')}</h4>
                    <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                       <strong>Shared Variables:</strong> {comp.shared_variables.join(', ')}<br/>
                       <strong>Interaction:</strong> Cannot resolve safely yet, requires Gemini classification.
                    </p>
                 </div>
               ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}
