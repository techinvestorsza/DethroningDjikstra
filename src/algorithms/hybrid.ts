import type { Graph, Node } from './graph';

export interface HybridState {
    visited: Set<number>; // Nodes visited
    activeClusters: Set<number>; // Clusters currently in "Frontier"
    processedClusters: Set<number>;
    currentCluster?: number;
    pivotEdges: { source: number, target: number }[]; // Highway edges for viz
    currentAction: string; // "Sorting Leaders", "Scouting Highway", "Filling Neighborhood"
    path: number[];
    finished: boolean;
    resolvedPath: number[]; // The actual street-level path
}

// Helper: Synchronous A* for short segments
function findSegmentPath(graph: Graph, startId: number, endId: number): number[] {
    const openSet = new Set<number>([startId]);
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();

    gScore.set(startId, 0);
    fScore.set(startId, heuristic(graph.nodes.find(n => n.id === startId)!, graph.nodes.find(n => n.id === endId)!));

    while (openSet.size > 0) {
        // Simple min-extract
        let current = -1;
        let minF = Infinity;
        for (const id of openSet) {
            const f = fScore.get(id) ?? Infinity;
            if (f < minF) {
                minF = f;
                current = id;
            }
        }

        if (current === endId) {
            const path = [current];
            while (cameFrom.has(current)) {
                current = cameFrom.get(current)!;
                path.unshift(current);
            }
            return path;
        }

        openSet.delete(current);
        // const currentNode = graph.nodes.find(n => n.id === current)!; // Unused
        const neighbors = graph.adjacencyList.get(current) || [];

        for (const edge of neighbors) {
            const neighborId = edge.node;
            const tentativeG = (gScore.get(current) ?? Infinity) + edge.weight;

            if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
                cameFrom.set(neighborId, current);
                gScore.set(neighborId, tentativeG);
                const neighborNode = graph.nodes.find(n => n.id === neighborId)!;
                const endNode = graph.nodes.find(n => n.id === endId)!;
                fScore.set(neighborId, tentativeG + heuristic(neighborNode, endNode));
                if (!openSet.has(neighborId)) {
                    openSet.add(neighborId);
                }
            }
        }
    }
    return [startId, endId]; // Fallback if no path found (shouldn't happen in connected component)
}

function heuristic(a: Node, b: Node): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// Helper to assign clusters and identify pivots
export function preProcessClusters(graph: Graph, clusterSize: number = 10) {
    const clusters = new Map<number, Node[]>();
    const pivots = new Map<number, Node>();

    graph.nodes.forEach(node => {
        // Grid-based clustering
        const cx = Math.floor(node.x / 20 / clusterSize); // node.x is in pixels (20px per grid unit)
        const cy = Math.floor(node.y / 20 / clusterSize);
        const clusterId = cy * 100 + cx; // Simple hash

        node.clusterId = clusterId;

        if (!clusters.has(clusterId)) clusters.set(clusterId, []);
        clusters.get(clusterId)!.push(node);
    });

    // Find center node as pivot for each cluster
    clusters.forEach((nodes, id) => {
        // Simple center of mass or just middle of list
        const centerNode = nodes[Math.floor(nodes.length / 2)];
        centerNode.isPivot = true;
        pivots.set(id, centerNode);
    });

    return { clusters, pivots };
}

export function* runHybrid(graph: Graph, startId: number, endId: number): Generator<HybridState> {
    const visited = new Set<number>();
    const activeClusters = new Set<number>();
    const processedClusters = new Set<number>();
    const pivotEdges: { source: number, target: number }[] = [];
    const cameFrom = new Map<number, number>();

    // Initialize
    const startNode = graph.nodes.find(n => n.id === startId)!;
    const startCluster = startNode.clusterId!;

    // Queue of Clusters (Leaders) - much smaller than node queue!
    let clusterFrontier: { clusterId: number; distance: number }[] = [];
    clusterFrontier.push({ clusterId: startCluster, distance: 0 });
    activeClusters.add(startCluster);

    const endNode = graph.nodes.find(n => n.id === endId)!;
    const endCluster = endNode.clusterId!;

    while (clusterFrontier.length > 0) {
        // VISUALIZATION: Sort only the Leaders
        clusterFrontier.sort((a, b) => a.distance - b.distance);

        yield {
            visited: new Set(visited),
            activeClusters: new Set(activeClusters),
            processedClusters: new Set(processedClusters),
            pivotEdges,
            currentAction: "Sorting Leaders (Fast)",
            path: [],
            resolvedPath: [],
            finished: false
        };

        const current = clusterFrontier.shift()!;
        const clusterId = current.clusterId;

        if (processedClusters.has(clusterId)) continue;
        processedClusters.add(clusterId);
        activeClusters.delete(clusterId);

        // VISUALIZATION: Check Leader
        yield {
            visited: new Set(visited),
            activeClusters: new Set(activeClusters),
            processedClusters: new Set(processedClusters),
            currentCluster: clusterId,
            pivotEdges,
            currentAction: "Checking Group Leader",
            path: [],
            resolvedPath: [],
            finished: false
        };

        // Simulate "Highway Scouting" - find neighbor clusters
        // In real alg, this uses pre-calculated distances. We simulate by checking edges of nodes in cluster.
        // VISUALIZATION: Light up the whole neighborhood
        const clusterNodes = graph.nodes.filter(n => n.clusterId === clusterId);
        for (const node of clusterNodes) {
            visited.add(node.id);
        }

        yield {
            visited: new Set(visited),
            activeClusters: new Set(activeClusters),
            processedClusters: new Set(processedClusters),
            currentCluster: clusterId,
            pivotEdges,
            currentAction: "Filling Neighborhood",
            path: [],
            resolvedPath: [],
            finished: false
        };

        if (clusterId === endCluster) {
            // Reached target cluster! Reconstruct path
            const clusterPath: number[] = [endCluster];
            let curr = endCluster;
            while (cameFrom.has(curr)) {
                curr = cameFrom.get(curr)!;
                clusterPath.unshift(curr);
            }

            // Convert cluster path to node path (using pivots)
            const nodePath: number[] = [];

            // Add start node
            nodePath.push(startId);

            // Add intermediates (pivots)
            for (let i = 0; i < clusterPath.length; i++) {
                const cid = clusterPath[i];
                // Find pivot for this cluster
                const pivot = graph.nodes.find(n => n.clusterId === cid && n.isPivot);
                if (pivot) nodePath.push(pivot.id);
            }

            // Add end node
            nodePath.push(endId);

            yield {
                visited: new Set(visited),
                activeClusters: new Set(activeClusters),
                processedClusters: new Set(processedClusters),
                currentCluster: clusterId,
                pivotEdges,
                currentAction: "Target Found! Resolving Path...",
                path: nodePath,
                resolvedPath: [],
                finished: false
            };

            // Now resolve the segments
            const fullResolvedPath: number[] = [];
            for (let i = 0; i < nodePath.length - 1; i++) {
                const u = nodePath[i];
                const v = nodePath[i + 1];

                yield {
                    visited: new Set(visited),
                    activeClusters: new Set(activeClusters),
                    processedClusters: new Set(processedClusters),
                    currentCluster: undefined,
                    pivotEdges,
                    currentAction: `Resolving Segment ${i + 1}/${nodePath.length - 1}...`,
                    path: nodePath,
                    resolvedPath: [...fullResolvedPath],
                    finished: false
                };

                const segment = findSegmentPath(graph, u, v);
                // Append segment (avoid duplicating connection nodes)
                if (fullResolvedPath.length > 0) segment.shift();
                fullResolvedPath.push(...segment);
            }

            yield {
                visited: new Set(visited), // Keep visited for context
                activeClusters: new Set(activeClusters),
                processedClusters: new Set(processedClusters),
                currentCluster: undefined,
                pivotEdges,
                currentAction: "Destination Reached! Path Resolved.",
                path: nodePath,
                resolvedPath: fullResolvedPath,
                finished: true
            };
            return;
        }

        // Expand to neighbor clusters
        const neighborClusters = new Set<number>();
        for (const node of clusterNodes) {
            const neighbors = graph.adjacencyList.get(node.id) || [];
            for (const edge of neighbors) {
                const targetNode = graph.nodes.find(n => n.id === edge.node)!;
                if (targetNode.clusterId !== clusterId && !processedClusters.has(targetNode.clusterId!)) {
                    neighborClusters.add(targetNode.clusterId!);
                }
            }
        }

        for (const nc of neighborClusters) {
            if (!activeClusters.has(nc)) {
                activeClusters.add(nc);
                cameFrom.set(nc, clusterId); // Track path
                // Heuristic distance
                clusterFrontier.push({ clusterId: nc, distance: current.distance + 1 });
            }
        }
    }

    // If queue is empty and target not found
    yield {
        visited: new Set(visited),
        activeClusters: new Set(activeClusters),
        processedClusters: new Set(processedClusters),
        currentCluster: undefined,
        pivotEdges,
        currentAction: "Target Unreachable!",
        path: [],
        resolvedPath: [],
        finished: true
    };
}
