import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Play, Activity, Target, Shield, Users, BarChart3 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import SimulationControls from './SimulationControls';

export default function SimulationDashboard({ appState, updateState }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    horizon: 30,
    policies: ["baseline", "context_aware"],
    initial_state: { battery_soh: 1.0, usable_capacity: 200 },
    external_schedule: Array(90).fill({ solar: 300, demand: 250 }),
    weight_scenarios: [{ clinic: 0.5, households: 0.3, market: 0.2 }],
    policy_constraints: { context_aware: { linear_constraints: [{ coeffs: [1], rhs: 50 }] } }
  });

  const [activeMetric, setActiveMetric] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const stakeholders = appState.game_analysis?.stakeholders || [
    { id: 'clinic', label: 'Clinic/Hospital' },
    { id: 'households', label: 'Local Households' },
    { id: 'market', label: 'Commercial Market' }
  ];

  const handleSimulate = async (currentConfig = config) => {
    setIsSyncing(true);
    try {
      const stateUpdateFnCode = appState.exampleStateUpdate || `
soh = state.get("battery_soh", 1.0)
capacity = state.get("usable_capacity", 200.0)
discharge = decision.get("battery_discharge", 0)
depth_of_discharge = discharge / capacity if capacity > 0 else 0
degradation_rate = 0.002 * depth_of_discharge
new_soh = max(soh - degradation_rate, 0.0)
new_state = { "battery_soh": new_soh, "usable_capacity": 200 * new_soh }
      `;

      const res = await apiClient.simulate(appState.cdsp, currentConfig, stateUpdateFnCode);
      updateState('simulationResults', res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  // Debounced auto-simulate on config change
  useEffect(() => {
    if (!appState.cdsp) return;
    const timer = setTimeout(() => {
      handleSimulate();
    }, 500);
    return () => clearTimeout(timer);
  }, [config, appState.cdsp]);

  // Dynamic Chart Data Processing

  // Dynamic Chart Data Processing
  const processChartData = () => {
    if (!appState.simulationResults) return [];
    
    const baseline = appState.simulationResults.find(r => r.policy === 'baseline');
    const ca = appState.simulationResults.find(r => r.policy === 'context_aware');
    
    if (!baseline || !ca) return [];

    const data = [];
    const horizon = Math.min(baseline.daily_states.length, ca.daily_states.length);
    
    // Find keys to plot (exclude common ones)
    const keys = Object.keys(baseline.daily_states[0] || {}).filter(k => k !== 'id' && k !== 'day');

    for (let i = 0; i < horizon; i++) {
      const entry = { day: i };
      keys.forEach(k => {
        entry[`baseline_${k}`] = baseline.daily_states[i][k];
        entry[`ca_${k}`] = ca.daily_states[i][k];
      });
      data.push(entry);
    }
    return { data, keys };
  };

  const { data: chartData, keys: plotKeys } = processChartData();

  // Radar Data for "Systems Balance"
  const getRadarData = () => {
    if (!appState.simulationResults) return [];
    
    // Convert metrics into normalized 0-100 scales for radar
    return appState.simulationResults.map(res => ({
      subject: res.policy.replace('_', ' ').toUpperCase(),
      Efficiency: 100 - Math.min((res.metrics?.total_shortfall || 0) / 10, 100),
      Equity: 100 - ((res.metrics?.shortfall_gini || 0) * 100),
      Sustainability: (res.metrics?.final_state?.battery_soh || 0) * 100,
      Stability: 100 - Math.min((res.metrics?.shortfall_variance || 0) / 5, 100),
      Resourcefulness: (res.metrics?.total_overachievement || 0) / 10
    }));
  };

  const radarData = getRadarData();

  return (
    <div className="max-w-[1600px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start mb-10 border-b border-zinc-100 pb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-900 rounded-lg shadow-lg shadow-zinc-200">
              <Activity size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium">Advanced Systems Sandbox</h1>
          </div>
          <p className="text-zinc-500 font-normal leading-relaxed text-lg">
            A high-fidelity temporal simulator that operationalizes the cDSP formulation using Scipy's SLSQP solver. 
            Adjust systemic weights and resource constraints to observe the evolution of emergent equilibria.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {isSyncing && (
            <div className="flex items-center gap-2 text-emerald-600 animate-pulse bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest">Syncing Dynamics...</span>
            </div>
          )}
          <button 
            className="group relative bg-zinc-900 text-white rounded-xl px-8 py-4 overflow-hidden transition-all hover:bg-zinc-800 shadow-xl shadow-zinc-200 flex items-center gap-3 text-lg font-medium" 
            onClick={() => handleSimulate()} 
            disabled={isSyncing}
          >
            <div className={`absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out`}></div>
            {isSyncing ? <span className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></span> : <Play size={20} fill="currentColor" />} 
            {isSyncing ? 'Computing...' : 'Execute Full Simulation'}
          </button>
        </div>
      </div>

      {!appState.cdsp ? (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-24 text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
            <Target className="text-zinc-300" size={32} />
          </div>
          <h3 className="text-xl font-serif font-medium text-zinc-900 mb-2">Engine Not Initialized</h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Please refine your narrative and generate a cDSP structure in the preceding stage before initiating temporal analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Controls */}
          <div className="col-span-12 lg:col-span-3">
            <SimulationControls config={config} setConfig={setConfig} stakeholders={stakeholders} />
          </div>

          {/* Main Dashboard */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {appState.simulationResults ? (
              <>
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {appState.simulationResults.map((res, i) => (
                    <div key={i} className={`group relative bg-white border ${res.policy === 'context_aware' ? 'border-zinc-900 shadow-md ring-1 ring-zinc-900/5' : 'border-zinc-200 shadow-sm'} rounded-2xl p-6 transition-all hover:scale-[1.02]`}>
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${res.policy === 'context_aware' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                          {res.policy.replace('_', ' ')}
                        </span>
                        {res.policy === 'context_aware' && <div className="p-1 px-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100 flex items-center gap-1"><Shield size={10}/> OPTIMAL</div>}
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-400 font-bold uppercase tracking-tighter mb-1">Total System Shortfall</span>
                          <span className="text-3xl font-mono text-zinc-900">{(res.metrics?.total_shortfall || 0).toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                           <div className={`h-full ${res.policy === 'context_aware' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.max(10, 100 - (res.metrics?.total_shortfall || 0)/5)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Radar Summary Card */}
                  <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl shadow-zinc-200 overflow-hidden relative">
                    <h3 className="text-white font-serif text-lg mb-4 flex items-center gap-2"><BarChart3 size={18}/> Systems Balance</h3>
                    <div className="h-40 -mx-4 -mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#333" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#777', fontSize: 8}} />
                          <Radar name="Context Aware" dataKey="Efficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                          <Radar name="Baseline" dataKey="Stability" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Primary Trajectory Chart */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-8">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-50">
                    <div>
                      <h3 className="text-xl font-serif font-medium text-zinc-900">Dynamic Trajectory Analysis</h3>
                      <p className="text-sm text-zinc-500">Cross-policy comparison of detected state variables over the temporal horizon.</p>
                    </div>
                    <div className="flex gap-2">
                       {plotKeys.map(k => (
                         <button key={k} onClick={() => setActiveMetric(k)} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${k === activeMetric ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>
                           {k.replace('_', ' ').toUpperCase()}
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="day" stroke="#a1a1aa" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} label={{ value: 'Simulation Day', position: 'bottom', offset: -10, fontSize: 10, fill: '#aaa' }} />
                        <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="top" height={36}/>
                        {plotKeys.map((k, idx) => {
                          if (activeMetric && activeMetric !== k) return null;
                          return (
                            <React.Fragment key={k}>
                              <Line type="monotone" dataKey={`ca_${k}`} name={`Optimal ${k}`} stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={1000} />
                              <Line type="monotone" dataKey={`baseline_${k}`} name={`Baseline ${k}`} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} animationDuration={1500} />
                            </React.Fragment>
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-24 text-center">
                <div className="mx-auto w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                  <Play className="text-zinc-300 ml-1" size={24} />
                </div>
                <h3 className="text-lg font-serif font-medium text-zinc-900 mb-2">Ready for Execution</h3>
                <p className="text-zinc-500 mb-0 max-w-xs mx-auto">Click the button above to run the multi-policy temporal simulation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
