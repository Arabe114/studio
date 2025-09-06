"use client";

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

export type Node = { id: string; group: number; fx?: number | null; fy?: number | null; x?: number; y?: number };
export type Link = { source: string | Node; target: string | Node; value: number };
export type GraphData = { nodes: Node[]; links: Link[] };

interface ForceGraphProps {
  data: GraphData;
  onNodeClick: (node: Node | null) => void;
  selectedNodeId: string | null;
  linkingNodeIds: string[];
  repelStrength: number;
  linkDistance: number;
  centerForce: boolean;
}

export default function ForceGraph({
  data,
  onNodeClick,
  selectedNodeId,
  linkingNodeIds,
  repelStrength,
  linkDistance,
  centerForce
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link>>();

  const { nodes, links } = useMemo(() => {
    const nodesCopy = data.nodes.map(d => ({ ...d }));
    const linksCopy = data.links.map(d => ({ ...d }));
    return { nodes: nodesCopy, links: linksCopy };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.node()!.parentElement!;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = (simulationRef.current = d3
      .forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(repelStrength))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2)));
    
    if (centerForce) {
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    svg.selectAll('.links, .nodes, .labels').remove();
    const linkG = svg.append('g').attr('class', 'links');
    const nodeG = svg.append('g').attr('class', 'nodes');
    const labelG = svg.append('g').attr('class', 'labels');

    const link = linkG
      .selectAll('line')
      .data(links, d => `${(d.source as Node).id}-${(d.target as Node).id}`)
      .join('line')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = nodeG
      .selectAll('circle')
      .data(nodes, d => d.id)
      .join('circle')
      .attr('r', 8)
      .attr('fill', d => color(d.group.toString()))
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      })
      .call(drag(simulation));

    const labels = labelG
      .selectAll('text')
      .data(nodes, d => d.id)
      .join('text')
      .attr('pointer-events', 'none')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.id);

    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
        d3.selectAll('.nodes, .links, .labels').attr('transform', event.transform);
    });
    
    svg.call(zoom as any)
       .on('click', () => onNodeClick(null));

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        svg.attr('width', width).attr('height', height);
        simulation.force('x', d3.forceX(width / 2));
        simulation.force('y', d3.forceY(height / 2));
        if (simulation.force('center')) {
          (simulation.force('center') as d3.ForceCenter<Node>).x(width / 2).y(height / 2);
        }
        simulation.alpha(0.3).restart();
      }
    });

    resizeObserver.observe(container);

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [data, onNodeClick, linkDistance, repelStrength, centerForce]);
  
  // Effect for handling selection
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const nodesSelection = svg.selectAll<SVGCircleElement, Node>('.nodes circle');

    // Reset all nodes
    nodesSelection
       .attr('stroke', 'hsl(var(--card))')
       .attr('stroke-width', 1.5);
    
    // Highlight linking nodes
    if (linkingNodeIds.length > 0) {
        nodesSelection
            .filter(d => linkingNodeIds.includes(d.id))
            .attr('stroke', 'hsl(var(--accent))')
            .attr('stroke-width', 3);
    }
    
    // Highlight primary selected node (overrides linking highlight if it's the first linking node)
    if (selectedNodeId) {
      nodesSelection
        .filter(d => d.id === selectedNodeId)
        .attr('stroke', 'hsl(var(--primary))')
        .attr('stroke-width', 3);
    }
  }, [selectedNodeId, linkingNodeIds]);


  function drag(simulation: d3.Simulation<Node, Link>) {
    function dragstarted(event: d3.D3DragEvent<any, Node, any>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: d3.D3DragEvent<any, Node, any>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: d3.D3DragEvent<any, Node, any>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag<SVGCircleElement, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
}
