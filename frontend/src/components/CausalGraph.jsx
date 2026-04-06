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
      .attr('fill', 'var(--text-secondary)');

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
      .attr('stroke', 'var(--panel-border)')
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
      .attr('fill', d => d.polarity === '+' ? 'var(--success)' : 'var(--danger)')
      .attr('dy', -5);

    const categoryColors = {
      state: '#58a6ff',
      flow: '#3fb950',
      decision: '#d29922',
      external: '#8b949e',
      outcome: '#f85149'
    };

    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 16)
      .attr('fill', d => categoryColors[d.category] || '#fff')
      .call(drag(simulation));

    // Node labels
    const nodeLabels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('fill', 'var(--text-primary)')
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
      <div className="view-container fade-in">
        <div className="view-header">
          <h1>Causal Loop Diagram</h1>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <p>Extract a narrative first to see the Causal Loop Diagram.</p>
          <button className="glass-button" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>
            Go to Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Causal Loop Diagram</h1>
          <p>Extracted variables: {appState.graph.nodes?.length} | Relationships: {appState.graph.edges?.length} | Feedback Loops: {appState.loops?.length}</p>
        </div>
        <button className="glass-button primary" onClick={() => navigate('/archetypes')}>
          Find Archetypes <ArrowRight size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '600px', display: 'block' }}></svg>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', padding: '0 16px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#58a6ff'}}></span> State</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3fb950'}}></span> Flow</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d29922'}}></span> Decision</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f85149'}}></span> Outcome</div>
      </div>
    </div>
  );
}
