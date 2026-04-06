import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Brain, Network, GitMerge, GraduationCap, Code, LineChart } from 'lucide-react';
import NarrativeInput from './components/NarrativeInput';
import CausalGraph from './components/CausalGraph';
import ArchetypeMatch from './components/ArchetypeMatch';
import GameTheoryView from './components/GameTheoryView';
import CDSPView from './components/CDSPView';
import SimulationDashboard from './components/SimulationDashboard';
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
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Brain size={28} color="#58a6ff" />
            <span>CACCS-AI</span>
          </div>
        </div>
        <nav className="nav-menu">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Code size={20} /> Narrative Input
          </NavLink>
          <NavLink to="/graph" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Network size={20} /> Causal Graph
          </NavLink>
          <NavLink to="/archetypes" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <GitMerge size={20} /> Archetypes
          </NavLink>
          <NavLink to="/game-theory" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <GraduationCap size={20} /> Game Theory
          </NavLink>
          <NavLink to="/cdsp" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Code size={20} /> cDSP Generator
          </NavLink>
          <NavLink to="/simulation" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LineChart size={20} /> Simulation
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content fade-in">
        <Routes>
          <Route path="/" element={<NarrativeInput appState={appState} updateState={updateState} />} />
          <Route path="/graph" element={<CausalGraph appState={appState} />} />
          <Route path="/archetypes" element={<ArchetypeMatch appState={appState} updateState={updateState} />} />
          <Route path="/game-theory" element={<GameTheoryView appState={appState} updateState={updateState} />} />
          <Route path="/cdsp" element={<CDSPView appState={appState} updateState={updateState} />} />
          <Route path="/simulation" element={<SimulationDashboard appState={appState} updateState={updateState} />} />
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
