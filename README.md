# Dethroning Dijkstra: Visual Algorithm Simulation

A high-performance interactive visualization comparing **Traditional Dijkstra’s Algorithm** against a modern **Hybrid Cluster-Pivot** approach. This project illustrates *why* traditional methods struggle with large networks (the "Sorting Tax") and how hierarchical strategies overcome this bottleneck.

## Overview

### The Problem: Traditional Dijkstra
- **Mechanism**: Explores a map by always picking the "absolute nearest" point next.
- **The Bottleneck**: Known as the **Sorting Barrier**. To find the nearest point, the computer must constantly re-sort its entire list of potential next steps ($O(m + n \log n)$).
- **Visual Metaphor**: Imagine a single, massive line of passengers being checked one by one.

### The Solution: Hybrid Cluster-Pivot
- **Mechanism**: Combines Dijkstra logic with hierarchical clustering.
- **The Strategy**:
    - **Clustering**: Groups nearby points into "neighborhoods".
    - **Pivots**: Screens only one "representative" (Group Leader) from each cluster.
    - **Highways**: Skips local traffic by scouting long-distance connections first.
- **Visual Metaphor**: Grouping passengers by destination and only checking the group leader’s ticket to clear the whole crowd.

## Features

- **Interactive City Graph**: Randomly generated grid-based graph with weighted edges simulating a road network.
- **Dual Visualization Modes**:
    - **Traditional Mode**: Visualizes the massive "Frontier" queue (The Line) and the mounting cost of sorting.
    - **Hybrid Mode**: Visualizes "Cluster Frontiers" (Leaders) and "Neighborhood Filling".
- **Real-time Metrics**: Tracks "Sorting Checks" to quantitatively demonstrate the efficiency gap.
- **Control Center**: Play/Pause, Reset, and Algorithm switching.


## How to Use

1. **Select an Strategy**: Choose "Traditional" or "Hybrid" from the sidebar.
2. **Start Simulation**: Click the **Start Simulation** button.
3. **Observe**:
    - Watch the **Graph** to see nodes light up (Blue = Visited, Yellow = Frontier).
    - Watch the **Sidebar** to see the Queue size and "Sorting Checks" counter.
    - Compare the speed and "cost" of both approaches.

## License
MIT
