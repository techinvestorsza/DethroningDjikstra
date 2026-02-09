import { describe, it, expect } from 'vitest';
import { runHybrid, preProcessClusters } from './hybrid';
import type { Graph, Node } from './graph';

describe('Hybrid Algorithm', () => {
    // Hybrid relies on x,y for clustering.
    // clusterSize default is 10.
    // Grid: 20px per unit.
    // So 10 test units = 200px.

    // Let's create two clusters.
    // Cluster 0: (0,0) to (180, 180) approx
    // Cluster 1: (200, 0) to ...

    const createNode = (id: number, x: number, y: number): Node => ({ id, x, y });

    it('should find path between clusters', () => {
        // Node 0 in Cluster 0 (0,0)
        // Node 1 in Cluster 1 (250, 0)
        // Node 2 in Cluster 1 (260, 0)

        const nodes = [
            createNode(0, 0, 0),    // Cluster 0
            createNode(1, 20, 0),   // Cluster 0
            createNode(2, 250, 0),  // Cluster 1 (x > 200)
            createNode(3, 270, 0)   // Cluster 1
        ];

        // 0 -> 1 -> 2 -> 3
        const adjacencyList = new Map();
        adjacencyList.set(0, [{ node: 1, weight: 1 }]);
        adjacencyList.set(1, [{ node: 0, weight: 1 }, { node: 2, weight: 10 }]); // Cross-cluster edge
        adjacencyList.set(2, [{ node: 1, weight: 10 }, { node: 3, weight: 1 }]);
        adjacencyList.set(3, [{ node: 2, weight: 1 }]);

        const graph: Graph = { nodes, edges: [], adjacencyList };

        // Preprocess to assign clusters and pivots
        preProcessClusters(graph, 10);

        // Check clusters were assigned
        expect(nodes[0].clusterId).toBeDefined();
        expect(nodes[2].clusterId).toBeDefined();
        expect(nodes[0].clusterId).not.toBe(nodes[2].clusterId);

        const gen = runHybrid(graph, 0, 3);
        let state;
        for (const s of gen) {
            state = s;
            if (s.finished) break;
        }

        expect(state?.finished).toBe(true);
        expect(state?.path.length).toBeGreaterThan(0);
        expect(state?.path[0]).toBe(0);
        expect(state?.path[state.path.length - 1]).toBe(3);
    });

    it('should resolve specific path segments', () => {
        // Create a simple case where hybrid should match exact path
        // 0 -> 1
        const nodes = [createNode(0, 0, 0), createNode(1, 10, 0)];
        const adjacencyList = new Map();
        adjacencyList.set(0, [{ node: 1, weight: 1 }]);
        adjacencyList.set(1, []);

        const graph: Graph = { nodes, edges: [], adjacencyList };
        preProcessClusters(graph);

        const gen = runHybrid(graph, 0, 1);
        let state;
        for (const s of gen) {
            state = s;
            if (s.finished) break;
        }

        expect(state?.resolvedPath).toEqual([0, 1]);
    });
});
