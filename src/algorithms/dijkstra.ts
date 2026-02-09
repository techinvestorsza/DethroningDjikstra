import type { Graph } from './graph';

export interface DijkstraState {
    visited: Set<number>;
    frontier: { node: number; distance: number }[];
    current?: number;
    distances: Map<number, number>;
    path: number[];
    finished: boolean;
}

export function* runDijkstra(graph: Graph, startId: number, endId: number): Generator<DijkstraState> {
    const distances = new Map<number, number>();
    const visited = new Set<number>();
    const previous = new Map<number, number>();
    // The "Line of Passengers" - unsorted list that needs sorting
    let frontier: { node: number; distance: number }[] = [];

    // Initialize
    graph.nodes.forEach(node => distances.set(node.id, Infinity));
    distances.set(startId, 0);
    frontier.push({ node: startId, distance: 0 });

    while (frontier.length > 0) {
        // VISUALIZATION STEP: The "Sorting Barrier"
        // Sort the entire frontier to find the nearest node.
        // In a real optimized Dijkstra, we'd use a Heap (O(log n)), 
        // but the bottleneck is still processing/extracting min. 
        // Here we use array sort (O(n log n)) to emphasize the "checking everyone" metaphor.
        frontier.sort((a, b) => a.distance - b.distance);

        // Yield logic: "Sorting complete, picking next"
        yield {
            visited: new Set(visited),
            frontier: [...frontier], // Copy for viz
            distances: new Map(distances),
            path: [],
            finished: false
        };

        const current = frontier.shift(); // Remove first (min)
        if (!current) break;

        const { node: u, distance: d } = current;

        if (visited.has(u)) continue;
        visited.add(u);

        // Yield logic: "Processing node"
        yield {
            visited: new Set(visited),
            frontier: [...frontier],
            current: u,
            distances: new Map(distances),
            path: [],
            finished: false
        };

        if (u === endId) {
            // Reconstruct path
            const path = [];
            let curr: number | undefined = endId;
            while (curr !== undefined) {
                path.unshift(curr);
                curr = previous.get(curr);
            }
            yield {
                visited: new Set(visited),
                frontier: [],
                current: u,
                distances: new Map(distances),
                path,
                finished: true
            };
            return;
        }

        // Neighbors
        const neighbors = graph.adjacencyList.get(u) || [];
        for (const edge of neighbors) {
            const v = edge.node;
            if (visited.has(v)) continue;

            const alt = d + edge.weight;
            if (alt < distances.get(v)!) {
                distances.set(v, alt);
                previous.set(v, u);

                // Update or add to frontier
                const existingIdx = frontier.findIndex(item => item.node === v);
                if (existingIdx !== -1) {
                    frontier[existingIdx].distance = alt;
                } else {
                    frontier.push({ node: v, distance: alt });
                }
            }
        }
    }

    // If queue is empty and target not found
    yield {
        visited: new Set(visited),
        frontier: [],
        current: undefined,
        distances: new Map(distances),
        path: [],
        finished: true
    };
}
