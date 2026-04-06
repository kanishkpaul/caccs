import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const apiClient = {
  extract: async (narrative) => {
    const res = await api.post('/extract', { narrative });
    return res.data;
  },
  
  matchArchetypes: async (graph, loops) => {
    const res = await api.post('/match-archetypes', { graph, loops });
    return res.data;
  },
  
  gameAnalysis: async (stakeholders, shared_resources, graph, archetype_match) => {
    const res = await api.post('/game-analysis', { 
        stakeholders, shared_resources, graph, archetype_match 
    });
    return res.data;
  },
  
  generateCdsp: async (archetype_match, graph, stakeholders, game_analysis) => {
    const res = await api.post('/generate-cdsp', {
        archetype_match, graph, stakeholders, game_analysis
    });
    return res.data;
  },
  
  simulate: async (cdsp, config, state_update_fn) => {
    const res = await api.post('/simulate', {
        cdsp, config, state_update_fn
    });
    return res.data;
  },
  
  getExamples: async () => {
    const res = await api.get('/examples');
    return res.data;
  },
  
  chat: async (prompt, history, context) => {
    const res = await api.post('/chat', { prompt, history, context });
    return res.data;
  }
};
