'use client';

import dynamic from 'next/dynamic';
import { GraphData, GraphNode } from '@/types';
import { useMemo } from 'react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">Loading Graph...</div>
});

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
}

const GraphVisualization = ({ data, onNodeClick }: GraphVisualizationProps) => {
  // Memoize data to prevent unnecessary re-renders if the object reference changes but content is same
  // However, react-force-graph modifies the data object (adds x, y, vx, vy), so we should be careful.
  // We'll pass data directly for now.

  const getNodeLabel = (node: any) => {
    if (node.type === 'paper') {
      // Truncate paper title to first 40 characters
      const title = node.label || '';
      return title.length > 40 ? title.substring(0, 40) + '...' : title;
    } else {
      // For authors, extract last name
      const name = node.label || '';
      const parts = name.split(' ');
      return parts[parts.length - 1]; // Return last name
    }
  };

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden bg-slate-50 dark:bg-neutral-950 dark:border-neutral-800">
      <ForceGraph2D
        graphData={data}
        nodeLabel={(node: any) => node.label}
        nodeColor={(node: any) => node.color || (node.type === 'paper' ? '#3b82f6' : '#ef4444')}
        nodeRelSize={6}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = getNodeLabel(node);
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Draw the node circle
          const size = node.val || 10;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = node.color || (node.type === 'paper' ? '#3b82f6' : '#ef4444');
          ctx.fill();
          
          // Draw the label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, node.x, node.y);
        }}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={() => '#94a3b8'} // slate-400, visible on both light and dark
        backgroundColor="rgba(0,0,0,0)"
        onNodeClick={(node) => onNodeClick && onNodeClick(node as GraphNode)}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        d3Force="charge" 
        warmupTicks={100}
        cooldownTicks={100}
        onEngineStop={() => {}}
      />
    </div>
  );
};

export default GraphVisualization;
