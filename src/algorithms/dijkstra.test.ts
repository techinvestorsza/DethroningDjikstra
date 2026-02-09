import { describe, it, expect } from 'vitest';
import { runDijkstra } from './dijkstra';
import type { Graph, Node } from './graph';

describe('Dijkstra Algorithm', () => {
    const createNode = (id: number): Node => ({ id, x: 0, y: 0 });

    it('should find the shortest path in a simple linear graph', () => {
        // 0 -> 1 -> 2
        const nodes = [createNode(0), createNode(1), createNode(2)];
        const adjacencyList = new Map();
        adjacencyList.set(0, [{ node: 1, weight: 1 }]);
        adjacencyList.set(1, [{ node: 2, weight: 1 }]);
        adjacencyList.set(2, []);

        const graph: Graph = { nodes, edges: [], adjacencyList };



        const gen = runDijkstra(graph, 0, 2);
        let state;
        for (const s of gen) {
            state = s;
            if (s.finished) break;
        }

        expect(state).toBeDefined();
        expect(state?.finished).toBe(true);
        expect(state?.path).toEqual([0, 1, 2]);
    });

    it('should prefer lower weight paths', () => {
        // 0 -> 1 (weight 10) -> 2 (weight 10) = 20
        // 0 -> 3 (weight 1) -> 2 (weight 1) = 2
        const nodes = [createNode(0), createNode(1), createNode(2), createNode(3)];
        const adjacencyList = new Map();
        adjacencyList.set(0, [{ node: 1, weight: 10 }, { node: 3, weight: 1 }]);
        adjacencyList.set(1, [{ node: 2, weight: 10 }]);
        adjacencyList.set(3, [{ node: 2, weight: 1 }]);
        adjacencyList.set(2, []);

        const graph: Graph = { nodes, edges: [], adjacencyList };

        const gen = runDijkstra(graph, 0, 2);
        let state;
        for (const s of gen) {
            state = s;
            if (s.finished) break;
        }

        expect(state?.path).toEqual([0, 3, 2]);
    });

    it('should handle unreachable targets', () => {
        // 0 -> 1   (2 is disconnected)
        const nodes = [createNode(0), createNode(1), createNode(2)];
        const adjacencyList = new Map();
        adjacencyList.set(0, [{ node: 1, weight: 1 }]);
        adjacencyList.set(1, []);
        adjacencyList.set(2, []);

        const graph: Graph = { nodes, edges: [], adjacencyList };

        const gen = runDijkstra(graph, 0, 2);
        let state;
        for (const s of gen) {
            state = s;
            if (s.finished) break;
        }

        expect(state?.finished).toBe(true);
        expect(state?.path).toEqual([]);
    });
});
