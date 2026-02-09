
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { QueueList } from './components/QueueList';
import { Footer } from './components/Footer';
import { generateCityGraph, type Graph, type Node } from './algorithms/graph';
import { runDijkstra, type DijkstraState } from './algorithms/dijkstra';
import { runHybrid, type HybridState, preProcessClusters } from './algorithms/hybrid';

const App: React.FC = () => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [pivots, setPivots] = useState<Map<number, Node>>(new Map());
  const [algoType, setAlgoType] = useState<'dijkstra' | 'hybrid'>('dijkstra');

  const [dijkstraState, setDijkstraState] = useState<DijkstraState | null>(null);
  const [hybridState, setHybridState] = useState<HybridState | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ steps: 0, sortingOps: 0 }); // Simulated stats

  const generatorRef = useRef<Generator<DijkstraState | HybridState> | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize Graph
  useEffect(() => {
    resetGraph();
  }, []);

  const resetGraph = useCallback(() => {
    const newGraph = generateCityGraph(40, 30, 0.7); // 800x600 equivalent approx
    // Pre-process for Hybrid
    const { pivots: newPivots } = preProcessClusters(newGraph);

    setGraph(newGraph);
    setPivots(newPivots);
    setDijkstraState(null);
    setHybridState(null);
    setIsRunning(false);
    setStats({ steps: 0, sortingOps: 0 });
    if (timerRef.current) clearTimeout(timerRef.current);
    generatorRef.current = null;
  }, []);

  const startAlgo = () => {
    if (!graph) return;
    const startNode = graph.nodes[0];
    const endNode = graph.nodes[graph.nodes.length - 1];

    if (algoType === 'dijkstra') {
      generatorRef.current = runDijkstra(graph, startNode.id, endNode.id);
    } else {
      generatorRef.current = runHybrid(graph, startNode.id, endNode.id);
    }
    setIsRunning(true);
  };

  const step = useCallback(() => {
    if (!generatorRef.current) return;

    const result = generatorRef.current.next();

    if (result.done) {
      setIsRunning(false);
      return;
    }

    const state = result.value;
    if (algoType === 'dijkstra') {
      const s = state as DijkstraState;
      setDijkstraState(s);
      // Simulate sorting cost: proportional to frontier size * log(frontier size)
      const cost = s.frontier.length * Math.log(s.frontier.length || 1);
      setStats(prev => ({ steps: prev.steps + 1, sortingOps: prev.sortingOps + Math.floor(cost) }));
    } else {
      setHybridState(state as HybridState);
      // Hybrid cost: much lower, based on active clusters
      const s = state as HybridState;
      const cost = s.activeClusters.size * Math.log(s.activeClusters.size || 1);
      setStats(prev => ({ steps: prev.steps + 1, sortingOps: prev.sortingOps + Math.floor(cost) }));
    }

    timerRef.current = setTimeout(step, 50);
  }, [algoType]);

  useEffect(() => {
    if (isRunning) {
      step();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, step]);

  const toggleRun = () => {
    if (!isRunning && !generatorRef.current) {
      startAlgo();
    } else {
      setIsRunning(!isRunning);
    }
  };

  if (!graph) return <div className="text-white">Loading...</div>;

  // Derive visual props based on state
  let visited = new Set<number>();
  let frontier: { node: number, distance: number }[] = [];
  let path: number[] = [];
  let resolvedPath: number[] = [];
  let current: number | undefined;
  let currentCluster: number | undefined;
  let actionText = "Ready";

  if (algoType === 'dijkstra' && dijkstraState) {
    visited = dijkstraState.visited;
    frontier = dijkstraState.frontier;
    path = dijkstraState.path;
    current = dijkstraState.current;
    if (dijkstraState.finished) {
      actionText = path.length > 0 ? "Destination Reached!" : "Target Unreachable!";
    } else {
      actionText = `Processing Node ${current ?? '...'} `;
    }
  } else if (algoType === 'hybrid' && hybridState) {
    visited = hybridState.visited;
    // Map active clusters to their pivot nodes for visualization
    const frontierNodes: { node: number, distance: number }[] = [];
    hybridState.activeClusters.forEach(cid => {
      const p = pivots.get(cid);
      if (p) frontierNodes.push({ node: p.id, distance: 0 });
    });
    frontier = frontierNodes;

    path = hybridState.path;
    resolvedPath = hybridState.resolvedPath;
    currentCluster = hybridState.currentCluster;
    if (hybridState.finished) {
      actionText = path.length > 0 ? "Destination Reached!" : "Target Unreachable!";
    } else {
      actionText = hybridState.currentAction;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center p-6">
      <div className="w-full max-w-[1600px] h-[90vh] flex flex-col gap-6">

        {/* 1. TOP HEADER */}
        <Header algoType={algoType} />

        {/* 2. MAIN CONTENT: Side-by-Side Layout */}
        <div className="flex-1 flex min-h-0 gap-20">

          {/* LEFT: Graph Visualization */}
          <div className="flex-1 relative bg-black/50 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
            <GraphCanvas
              graph={graph}
              visited={visited}
              frontier={frontier}
              path={path}
              resolvedPath={resolvedPath}
              currentNode={current}
              currentCluster={currentCluster}
              startId={graph.nodes[0].id}
              endId={graph.nodes[graph.nodes.length - 1].id}
              width={800}
              height={600}
              showClusters={algoType === 'hybrid'}
            />

            <div className="absolute top-4 left-4 font-mono text-yellow-400 text-lg drop-shadow-md bg-black/40 px-2 rounded">
              {actionText}
            </div>
          </div>

          {/* RIGHT: Sidebar (Controls & Info) */}
          <div className="w-96 flex flex-col gap-4 min-h-0">

            <ControlPanel
              algoType={algoType}
              setAlgoType={setAlgoType}
              isRunning={isRunning}
              toggleRun={toggleRun}
              resetGraph={resetGraph}
              setIsRunning={setIsRunning}
            />

            <StatsPanel stats={stats} algoType={algoType} />

            <QueueList
              algoType={algoType}
              frontier={frontier}
              hybridState={hybridState}
              pivots={pivots}
              isRunning={isRunning}
            />

          </div>

        </div>

        {/* 4. FOOTER */}
        <Footer />

      </div>
    </div>
  );
};

export default App;


