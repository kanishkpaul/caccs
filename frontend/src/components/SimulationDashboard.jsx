import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SimulationDashboard({ appState, updateState }) {
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const config = appState.exampleConfig || {
         horizon: 30,
         policies: ["baseline", "context_aware"],
         initial_state: { battery_soh: 1.0, battery_soc: 1.0, usable_capacity: 200 },
         external_schedule: Array(30).fill({ pv_generation: 300, demand_clinic: 100, demand_households: 250, demand_market: 150 }),
         weight_scenarios: [{ clinic: 0.5, households: 0.3, market: 0.2 }],
         policy_constraints: { context_aware: { linear_constraints: [{ coeffs: [1], rhs: 50 }] } }
      };

      // Since the API expects dynamic eval of the policy, we feed it the saved string
      const stateUpdateFnCode = appState.exampleStateUpdate || `
soh = state.get("battery_soh", 1.0)
capacity = state.get("usable_capacity", 200.0)
discharge = decision.get("battery_discharge", 0)
depth_of_discharge = discharge / capacity if capacity > 0 else 0
degradation_rate = 0.002 * depth_of_discharge
new_soh = max(soh - degradation_rate, 0.0)
new_state = { "battery_soh": new_soh, "battery_soc": 1.0, "usable_capacity": 200 * new_soh }
      `;

      const res = await apiClient.simulate(appState.cdsp, config, stateUpdateFnCode);
      updateState('simulationResults', res.results);
    } catch (err) {
      console.error(err);
      alert('Failed to simulate.');
    } finally {
      setLoading(false);
    }
  };

  if (!appState.cdsp) {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10"><h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Simulation Dashboard</h1></div>
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-16 text-center text-zinc-500"><p>Generate cDSP first.</p></div>
      </div>
    );
  }

  // Formatting chart data
  const chartData = [];
  if (appState.simulationResults) {
    const baseline = appState.simulationResults.find(r => r.policy === 'baseline');
    const ca = appState.simulationResults.find(r => r.policy === 'context_aware');
    
    if (baseline && ca) {
       for (let i = 0; i < baseline.daily_states.length; i++) {
         chartData.push({
            day: i,
            baseline_soh: baseline.daily_states[i].battery_soh * 100,
            context_aware_soh: ca.daily_states[i].battery_soh * 100
         });
       }
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Sandboxed Scipy Simulation</h1>
          <p className="text-zinc-500 font-normal">Solving the cDSP array across a 30-day horizon dynamically incorporating state updates.</p>
        </div>
        <button className="bg-zinc-900 text-white rounded-lg px-5 py-2.5 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={handleSimulate} disabled={loading}>
          {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <Play size={16} />} 
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {appState.simulationResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {appState.simulationResults.map((res, i) => (
              <div key={i} className={`bg-white border ${res.policy === 'context_aware' ? 'border-zinc-900 shadow-md' : 'border-zinc-200 shadow-sm'} rounded-xl p-8`}>
                <h3 className="text-xl font-serif font-medium text-zinc-900 capitalize border-b border-zinc-100 pb-4 mb-6">{res.policy.replace('_', ' ')} Policy</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                     <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Shortfall</span>
                     <span className="text-xl font-mono text-zinc-900">{res.metrics?.total_shortfall?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                     <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Final Health (SOH)</span>
                     <span className={`text-xl font-mono ${res.metrics?.final_state?.battery_soh > 0.9 ? 'text-green-600' : 'text-red-600'}`}>
                       {res.metrics?.final_state?.battery_soh ? (res.metrics.final_state.battery_soh * 100).toFixed(1) + '%' : 'N/A'}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8 h-[500px]">
             <h3 className="text-xl font-serif font-medium text-zinc-900 mb-6">Resource Health Trajectory</h3>
             <ResponsiveContainer width="100%" height="90%">
               <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                 <XAxis dataKey="day" stroke="#a1a1aa" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} />
                 <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" tick={{fill: '#71717a', fontSize: 12}} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e4e4e7', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Legend wrapperStyle={{ paddingTop: '20px' }} />
                 <Line type="monotone" dataKey="baseline_soh" name="Baseline (Worst Nash)" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                 <Line type="monotone" dataKey="context_aware_soh" name="CACCS Policy (Cooperative)" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
