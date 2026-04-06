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
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10"><h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Game Theory Analysis</h1></div>
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-16 text-center text-zinc-500">
          <p>Match archetypes first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Strategic Analysis</h1>
          <p className="text-zinc-500 font-normal">Analyzing stakeholder equilibria for: <strong className="capitalize text-zinc-800">{appState.selectedMatch.archetype.replace(/_/g, ' ')}</strong></p>
        </div>
        {!appState.gameAnalysis && (
          <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={handleAnalysis} disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <ShieldAlert size={16} />} 
            {loading ? 'Evaluating...' : 'Compute Equilibria'}
          </button>
        )}
        {appState.gameAnalysis && (
          <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={() => navigate('/cdsp')}>
             Generate Formulation <ArrowRight size={16} />
          </button>
        )}
      </div>

      {appState.gameAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8">
             <h3 className="text-xl font-serif font-medium text-zinc-900 border-b border-zinc-100 pb-4 mb-6">Equilibria Results</h3>
             
             <div className="flex flex-col gap-4">
                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-md p-5">
                   <h4 className="text-red-700 font-semibold mb-2">Worst Nash Equilibrium</h4>
                   <p className="text-sm text-red-900/80 leading-relaxed">Stakeholders maximize local utility, accelerating resource degradation.</p>
                </div>
                
                <div className="border-l-4 border-green-500 bg-green-50 rounded-r-md p-5">
                   <h4 className="text-green-700 font-semibold mb-2">Cooperative Solution</h4>
                   <p className="text-sm text-green-900/80 leading-relaxed">Total welfare maximized via central coordination (cDSP target).</p>
                </div>
             </div>
             
             <div className="mt-8 text-center py-6 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Price of Anarchy (PoA)</div>
                <div className="text-4xl font-serif text-zinc-900 font-medium mb-3">{appState.gameAnalysis.price_of_anarchy === Infinity ? '∞' : appState.gameAnalysis.price_of_anarchy.toFixed(2)}</div>
                <p className="text-sm text-zinc-500">Ratio of cooperative welfare to worst Nash equilibrium.</p>
             </div>
          </div>
          
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8">
            <h3 className="text-xl font-serif font-medium text-zinc-900 border-b border-zinc-100 pb-4 mb-6">Mechanism Design Interventions</h3>
            <div className="flex flex-col gap-4">
              {appState.gameAnalysis.mechanisms?.map((mech, i) => (
                <div key={i} className="border border-zinc-100 bg-zinc-50 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <Lightbulb size={18} className="text-indigo-500" />
                     <h4 className="font-semibold text-zinc-900">{mech.name}</h4>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">{mech.description}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-200 text-xs text-zinc-500 font-mono">
                    <strong className="text-zinc-700 font-sans">Implementation:</strong> {mech.implementation}
                  </div>
                </div>
              ))}
              {(!appState.gameAnalysis.mechanisms || appState.gameAnalysis.mechanisms.length === 0) && (
                 <p className="text-zinc-500 italic">No specific mechanisms suggested for this archetype.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
