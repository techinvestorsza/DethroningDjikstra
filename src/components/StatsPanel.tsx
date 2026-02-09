import React from 'react';

interface StatsPanelProps {
    stats: { steps: number; sortingOps: number };
    algoType: 'dijkstra' | 'hybrid';
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, algoType }) => {
    return (
        <div className="flex flex-col justify-center gap-6 border-t border-b border-gray-800 py-6">
            <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Steps Taken</div>
                <div className="text-4xl font-mono font-bold text-white tracking-tighter">{stats.steps}</div>
            </div>
            <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Sorting Ops ("The Tax")</div>
                <div className={`text-4xl font-mono font-bold tracking-tighter ${algoType === 'dijkstra' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]'}`}>
                    {stats.sortingOps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium">
                    {algoType === 'dijkstra' ? 'Exponential growth with frontier size' : 'Minimally linear with cluster count'}
                </div>
            </div>
        </div>
    );
};
