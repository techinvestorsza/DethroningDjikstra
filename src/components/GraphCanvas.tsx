import React, { useEffect, useRef } from 'react';
import type { Graph } from '../algorithms/graph';

interface GraphCanvasProps {
    graph: Graph;
    visited: Set<number>;
    frontier: { node: number, distance: number }[];
    path: number[];
    resolvedPath?: number[];
    currentNode?: number;
    currentCluster?: number;
    startId: number;
    endId: number;
    width: number;
    height: number;
    showClusters: boolean;
}

const CLUSTER_COLORS = [
    '#ffebee', '#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5',
    '#e0f7fa', '#fff8e1', '#fce4ec', '#f1f8e9', '#efebe9'
];

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
    graph, visited, frontier, path, resolvedPath, currentNode, currentCluster, startId, endId, width, height, showClusters
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Optimize frontier lookup
    const frontierSet = React.useMemo(() => {
        return new Set(frontier.map(f => f.node));
    }, [frontier]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw Clusters (Background blobs)
        if (showClusters) {
            graph.nodes.forEach(node => {
                if (node.clusterId !== undefined) {
                    const colorIdx = node.clusterId % CLUSTER_COLORS.length;

                    if (currentCluster !== undefined && node.clusterId === currentCluster) {
                        ctx.fillStyle = '#ffecb3'; // Highlight active cluster
                    } else {
                        ctx.fillStyle = CLUSTER_COLORS[colorIdx];
                    }
                    // Draw slightly larger circle for cluster background
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        }

        // Draw Edges
        ctx.lineWidth = 1;
        graph.edges.forEach(edge => {
            const u = graph.nodes[edge.source];
            const v = graph.nodes[edge.target];
            if (!u || !v) return;

            // Highlight path edges logic could go here
            ctx.strokeStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(u.x, u.y);
            ctx.lineTo(v.x, v.y);
            ctx.stroke();
        });

        // Draw Path (High-level or Dijkstra)
        if (path.length > 1) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = showClusters ? '#d946ef' : '#00e676'; // Pink for Hybrid (Flight), Green for Dijkstra (Road)
            if (showClusters) {
                ctx.setLineDash([10, 10]); // Dashed line for virtual links
            } else {
                ctx.setLineDash([]); // Solid line for physical road
            }

            ctx.beginPath();
            const startNode = graph.nodes[path[0]];
            ctx.moveTo(startNode.x, startNode.y);
            for (let i = 1; i < path.length; i++) {
                const node = graph.nodes[path[i]];
                ctx.lineTo(node.x, node.y);
            }
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }

        // Draw Resolved Path (Hybrid segment fill-in)
        if (resolvedPath && resolvedPath.length > 1) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00e676'; // Standard green road path
            ctx.setLineDash([]); // Solid

            ctx.beginPath();
            const startResolved = graph.nodes[resolvedPath[0]];
            ctx.moveTo(startResolved.x, startResolved.y);
            for (let i = 1; i < resolvedPath.length; i++) {
                const node = graph.nodes[resolvedPath[i]];
                ctx.lineTo(node.x, node.y);
            }
            ctx.stroke();
        }

        // Draw Nodes
        graph.nodes.forEach(node => {
            let color = '#555'; // Default unvisited
            let radius = 3;

            if (visited.has(node.id)) {
                color = '#29b6f6'; // Visited
            }

            if (frontierSet.has(node.id)) {
                color = '#ffeb3b'; // Frontier (Yellow)
                radius = 5;
            }

            if (node.id === currentNode) {
                color = '#ff1744'; // Current processing
                radius = 7;
            }

            if (node.id === startId) {
                color = '#00e676'; // Start (Green)
                radius = 8;
            }
            if (node.id === endId) {
                color = '#f50057'; // End (Red)
                radius = 8;
            }

            // Pivot highlight for Hybrid
            if (showClusters && node.isPivot) {
                // Draw ring
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                // If it is also a start/end/current node, draw a larger ring
                const ringRadius = radius > 3 ? radius + 3 : 6;
                ctx.arc(node.x, node.y, ringRadius, 0, 2 * Math.PI);
                ctx.stroke();
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fill();
        });

    }, [graph, visited, frontierSet, path, resolvedPath, currentNode, currentCluster, startId, endId, width, height, showClusters]);

    return <canvas ref={canvasRef} width={width} height={height} className="rounded-lg shadow-lg max-w-full max-h-full" />;
};
