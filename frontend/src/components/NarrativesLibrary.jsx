import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Save, Plus, Edit, Trash2 } from 'lucide-react';

export default function NarrativesLibrary() {
  const [narratives, setNarratives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', narrative: '',
    config: {}, state_update_fn: ''
  });

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
    setFormData({
      title: n.title || '',
      description: n.description || '',
      narrative: n.narrative || '',
      config: n.config || {},
      state_update_fn: n.state_update_fn || ''
    });
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await apiClient.createLibraryEntry(formData);
      } else {
        await apiClient.updateLibraryEntry(editingId, formData);
      }
      setEditingId(null);
      await loadData();
    } catch (e) {
      alert("Failed to save narrative.");
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
    <div className="view-container fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Narratives Library</h1>
          <p>Repository of systemic architectures and causal domain definitions.</p>
        </div>
        <button className="glass-button primary" onClick={() => handleEdit({id: 'new', config: {}})}>
          <Plus size={16} /> New Narrative
        </button>
      </div>

      {editingId ? (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>{editingId === 'new' ? 'Create Narrative' : 'Edit Narrative'}</h3>
          <input className="glass-input" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <input className="glass-input" placeholder="Short Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <textarea className="glass-input" placeholder="Raw Narrative Text..." rows={8} style={{resize: 'vertical'}} value={formData.narrative} onChange={e => setFormData({...formData, narrative: e.target.value})} />
          <textarea className="glass-input" placeholder='Configuration (JSON format)' rows={4} style={{resize: 'vertical'}} value={JSON.stringify(formData.config, null, 2)} onChange={e => {
            try {
              setFormData({...formData, config: JSON.parse(e.target.value)});
            } catch (err) {}
          }} />
          <textarea className="glass-input" placeholder="Python State Update Function" rows={4} style={{resize: 'vertical'}} value={formData.state_update_fn} onChange={e => setFormData({...formData, state_update_fn: e.target.value})} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="glass-button" onClick={() => setEditingId(null)}>Cancel</button>
            <button className="glass-button primary" onClick={handleSave}><Save size={16}/> Save</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {loading ? <p>Loading library...</p> : narratives.map(n => (
            <div key={n.id} className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                <button className="glass-button" style={{ padding: '6px' }} onClick={() => handleEdit(n)}><Edit size={14}/></button>
                <button className="glass-button" style={{ padding: '6px', color: '#ff6b6b' }} onClick={() => handleDelete(n.id)}><Trash2 size={14}/></button>
              </div>
              <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#e2e8f0', fontSize: '1.2rem'}}>{n.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>{n.description}</p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {n.narrative}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
