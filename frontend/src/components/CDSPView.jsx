import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ArrowRight, CodeSquare } from 'lucide-react';
// KaTeX
import katex from 'katex';

export default function CDSPView({ appState, updateState }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.generateCdsp(
        appState.selectedMatch,
        appState.graph,
        appState.extraction.stakeholders,
        appState.gameAnalysis
      );
      updateState('cdsp', res.cdsp);
    } catch (err) {
      console.error(err);
      alert('Failed to generate cDSP.');
    } finally {
      setLoading(false);
    }
  };

  const renderMath = (text) => {
    try {
      return { __html: katex.renderToString(text, { throwOnError: false }) };
    } catch(e) {
      return { __html: text };
    }
  };

  if (!appState.gameAnalysis) {
    return (
      <div className="view-container fade-in">
        <div className="view-header"><h1>cDSP Formulation</h1></div>
        <div className="glass-panel"><p>Analyze game theory first.</p></div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Compromise Decision Support Problem (cDSP)</h1>
          <p>Auto-generated mathematical formulation translated from {appState.selectedMatch.archetype.replace(/_/g, ' ')} structure.</p>
        </div>
        {!appState.cdsp && (
          <button className="glass-button primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <span className="loader"></span> : <CodeSquare size={18} />} Generate cDSP
          </button>
        )}
        {appState.cdsp && (
          <button className="glass-button primary" onClick={() => navigate('/simulation')}>
             Run Sandboxed Simulation <ArrowRight size={18} />
          </button>
        )}
      </div>

      {appState.cdsp && (
        <div className="glass-panel" style={{ fontSize: '1.1rem' }}>
           <h2 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              <strong>Given</strong>
           </h2>
           <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
              <li><strong>State Variables:</strong> {appState.cdsp.given.state_variables.join(', ')}</li>
              <li><strong>External Inputs:</strong> {appState.cdsp.given.external_inputs.join(', ')}</li>
              <li><strong>Stakeholders:</strong> {appState.cdsp.given.stakeholders.join(', ')}</li>
           </ul>

           <h2 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              <strong>Find</strong>
           </h2>
           <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
              <li><strong>Decision Variables:</strong> {appState.cdsp.find.decision_variables.join(', ')}</li>
              <li><strong>Deviation Variables:</strong> {Object.keys(appState.cdsp.find.deviation_variables).join(', ')}</li>
           </ul>

           <h2 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              <strong>Satisfy</strong>
           </h2>
           <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: 'var(--text-secondary)' }}>Goals</h4>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                 {appState.cdsp.satisfy.goals.map((g, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>
                       <em>{g.description}:</em> <span dangerouslySetInnerHTML={renderMath(g.equation)} />
                    </li>
                 ))}
              </ul>
              
              <h4 style={{ color: 'var(--text-secondary)' }}>Constraints</h4>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px', color: 'var(--warning)' }}>
                 {appState.cdsp.satisfy.constraints.map((c, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>
                       <em>{c.description}:</em> {c.equation}
                    </li>
                 ))}
                 {appState.cdsp.mechanism_adjustments?.map((m, i) => (
                    <li key={'m'+i} style={{ marginBottom: '8px' }}>
                       <em>{m.description}:</em> {m.constraint}
                    </li>
                 ))}
              </ul>
           </div>

           <h2 style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              <strong>Minimize</strong>
           </h2>
           <div style={{ padding: '16px', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '8px' }}>
              <span dangerouslySetInnerHTML={renderMath("Z = " + appState.cdsp.minimize)} />
           </div>
        </div>
      )}
    </div>
  );
}
