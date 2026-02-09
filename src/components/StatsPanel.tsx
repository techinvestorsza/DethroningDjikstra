import React from 'react';

interface StatsPanelProps {
    stats: { steps: number; sortingOps: number };
    algoType: 'dijkstra' | 'hybrid';
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, algoType }) => {
    return (
        <div className="bg-gray-900/50 rounded-xl p-10 border border-gray-800 flex flex-col justify-center gap-6">
            <div>
                <div className="text-xs text-gray-500 uppercase">Steps Taken</div>
                <div className="text-3xl font-mono font-bold text-white">{stats.steps}</div>
            </div>
            <div>
                <div className="text-xs text-gray-500 uppercase">Sorting Ops ("The Tax")</div>
                <div className={`text-3xl font-mono font-bold ${algoType === 'dijkstra' ? 'text-red-500' : 'text-green-500'}`}>
                    {stats.sortingOps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                    {algoType === 'dijkstra' ? 'Exponential growth with frontier size' : 'Minimally linear with cluster count'}
                </div>
            </div>
        </div>
    );
};
