import React from 'react';
import { Sliders, Zap, Shield, Users } from 'lucide-react';

export default function SimulationControls({ config, setConfig, stakeholders }) {
  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const handleWeightChange = (sId, value) => {
    const newWeights = { ...config.weight_scenarios[0], [sId]: parseFloat(value) };
    setConfig({ ...config, weight_scenarios: [newWeights] });
  };

  const weights = config.weight_scenarios[0] || {};

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col gap-8 h-full">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
        <Sliders size={18} className="text-zinc-900" />
        <h3 className="font-serif font-medium text-zinc-900">Control Parameters</h3>
      </div>

      <div className="space-y-6">
        {/* Temporal Horizon */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={12} /> Temporal Horizon
            </label>
            <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">{config.horizon} Days</span>
          </div>
          <input 
            type="range" min="7" max="90" step="1" 
            value={config.horizon} 
            onChange={(e) => handleChange('horizon', parseInt(e.target.value))}
            className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Initial Resource Health */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={12} /> Resource Reserve
            </label>
            <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">{(config.initial_state?.usable_capacity || 0).toFixed(0)} kWh</span>
          </div>
          <input 
            type="range" min="50" max="500" step="10" 
            value={config.initial_state?.usable_capacity || 200} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setConfig({
                ...config,
                initial_state: { ...config.initial_state, usable_capacity: val, battery_soh: val/200 }
              });
            }}
            className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Stakeholder Priorities */}
        <div className="space-y-4 pt-4 border-t border-zinc-50">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users size={12} /> Stakeholder Priorities
          </label>
          
          {stakeholders.map(s => (
            <div key={s.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-700 font-medium">{s.label || s.id}</span>
                <span className="text-xs font-mono text-zinc-500">{(weights[s.id] || 0).toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.1" max="5" step="0.1" 
                value={weights[s.id] || 1.0} 
                onChange={(e) => handleWeightChange(s.id, e.target.value)}
                className="w-full accent-zinc-600 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-100">
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-[10px] text-zinc-500 leading-relaxed italic">
          Priorities directly modify the cDSP objective function. Higher values enforce stricter compliance for that stakeholder's goals.
        </div>
      </div>
    </div>
  );
}
