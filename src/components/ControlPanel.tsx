import React from 'react';

interface ControlPanelProps {
    algoType: 'dijkstra' | 'hybrid';
    setAlgoType: (type: 'dijkstra' | 'hybrid') => void;
    isRunning: boolean;
    toggleRun: () => void;
    resetGraph: () => void;
    setIsRunning: (running: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    algoType,
    setAlgoType,
    isRunning,
    toggleRun,
    resetGraph,
    setIsRunning
}) => {
    return (
        <div className="flex flex-col gap-8 bg-gray-900/50 p-10 rounded-xl border border-gray-800">
            <div className="space-y-3">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold ml-1 block mb-1">Strategy</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => { setIsRunning(false); setAlgoType('dijkstra'); resetGraph(); }}
                        className={`flex-1 h-14 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${algoType === 'dijkstra' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] ring-2 ring-blue-500/30' : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:shadow-lg'}`}
                    >
                        Traditional
                    </button>
                    <button
                        onClick={() => { setIsRunning(false); setAlgoType('hybrid'); resetGraph(); }}
                        className={`flex-1 h-14 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${algoType === 'hybrid' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)] ring-2 ring-purple-500/30' : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700 hover:border-gray-500 hover:text-white hover:shadow-lg'}`}
                    >
                        Hybrid
                    </button>
                </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-end">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold ml-1 block mb-1">Simulation</label>
                <div className="flex gap-4">
                    <button
                        onClick={toggleRun}
                        className={`flex-1 py-3 rounded-full font-bold tracking-wide transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border ${isRunning ? 'bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400 hover:shadow-yellow-500/20' : 'bg-green-600 border-green-500 text-white hover:bg-green-500 hover:shadow-green-500/30'}`}
                    >
                        {isRunning ? 'PAUSE' : 'START'}
                    </button>
                    <button
                        onClick={resetGraph}
                        className="px-6 py-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-full font-medium hover:bg-red-900/30 hover:text-red-400 hover:border-red-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
};
