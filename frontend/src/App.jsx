import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Brain, Network, GitMerge, GraduationCap, Code, LineChart, Library } from 'lucide-react';
import NarrativeInput from './components/NarrativeInput';
import CausalGraph from './components/CausalGraph';
import ArchetypeMatch from './components/ArchetypeMatch';
import GameTheoryView from './components/GameTheoryView';
import CDSPView from './components/CDSPView';
import SimulationDashboard from './components/SimulationDashboard';
import NarrativesLibrary from './components/NarrativesLibrary';
import Chatbot from './components/Chatbot';

function AppLayout() {
  const [appState, setAppState] = useState({
    narrative: '',
    extraction: null,
    graph: null,
    loops: null,
    matches: null,
    compositions: null,
    gameAnalysis: null,
    cdsp: null,
    simulationResults: null
  });

  const updateState = (key, value) => {
    setAppState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Sunflower Logo" className="w-7 h-7 object-contain rounded-full shadow-sm" />
            <span className="font-serif font-semibold text-lg tracking-tight text-zinc-800">Caccs AI</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto w-full">
          {[
            { to: "/", icon: Code, label: "Narrative Input" },
            { to: "/graph", icon: Network, label: "Causal Graph" },
            { to: "/archetypes", icon: GitMerge, label: "Archetypes" },
            { to: "/game-theory", icon: GraduationCap, label: "Game Theory" },
            { to: "/cdsp", icon: Code, label: "cDSP Generator" },
            { to: "/simulation", icon: LineChart, label: "Simulation" }
          ].map((item) => (
            <NavLink key={item.to} to={item.to} className={({isActive}) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`
            }>
              <item.icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="my-4 h-px bg-zinc-200"></div>
          
          <NavLink to="/library" className={({isActive}) => 
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`
          }>
            <Library size={18} className="shrink-0" />
            <span>Narratives Library</span>
          </NavLink>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<NarrativeInput appState={appState} updateState={updateState} />} />
          <Route path="/graph" element={<CausalGraph appState={appState} />} />
          <Route path="/archetypes" element={<ArchetypeMatch appState={appState} updateState={updateState} />} />
          <Route path="/game-theory" element={<GameTheoryView appState={appState} updateState={updateState} />} />
          <Route path="/cdsp" element={<CDSPView appState={appState} updateState={updateState} />} />
          <Route path="/simulation" element={<SimulationDashboard appState={appState} updateState={updateState} />} />
          <Route path="/library" element={<NarrativesLibrary />} />
        </Routes>
      </main>
      <Chatbot appState={appState} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
