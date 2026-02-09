import React from 'react';
import type { Node } from '../algorithms/graph';
import type { HybridState } from '../algorithms/hybrid';

interface QueueListProps {
    algoType: 'dijkstra' | 'hybrid';
    frontier: { node: number; distance: number }[];
    hybridState: HybridState | null;
    pivots: Map<number, Node>;
    isRunning: boolean;
}

export const QueueList: React.FC<QueueListProps> = ({ algoType, frontier, hybridState, pivots, isRunning }) => {
    const limit = isRunning ? 10 : 50;

    return (
        <div className="flex-1 bg-gray-900/50 rounded-xl p-10 border border-gray-800 flex flex-col min-h-0">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-4 flex justify-between items-center tracking-wider">
                <span>{algoType === 'dijkstra' ? 'Live Priority Queue' : 'Active Cluster Leaders'}</span>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-[10px] border border-gray-700">{frontier.length} Items</span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 font-mono text-xs">
                {algoType === 'dijkstra' && (
                    frontier.slice(0, limit).map((item, i) => (
                        <div key={i} className={`flex justify-between p-3 rounded ${i === 0 ? 'bg-yellow-900/50 text-yellow-200 border-l-2 border-yellow-400' : 'text-gray-500 hover:bg-gray-800'}`}>
                            <span>Passenger #{item.node}</span>
                            <span>{item.distance.toFixed(1)}m</span>
                        </div>
                    ))
                )}
                {algoType === 'hybrid' && (
                    hybridState?.activeClusters ? (
                        Array.from(hybridState.activeClusters).map(cid => (
                            <div key={cid} className="flex justify-between p-2 bg-purple-900/20 rounded border border-purple-800/50 mb-1">
                                <span className="text-purple-300">Cluster {cid} <span className="text-gray-500">via Pivot {pivots.get(cid)?.id}</span></span>
                                <span className="text-green-400 text-[10px] border border-green-900 bg-green-900/20 px-1 rounded">ACTIVE LEAD</span>
                            </div>
                        ))
                    ) : <div className="text-gray-600 italic p-2">Initializing clusters...</div>
                )}
                {algoType === 'dijkstra' && frontier.length > limit && (
                    <div className="text-center text-gray-700 italic py-2">
                        ... and {frontier.length - limit} more items in queue ...
                    </div>
                )}
            </div>
        </div>
    );
};
