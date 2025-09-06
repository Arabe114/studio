"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export type Node = { id: string; group: number };
export type Link = { source: string | Node; target: string | Node; value: number };
export type GraphData = { nodes: Node[]; links: Link[] };

interface ForceGraphProps {
  data: GraphData;
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
  repelStrength: number;
  linkDistance: number;
  centerForce: boolean;
}

export default function ForceGraph({ data, onNodeClick, selectedNodeId, repelStrength, linkDistance, centerForce }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined>>();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.node()!.parentElement!;
    
    let width = container.clientWidth;
    let height = container.clientHeight;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = simulationRef.current || d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    simulationRef.current = simulation;
    
    svg.selectAll('.links, .nodes, .labels').remove();
    const linkG = svg.append('g').attr('class', 'links');
    const nodeG = svg.append('g').attr('class', 'nodes');
    const labelG = svg.append('g').attr('class', 'labels');

    function update() {
        const links = data.links.map(d => ({ ...d }));
        const nodes = data.nodes.map(d => ({ ...d }));

        simulation.nodes(nodes as d3.SimulationNodeDatum[]);
        (simulation.force('link') as d3.ForceLink<any, any>).links(links);
        
        const link = linkG
          .selectAll('line')
          .data(links, (d:any) => `${(d.source as any).id}-${(d.target as any).id}`)
          .join('line')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.sqrt((d as any).value));

        const node = nodeG
          .selectAll('circle')
          .data(nodes, (d:any) => d.id)
          .join('circle')
          .attr('r', 8)
          .attr('fill', d => color(d.group.toString()))
          .attr('stroke', 'hsl(var(--background))')
          .attr('stroke-width', 1.5)
          .on('click', (event, d) => {
            onNodeClick(d.id);
            event.stopPropagation();
          })
          .call(drag(simulation) as any);

        node.filter(d => d.id === selectedNodeId)
            .attr('stroke', 'hsl(var(--primary))')
            .attr('stroke-width', 3);
        
        const labels = labelG.selectAll("text")
          .data(nodes, (d:any) => d.id)
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

        simulation.alpha(0.3).restart();
    }
    
    update();
    
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
        d3.selectAll('.nodes, .links, .labels').attr('transform', event.transform);
    });
    
    svg.call(zoom as any)
       .on('click', () => onNodeClick(null as any));;

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
  }, [data, onNodeClick]);

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
  
  useEffect(() => {
    const node = d3.select(svgRef.current).selectAll('circle');
    node.attr('stroke', 'hsl(var(--background))').attr('stroke-width', 1.5);
    node.filter((d: any) => d.id === selectedNodeId)
        .attr('stroke', 'hsl(var(--primary))')
        .attr('stroke-width', 3);
  }, [selectedNodeId]);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
}
