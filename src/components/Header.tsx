import React from 'react';

interface HeaderProps {
    algoType: 'dijkstra' | 'hybrid';
}

export const Header: React.FC<HeaderProps> = ({ algoType }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2 py-2 shrink-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Dethroning Dijkstra
            </h1>
            <div className="max-w-3xl text-center min-h-[3.5rem] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className={`text-xl font-semibold ${algoType === 'dijkstra' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {algoType === 'dijkstra' ? 'Traditional Dijkstra' : 'Hybrid Cluster-Pivot'}
                    </h2>
                </div>
                <p className="text-gray-400 text-sm leading-snug">
                    {algoType === 'dijkstra'
                        ? 'Adds every node to a massive sorting queue. The bottleneck is the "Sorting Tax" of re-sorting thousands of items.'
                        : 'Groups nodes into clusters and checks only leaders. Skips local friction via "Highways".'}
                </p>
            </div>
        </div>
    );
};
