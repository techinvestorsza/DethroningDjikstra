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

        const generator = runDijkstra(graph, 0, 2);
        let result = generator.next();
        let finalState;
        while (!result.done) {
            finalState = result.value;
            result = generator.next();
        }
        // Last yielded value before done might be the final step or close to it
        // The generator yields the final result with done: true as per implementation?
        // Let's check the return value.
        // Actually, the generator returns the final state in the `value` property when done is true, OR yields it last.
        // Looking at the code: it yields { ... finished: true } and then returns.

        // So the last value we captured in the loop (when !done) is actually NOT the final one if we stop when done is true.
        // We need to capture the return value if it exists, or the last yielded value.
        // However, the generator implementation:
        // yield { ... finished: true }; return;
        // So the loop:
        // 1. next() -> { value: State, done: false }
        // ...
        // n. next() -> { value: FinalState, done: false } -> wait, usually `return` makes done: true.
        // But the code has `yield { ... finished: true }` then `return`.
        // So `next()` will return `{ value: FinalState, done: false }`? No, yield is standard.
        // `yield X` -> `{ value: X, done: false }`.
        // Next call -> `return` -> `{ value: undefined, done: true }`.

        // So we need to iterate until we find `finished: true`.

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
