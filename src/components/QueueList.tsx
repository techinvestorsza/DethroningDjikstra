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

export const QueueList: React.FC<QueueListProps> = ({ algoType, frontier, hybridState }) => {
    const limit = 4;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-4 flex justify-between items-center tracking-wider">
                <span>{algoType === 'dijkstra' ? 'Live Priority Queue' : 'Active Cluster Leaders'}</span>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-[10px] border border-gray-700">{frontier.length} Items</span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 font-mono text-[10px]">
                {algoType === 'dijkstra' && (
                    frontier.slice(0, limit).map((item, i) => (
                        <div key={i} className={`flex justify-between p-3 rounded-md border ${i === 0 ? 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'bg-gray-800/30 text-gray-500 border-gray-800 hover:bg-gray-800/50 hover:text-gray-300 transition-colors'}`}>
                            <span className="font-bold">#{item.node} <span className="opacity-50 font-normal ml-1">PASSENGER</span></span>
                            <span className={i === 0 ? 'text-yellow-400 font-bold' : ''}>{item.distance.toFixed(1)}m</span>
                        </div>
                    ))
                )}
                {algoType === 'hybrid' && (
                    hybridState?.activeClusters ? (
                        Array.from(hybridState.activeClusters).map(cid => (
                            <div key={cid} className="flex justify-between items-center p-3 bg-purple-900/10 rounded-md border border-purple-500/20 mb-1 hover:bg-purple-900/20 transition-colors">
                                <span className="text-purple-300 font-bold">CLUSTER {cid}</span>
                                <span className="text-[9px] font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20 tracking-wider">ACTIVE</span>
                            </div>
                        ))
                    ) : <div className="text-gray-600 italic p-2 text-center">Initializing clusters...</div>
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
