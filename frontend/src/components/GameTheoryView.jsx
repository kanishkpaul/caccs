import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ShieldAlert, ArrowRight, Lightbulb } from 'lucide-react';

export default function GameTheoryView({ appState, updateState }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const res = await apiClient.gameAnalysis(
        appState.extraction.stakeholders,
        appState.graph.nodes.filter(n => n.category === 'state').map(n => n.id),
        appState.graph,
        appState.selectedMatch
      );
      updateState('gameAnalysis', res);
    } catch (err) {
      console.error(err);
      alert('Failed game theory analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (!appState.selectedMatch) {
    return (
      <div className="view-container fade-in">
        <div className="view-header"><h1>Game Theory Analysis</h1></div>
        <div className="glass-panel"><p>Match archetypes first.</p></div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Strategic Analysis</h1>
          <p>Analyzing stakeholder equilibria for: <strong style={{textTransform: 'capitalize'}}>{appState.selectedMatch.archetype.replace(/_/g, ' ')}</strong></p>
        </div>
        {!appState.gameAnalysis && (
          <button className="glass-button primary" onClick={handleAnalysis} disabled={loading}>
            {loading ? <span className="loader"></span> : <ShieldAlert size={18} />} Compute Equilibria
          </button>
        )}
        {appState.gameAnalysis && (
          <button className="glass-button primary" onClick={() => navigate('/cdsp')}>
             Generate Formulation <ArrowRight size={18} />
          </button>
        )}
      </div>

      {appState.gameAnalysis && (
        <div className="dashboard-grid">
          <div className="glass-panel">
             <h3>Equilibria Results</h3>
             
             <div style={{ marginTop: '24px' }}>
                <div style={{ padding: '16px', background: 'rgba(248, 81, 73, 0.1)', borderLeft: '4px solid var(--danger)', marginBottom: '16px' }}>
                   <h4 className="text-danger" style={{ margin: 0 }}>Worst Nash Equilibrium</h4>
                   <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>Stakeholders maximize local utility, accelerating resource degradation.</p>
                </div>
                
                <div style={{ padding: '16px', background: 'rgba(63, 185, 80, 0.1)', borderLeft: '4px solid var(--success)' }}>
                   <h4 className="text-success" style={{ margin: 0 }}>Cooperative Solution</h4>
                   <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>Total welfare maximized via central coordination (cDSP target).</p>
                </div>
             </div>
             
             <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <div className="metric-label">Price of Anarchy (PoA)</div>
                <div className="metric-value">{appState.gameAnalysis.price_of_anarchy === Infinity ? '∞' : appState.gameAnalysis.price_of_anarchy.toFixed(2)}</div>
                <p style={{ fontSize: '0.85rem' }}>Ratio of cooperative welfare to worst Nash equilibrium.</p>
             </div>
          </div>
          
          <div className="glass-panel">
            <h3>Mechanism Design Interventions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {appState.gameAnalysis.mechanisms?.map((mech, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                     <Lightbulb size={18} className="text-accent" />
                     <h4 style={{ margin: 0 }}>{mech.name}</h4>
                  </div>
                  <p style={{ fontSize: '0.9rem' }}>{mech.description}</p>
                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Implementation:</strong> {mech.implementation}
                  </div>
                </div>
              ))}
              {(!appState.gameAnalysis.mechanisms || appState.gameAnalysis.mechanisms.length === 0) && (
                 <p>No specific mechanisms suggested for this archetype.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
