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
      <div className="view-container fade-in">
        <div className="view-header"><h1>Simulation Dashboard</h1></div>
        <div className="glass-panel"><p>Generate cDSP first.</p></div>
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
    <div className="view-container fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Sandboxed Scipy Simulation</h1>
          <p>Solving the cDSP array across a 30-day horizon dynamically incorporating state updates.</p>
        </div>
        <button className="glass-button primary" onClick={handleSimulate} disabled={loading}>
          {loading ? <span className="loader"></span> : <Play size={18} />} Run Simulation
        </button>
      </div>

      {appState.simulationResults && (
        <>
          <div className="dashboard-grid">
            {appState.simulationResults.map((res, i) => (
              <div key={i} className="glass-panel" style={{ borderColor: res.policy === 'context_aware' ? 'var(--accent)' : 'var(--panel-border)' }}>
                <h3 style={{ textTransform: 'capitalize' }}>{res.policy.replace('_', ' ')} Policy</h3>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="metric-card">
                     <span className="metric-label">Total Shortfall (Deviation)</span>
                     <span className="metric-value">{res.metrics?.total_shortfall?.toFixed(2)}</span>
                  </div>
                  <div className="metric-card">
                     <span className="metric-label">Final Resource Health (SOH)</span>
                     <span className={`metric-value ${res.metrics?.final_state?.battery_soh > 0.9 ? 'text-success' : 'text-danger'}`}>
                       {res.metrics?.final_state?.battery_soh ? (res.metrics.final_state.battery_soh * 100).toFixed(1) + '%' : 'N/A'}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ height: '400px', padding: '24px', marginTop: '24px' }}>
             <h3>Battery State of Health Trajectory</h3>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                 <XAxis dataKey="day" stroke="var(--text-secondary)" />
                 <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" />
                 <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }} />
                 <Legend />
                 <Line type="monotone" dataKey="baseline_soh" name="Baseline (Worst Nash)" stroke="var(--danger)" strokeWidth={3} dot={false} />
                 <Line type="monotone" dataKey="context_aware_soh" name="CACCS Policy (Cooperative)" stroke="var(--success)" strokeWidth={3} dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
