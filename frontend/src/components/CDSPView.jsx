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
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10"><h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">cDSP Formulation</h1></div>
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-16 text-center text-zinc-500"><p>Analyze game theory first.</p></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Compromise Decision Support Problem</h1>
          <p className="text-zinc-500 font-normal">Auto-generated mathematical formulation translated from the <strong className="capitalize text-zinc-800">{appState.selectedMatch.archetype.replace(/_/g, ' ')}</strong> structure.</p>
        </div>
        {!appState.cdsp && (
          <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={handleGenerate} disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <CodeSquare size={16} />} 
            {loading ? 'Generating...' : 'Formulate cDSP'}
          </button>
        )}
        {appState.cdsp && (
          <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={() => navigate('/simulation')}>
             Run Sandboxed Simulation <ArrowRight size={16} />
          </button>
        )}
      </div>

      {appState.cdsp && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-10 font-serif text-lg leading-relaxed text-zinc-800">
           
           <div className="mb-8 border-b border-zinc-100 pb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900">Given</h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-700">
                 <li><strong className="text-zinc-900 font-sans text-sm tracking-wider uppercase mr-2">State Variables:</strong> {appState.cdsp.given.state_variables.join(', ')}</li>
                 <li><strong className="text-zinc-900 font-sans text-sm tracking-wider uppercase mr-2">External Inputs:</strong> {appState.cdsp.given.external_inputs.join(', ')}</li>
                 <li><strong className="text-zinc-900 font-sans text-sm tracking-wider uppercase mr-2">Stakeholders:</strong> {appState.cdsp.given.stakeholders.join(', ')}</li>
              </ul>
           </div>

           <div className="mb-8 border-b border-zinc-100 pb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900">Find</h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-700">
                 <li><strong className="text-zinc-900 font-sans text-sm tracking-wider uppercase mr-2">Decision Variables:</strong> {appState.cdsp.find.decision_variables.join(', ')}</li>
                 <li><strong className="text-zinc-900 font-sans text-sm tracking-wider uppercase mr-2">Deviation Variables:</strong> {Object.keys(appState.cdsp.find.deviation_variables).join(', ')}</li>
              </ul>
           </div>

           <div className="mb-8 border-b border-zinc-100 pb-8">
              <h2 className="text-2xl font-semibold mb-6 text-zinc-900">Satisfy</h2>
              <div className="pl-4">
                 <h4 className="text-sm font-bold tracking-widest uppercase text-zinc-400 mb-4 font-sans">Goals</h4>
                 <ul className="space-y-4 mb-8">
                    {appState.cdsp.satisfy.goals.map((g, i) => (
                       <li key={i} className="flex flex-col">
                          <em className="text-zinc-500 mb-2">{g.description}:</em> 
                          <div className="bg-zinc-50 py-3 px-4 rounded-md border border-zinc-100 shadow-sm overflow-x-auto text-base">
                            <span dangerouslySetInnerHTML={renderMath(g.equation)} />
                          </div>
                       </li>
                    ))}
                 </ul>
                 
                 <h4 className="text-sm font-bold tracking-widest uppercase text-zinc-400 mb-4 font-sans">Constraints</h4>
                 <ul className="space-y-3 pl-4 border-l-2 border-indigo-200">
                    {appState.cdsp.satisfy.constraints.map((c, i) => (
                       <li key={i} className="text-zinc-700 text-base">
                          <em className="text-indigo-600 font-normal mr-2">{c.description}:</em> <span className="font-mono bg-zinc-50 px-2 py-1 rounded text-sm">{c.equation}</span>
                       </li>
                    ))}
                    {appState.cdsp.mechanism_adjustments?.map((m, i) => (
                       <li key={'m'+i} className="text-zinc-700 text-base">
                          <em className="text-indigo-600 font-normal mr-2">{m.description}:</em> <span className="font-mono bg-zinc-50 px-2 py-1 rounded text-sm">{m.constraint}</span>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

           <div>
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900">Minimize</h2>
              <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-inner text-center overflow-x-auto text-xl">
                 <span dangerouslySetInnerHTML={renderMath("Z = " + appState.cdsp.minimize)} />
              </div>
           </div>
           
        </div>
      )}
    </div>
  );
}
