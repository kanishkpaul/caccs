import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { ArrowRight, Search } from 'lucide-react';

export default function CausalGraph({ appState }) {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!appState.graph || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 600;
    
    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Definitions for arrowheads
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowend')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#a1a1aa');

    const nodes = JSON.parse(JSON.stringify(appState.graph.nodes || []));
    const links = JSON.parse(JSON.stringify(appState.graph.edges || []));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40));

    // Links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e4e4e7')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowend)')
      .attr('stroke-dasharray', d => d.delay !== 'none' ? '5,5' : 'none');

    // Link labels (polarity)
    const linkLabels = svg.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .text(d => d.polarity)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.polarity === '+' ? '#10b981' : '#ef4444')
      .attr('dy', -5);

    const categoryColors = {
      state: '#3b82f6',
      flow: '#22c55e',
      decision: '#eab308',
      external: '#71717a',
      outcome: '#ef4444'
    };

    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 16)
      .attr('fill', d => categoryColors[d.category] || '#fff')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))')
      .call(drag(simulation));

    // Node labels
    const nodeLabels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#3f3f46')
      .attr('dx', 20)
      .attr('dy', 5);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

  }, [appState.graph]);

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  if (!appState.graph) {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10">
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Causal Loop Diagram</h1>
        </div>
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-16 text-center text-zinc-500">
          <p>Extract a narrative first to see the Causal Loop Diagram.</p>
          <button className="mt-4 px-4 py-2 border border-zinc-200 rounded-md text-zinc-700 hover:bg-zinc-50 transition-colors" onClick={() => navigate('/')}>
            Go to Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Causal Loop Diagram</h1>
          <p className="text-zinc-500 font-normal">Extracted variables: {appState.graph.nodes?.length} | Relationships: {appState.graph.edges?.length} | Feedback Loops: {appState.loops?.length}</p>
        </div>
        <button className="bg-zinc-900 text-white rounded-lg px-4 py-2 hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium" onClick={() => navigate('/archetypes')}>
          Find Archetypes <ArrowRight size={16} />
        </button>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden p-0 relative">
        <svg ref={svgRef} style={{ width: '100%', height: '600px', display: 'block' }}></svg>
      </div>
      
      <div className="flex gap-6 mt-6 px-4">
         <div className="flex items-center gap-2 text-sm text-zinc-600"><span className="w-3 h-3 rounded-full bg-blue-500"></span> State</div>
         <div className="flex items-center gap-2 text-sm text-zinc-600"><span className="w-3 h-3 rounded-full bg-green-500"></span> Flow</div>
         <div className="flex items-center gap-2 text-sm text-zinc-600"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Decision</div>
         <div className="flex items-center gap-2 text-sm text-zinc-600"><span className="w-3 h-3 rounded-full bg-red-500"></span> Outcome</div>
      </div>
    </div>
  );
}
