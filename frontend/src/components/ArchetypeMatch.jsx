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
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10"><h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Archetype Matching</h1></div>
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-16 text-center text-zinc-500">
          <p>Extract narrative first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Archetype Identification</h1>
          <p className="text-zinc-500 font-normal">Pattern-matching extracted feedback structures against the 10 canonical Senge archetypes.</p>
        </div>
        {!appState.matches && (
          <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={handleMatch} disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <Search size={16} />} 
            {loading ? 'Analyzing...' : 'Detect Archetypes'}
          </button>
        )}
        {appState.matches && appState.matches.length > 0 && (
          <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={handleNext}>
             Analyze Game Dynamics <ArrowRight size={16} />
          </button>
        )}
      </div>

      {appState.matches && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-zinc-200 shadow-sm rounded-xl p-8">
            <h2 className="text-xl font-serif font-medium text-zinc-900 border-b border-zinc-100 pb-4 mb-6">Top Matches</h2>
            {appState.matches.length === 0 && <p className="text-zinc-500 italic">No specific canonical archetype detected with high confidence.</p>}
            
            <div className="flex flex-col gap-4">
              {appState.matches.map((match, i) => (
                <div key={i} className="border border-zinc-100 bg-zinc-50 rounded-lg p-5 flex items-center shadow-sm">
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium capitalize ${i === 0 ? 'text-zinc-900' : 'text-zinc-600'}`}>
                      {match.archetype.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 bg-zinc-200 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${match.confidence * 100}%` }} className="bg-zinc-900 h-full rounded-full"></div>
                      </div>
                      <span className="text-zinc-600 font-medium text-sm min-w-10">
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {match.semantic_validation && (
                    <div className="ml-8 max-w-xs p-3 bg-white border border-zinc-100 rounded-md">
                       <div className={`flex items-center gap-2 text-sm font-medium ${match.semantic_validation.valid ? 'text-green-600' : 'text-amber-600'}`}>
                          {match.semantic_validation.valid ? 'Semantically Validated' : <><AlertTriangle size={14}/> Semantic Warning</>}
                       </div>
                       <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          {match.semantic_validation.rationale}
                       </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {appState.compositions && appState.compositions.length > 0 && (
             <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8">
               <h2 className="text-xl font-serif font-medium text-zinc-900 border-b border-zinc-100 pb-4 mb-6">Multi-Archetype Compositions</h2>
               <p className="text-amber-600 text-sm font-medium mb-4">The system exhibits compounded complexity.</p>
               {appState.compositions.map((comp, i) => (
                 <div key={i} className="border-l-4 border-amber-400 bg-amber-50 rounded-r-md p-4 mb-4">
                    <h4 className="font-semibold text-amber-900 capitalize text-sm">{comp.archetype_1.replace(/_/g, ' ')} & {comp.archetype_2.replace(/_/g, ' ')}</h4>
                    <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                       <strong>Shared Variables:</strong> {comp.shared_variables.join(', ')}<br/>
                       <strong>Interaction:</strong> Requires manual philosophical classification.
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
