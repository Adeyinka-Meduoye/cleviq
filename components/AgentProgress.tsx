
import React from 'react';
import { AgentState } from '../types';

interface Props {
  agent: AgentState;
}

export const AgentProgress: React.FC<Props> = ({ agent }) => {
  const isWorking = agent.status === 'working';
  const isCompleted = agent.status === 'completed';

  return (
    <div className={`p-6 rounded-3xl transition-all duration-500 ${isWorking ? 'bg-indigo-950/30 border-2 border-indigo-600 shadow-xl shadow-indigo-950/40' : 'bg-slate-900 border border-slate-800'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isWorking ? 'bg-indigo-500 animate-ping' : isCompleted ? 'bg-green-500' : 'bg-slate-700'}`} />
          <h4 className={`font-black uppercase tracking-widest text-xs ${isWorking ? 'text-indigo-400' : 'text-slate-100'}`}>{agent.name}</h4>
        </div>
        {isCompleted && <span className="text-[10px] font-black text-green-500 uppercase bg-green-950/50 border border-green-900/50 px-2 py-0.5 rounded">Synced</span>}
      </div>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">{agent.description}</p>
      
      {isWorking && (
        <div className="mt-5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div className="h-full bg-indigo-600 rounded-full animate-[progress_2s_infinite]" style={{ width: '40%' }} />
        </div>
      )}
    </div>
  );
};
