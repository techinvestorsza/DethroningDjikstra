export interface Node {
  id: number;
  x: number;
  y: number;
  clusterId?: number;
  isPivot?: boolean;
  isHighway?: boolean;
}

export interface Edge {
  source: number;
  target: number;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  adjacencyList: Map<number, { node: number; weight: number }[]>;
}

export function generateCityGraph(width: number, height: number, density: number = 0.8): Graph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const adjacencyList = new Map<number, { node: number; weight: number }[]>();

  let idCounter = 0;
  const grid: (Node | null)[][] = Array(height).fill(null).map(() => Array(width).fill(null));

  // Create grid nodes with some randomness
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.random() < density) {
        const node: Node = {
          id: idCounter++,
          x: x * 20 + Math.random() * 5, // Scale and jitter
          y: y * 20 + Math.random() * 5,
        };
        nodes.push(node);
        grid[y][x] = node;
        adjacencyList.set(node.id, []);
      }
    }
  }

  // Connect neighbors (grid + diagonals)
  const directions = [
    { dx: 1, dy: 0, weight: 1 },
    { dx: 0, dy: 1, weight: 1 },
    { dx: 1, dy: 1, weight: 1.414 },
    { dx: 1, dy: -1, weight: 1.414 },
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const node = grid[y][x];
      if (!node) continue;

      for (const { dx, dy, weight } of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighbor = grid[ny][nx];
          if (neighbor) {
            // Add slight randomness to edge weights to simulate traffic/road conditions
            const finalWeight = weight * (0.8 + Math.random() * 0.4);
            
            edges.push({ source: node.id, target: neighbor.id, weight: finalWeight });
            edges.push({ source: neighbor.id, target: node.id, weight: finalWeight }); // Undirected visually, but represented as directed for algo

            adjacencyList.get(node.id)!.push({ node: neighbor.id, weight: finalWeight });
            adjacencyList.get(neighbor.id)!.push({ node: node.id, weight: finalWeight });
          }
        }
      }
    }
  }

  return { nodes, edges, adjacencyList };
}
