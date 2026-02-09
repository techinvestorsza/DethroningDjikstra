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
        <div className="flex flex-col gap-10 pt-2">
            <div className="space-y-3">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1 block mb-2">Strategy Algorithm</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => { setIsRunning(false); setAlgoType('dijkstra'); resetGraph(); }}
                        className={`flex-1 h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden group ${algoType === 'dijkstra' ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'hover:bg-gray-800'}`}
                    >
                        <div className={`absolute inset-0 opacity-20 ${algoType === 'dijkstra' ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${algoType === 'dijkstra' ? 'from-blue-600/80 to-blue-900/80' : 'from-gray-800 to-gray-900'} opacity-100`}></div>
                        <span className={`relative z-10 ${algoType === 'dijkstra' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Traditional</span>
                    </button>
                    <button
                        onClick={() => { setIsRunning(false); setAlgoType('hybrid'); resetGraph(); }}
                        className={`flex-1 h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden group ${algoType === 'hybrid' ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'hover:bg-gray-800'}`}
                    >
                        <div className={`absolute inset-0 opacity-20 ${algoType === 'hybrid' ? 'bg-purple-600' : 'bg-transparent'}`}></div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${algoType === 'hybrid' ? 'from-purple-600/80 to-purple-900/80' : 'from-gray-800 to-gray-900'} opacity-100`}></div>
                        <span className={`relative z-10 ${algoType === 'hybrid' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Hybrid</span>
                    </button>
                </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-end">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1 block mb-2">Simulation Control</label>
                <div className="flex gap-3">
                    <button
                        onClick={toggleRun}
                        className={`flex-[2] py-4 rounded-xl font-bold tracking-widest transition-all duration-200 shadow-lg border border-white/5 relative overflow-hidden group ${isRunning ? 'text-yellow-400' : 'text-green-400'}`}
                    >
                        <div className={`absolute inset-0 opacity-10 ${isRunning ? 'bg-yellow-500' : 'bg-green-500'} group-hover:opacity-20 transition-opacity`}></div>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isRunning ? (
                                <><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> PAUSE</>
                            ) : (
                                <><span className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-green-400 border-b-[5px] border-b-transparent ml-1"></span> START</>
                            )}
                        </span>
                    </button>
                    <button
                        onClick={resetGraph}
                        className="flex-1 px-4 py-4 bg-gray-800/50 border border-gray-700 text-gray-400 rounded-xl font-bold hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 text-xs tracking-wider uppercase"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};
