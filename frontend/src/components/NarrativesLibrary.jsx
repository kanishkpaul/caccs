import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Save, Plus, Edit, Trash2 } from 'lucide-react';

export default function NarrativesLibrary() {
  const [narratives, setNarratives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', narrative: '',
    config: {}, state_update_fn: ''
  });
  const [configString, setConfigString] = useState('{}');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getLibrary();
      setNarratives(res.narratives || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (n) => {
    setEditingId(n.id);
    const cfg = n.config || {};
    setFormData({
      title: n.title || '',
      description: n.description || '',
      narrative: n.narrative || '',
      config: cfg,
      state_update_fn: n.state_update_fn || ''
    });
    setConfigString(JSON.stringify(cfg, null, 2));
  };

  const handleSave = async () => {
    let finalConfig = formData.config;
    try {
      finalConfig = JSON.parse(configString);
    } catch (err) {
      alert("Invalid JSON configuration. Please fix it before saving.");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = { ...formData, config: finalConfig };
      if (editingId === 'new') {
        await apiClient.createLibraryEntry(dataToSave);
      } else {
        await apiClient.updateLibraryEntry(editingId, dataToSave);
      }
      alert("Changes saved to library successfully.");
      setEditingId(null);
      await loadData();
    } catch (e) {
      alert("Failed to save narrative.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this narrative?")) return;
    try {
      await apiClient.deleteLibraryEntry(id);
      await loadData();
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Narratives Library</h1>
          <p className="text-zinc-500 font-normal">A centralized repository of conceptual architectures and causal domain definitions.</p>
        </div>
        <button 
          className="bg-zinc-900 text-white rounded-lg px-4 py-2 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" 
          onClick={() => handleEdit({id: 'new', config: {}})}
        >
          <Plus size={16} /> New Framework
        </button>
      </div>

      {editingId ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8 flex flex-col gap-6">
          <h3 className="text-xl font-serif text-zinc-800 font-medium border-b border-zinc-100 pb-4">{editingId === 'new' ? 'Draft New Narrative' : 'Refine Narrative'}</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <input className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Chronicle Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <input className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Philosophical Premise (Short)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-y" placeholder="Raw Ontological Narrative Text..." rows={8} value={formData.narrative} onChange={e => setFormData({...formData, narrative: e.target.value})} />
          <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-y" placeholder='Configuration (JSON Dict)' rows={4} value={configString} onChange={e => setConfigString(e.target.value)} />
          <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-y" placeholder="Python State Boundary Update Function" rows={4} value={formData.state_update_fn} onChange={e => setFormData({...formData, state_update_fn: e.target.value})} />
          
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
            <button className="px-5 py-2 hover:bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium transition-colors" onClick={() => setEditingId(null)}>Cancel</button>
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${saving ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`} 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <span className="w-4 h-4 border-2 border-zinc-400/20 border-t-zinc-400 rounded-full animate-spin"></span> : <Save size={16}/>}
              {saving ? 'Saving...' : 'Save to Library'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? <p className="text-zinc-400 text-sm italic">Accessing archives...</p> : narratives.map(n => (
            <div key={n.id} className="group relative bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <button className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-md transition-colors" onClick={() => handleEdit(n)}><Edit size={14}/></button>
                <button className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-md transition-colors" onClick={() => handleDelete(n.id)}><Trash2 size={14}/></button>
              </div>
              <h3 className="font-serif font-medium text-lg text-zinc-800 mb-2 pr-12">{n.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">{n.description}</p>
              <div className="bg-zinc-50 px-3 py-2 rounded border border-zinc-100 text-xs font-mono text-zinc-400 truncate">
                {n.narrative}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
