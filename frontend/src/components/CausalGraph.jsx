import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { ArrowRight, Maximize2, MousePointer2 } from 'lucide-react';

export default function CausalGraph({ appState }) {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!appState.graph || !svgRef.current) return;

    const container = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 700;
    
    container.selectAll('*').remove();
    
    const svg = container
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', height)
      .style('cursor', 'grab');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Definitions for arrowheads
    const defs = g.append('defs');
    defs.append('marker')
      .attr('id', 'arrowend')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30) // Adjusted for curves and node size
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#d4d4d8');

    const nodes = JSON.parse(JSON.stringify(appState.graph.nodes || []));
    const links = JSON.parse(JSON.stringify(appState.graph.edges || []));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(220))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(80));

    // Curved Links
    const link = g.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#e4e4e7')
      .attr('stroke-width', 2.5)
      .attr('marker-end', 'url(#arrowend)')
      .attr('stroke-dasharray', d => d.delay !== 'none' ? '6,6' : 'none')
      .attr('opacity', 0.6);

    // Link labels (polarity)
    const linkLabels = g.append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    linkLabels.append('circle')
      .attr('r', 10)
      .attr('fill', 'white')
      .attr('stroke', '#f4f4f5');

    linkLabels.append('text')
      .text(d => d.polarity)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.polarity === '+' ? '#10b981' : '#ef4444');

    const categoryColors = {
      state: '#3b82f6',
      flow: '#10b981',
      decision: '#f59e0b',
      external: '#71717a',
      outcome: '#f43f5e'
    };

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(drag(simulation));

    node.append('circle')
      .attr('r', 22)
      .attr('fill', d => categoryColors[d.category] || '#fff')
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.05))');

    // Label background
    node.append('rect')
      .attr('x', 28)
      .attr('y', -10)
      .attr('width', d => (d.label?.length || 0) * 7 + 10)
      .attr('height', 20)
      .attr('rx', 4)
      .attr('fill', 'white')
      .attr('opacity', 0.8);

    node.append('text')
      .text(d => d.label)
      .attr('x', 33)
      .attr('y', 4)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#18181b')
      .attr('font-family', 'Inter, system-ui, sans-serif');

    simulation.on('tick', () => {
      // Calculate curved paths
      link.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve intensity
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      linkLabels.attr('transform', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        
        // Midpoint calculation for the arc
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        
        // Offset logic to place label on the curve
        const invMag = 1 / Math.sqrt(dx*dx + dy*dy);
        const offsetX = -dy * invMag * (dr * 0.1);
        const offsetY = dx * invMag * (dr * 0.1);
        
        return `translate(${midX + offsetX}, ${midY + offsetY})`;
      });
    });

    // Initial positioning
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale(0.8)
    );

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
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Causal Engine Visualization</h1>
        </div>
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-24 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Maximize2 className="text-zinc-300" size={32} />
          </div>
          <h3 className="text-xl font-serif font-medium text-zinc-900 mb-2">No Active Graph</h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Upload or refine a system narrative to synthesize its underlying causal dependencies.</p>
          <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200" onClick={() => navigate('/')}>
            Begin Synthesis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-10 pb-8 border-b border-zinc-100">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 tracking-tight font-medium mb-3">Socio-Technical Causal Engine</h1>
          <p className="text-zinc-500 font-normal text-lg">
            Navigable structure showing {appState.graph.nodes?.length} variables and {appState.graph.edges?.length} interactions.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-500">
            <MousePointer2 size={14} /> Scroll to Zoom | Drag to Inspect
          </div>
          <button className="bg-zinc-900 text-white rounded-xl px-6 py-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-3 text-sm font-medium" onClick={() => navigate('/archetypes')}>
            Match System Archetypes <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden relative" style={{ height: '700px' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }}></svg>
        
        {/* Legend Overlay */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3 p-5 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-2xl">
           <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-100 pb-2">VARIABLE ONTOLOGY</h4>
           <div className="flex items-center gap-3 text-xs font-medium text-zinc-700"><span className="w-4 h-4 rounded-full bg-blue-500 shadow-sm border-2 border-white"></span> System State</div>
           <div className="flex items-center gap-3 text-xs font-medium text-zinc-700"><span className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm border-2 border-white"></span> Dynamic Flow</div>
           <div className="flex items-center gap-3 text-xs font-medium text-zinc-700"><span className="w-4 h-4 rounded-full bg-amber-500 shadow-sm border-2 border-white"></span> Human Decision</div>
           <div className="flex items-center gap-3 text-xs font-medium text-zinc-700"><span className="w-4 h-4 rounded-full bg-rose-500 shadow-sm border-2 border-white"></span> Final Outcome</div>
           <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center gap-3 text-[10px] text-zinc-400 italic">
             <div className="w-8 h-0.5 bg-zinc-200 border-t-2 border-dashed border-zinc-400"></div> Delayed Feedback
           </div>
        </div>
      </div>
    </div>
  );
}
