"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type Node = { id: string; group: number };
type Link = { source: string; target: string; value: number };
type GraphData = { nodes: Node[]; links: Link[] };

const data: GraphData = {
  nodes: [
    { id: 'Project A', group: 1 },
    { id: 'Team Lead', group: 1 },
    { id: 'Task 1.1', group: 1 },
    { id: 'Task 1.2', group: 1 },
    { id: 'Project B', group: 2 },
    { id: 'Developer X', group: 2 },
    { id: 'Task 2.1', group: 2 },
    { id: 'Bug Report', group: 3 },
    { id: 'QA Tester', group: 3 },
    { id: 'Documentation', group: 4 },
  ],
  links: [
    { source: 'Project A', target: 'Team Lead', value: 1 },
    { source: 'Team Lead', target: 'Task 1.1', value: 8 },
    { source: 'Team Lead', target: 'Task 1.2', value: 3 },
    { source: 'Project B', target: 'Developer X', value: 1 },
    { source: 'Developer X', target: 'Task 2.1', value: 5 },
    { source: 'Developer X', target: 'Bug Report', value: 1 },
    { source: 'Bug Report', target: 'QA Tester', value: 1 },
    { source: 'Project A', target: 'Documentation', value: 2 },
    { source: 'Project B', target: 'Documentation', value: 2 },
    { source: 'Task 1.1', target: 'Task 2.1', value: 1 },
  ],
};

interface ForceGraphProps {
  repelStrength: number;
  linkDistance: number;
  centerForce: boolean;
}

export default function ForceGraph({ repelStrength, linkDistance, centerForce }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined>>();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.node()!.parentElement!;
    
    let width = container.clientWidth;
    let height = container.clientHeight;

    svg.selectAll('*').remove();

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY());
      
    simulationRef.current = simulation;

    const g = svg.append('g');
    
    const link = g
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = g
      .append('g')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', d => color(d.group.toString()))
      .call(drag(simulation) as any);

    const labels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr('pointer-events', 'none')
      .attr("fill", "hsl(var(--foreground))")
      .attr("font-size", "10px")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y);

      labels
        .attr("x", d => (d as any).x)
        .attr("y", d => (d as any).y);
    });

    function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
      function dragstarted(event: d3.D3DragEvent<any, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: d3.D3DragEvent<any, any, any>, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<any, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
        g.attr('transform', event.transform);
    });
    svg.call(zoom);

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        svg.attr('width', width).attr('height', height);
        
        if(centerForce) {
            simulation.force('center', d3.forceCenter(width / 2, height / 2));
        } else {
            simulation.force('center', null);
        }
        simulation.alpha(0.3).restart();
      }
    });

    resizeObserver.observe(container);

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (simulationRef.current) {
      const simulation = simulationRef.current;
      simulation.force('charge', d3.forceManyBody().strength(repelStrength));
      (simulation.force('link') as d3.ForceLink<any, any>).distance(linkDistance);
      
      const container = svgRef.current!.parentElement!;
      const width = container.clientWidth;
      const height = container.clientHeight;

      if(centerForce) {
          simulation.force('center', d3.forceCenter(width / 2, height / 2));
      } else {
          simulation.force('center', null);
      }
      
      simulation.alpha(0.3).restart();
    }
  }, [repelStrength, linkDistance, centerForce]);


  return <svg ref={svgRef} width="100%" height="100%"></svg>;
}
