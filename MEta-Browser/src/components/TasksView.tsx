import React from 'react';
import { TaskItem } from '../types';

interface TasksViewProps {
  selectedIndex: number;
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onOpenComposer: () => void;
  onResetTasks: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  selectedIndex,
  tasks = [],
  onToggleTask,
  onOpenComposer,
  onResetTasks,
}) => {
  const safeTasks = tasks || [];
  return (
    <div className="w-full h-full flex flex-col justify-between px-5 py-3 overflow-hidden">
      {/* Title / Header */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            GLANCEABLE CHECKLIST
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {safeTasks.filter((t) => t.done).length}/{safeTasks.length} DONE
          </span>
        </div>

        {/* Task Items List (strictly limited to 4 to guarantee zero overflow) */}
        <div className="space-y-1.5">
          {safeTasks.slice(0, 4).map((task, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(task.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
                    : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate mr-2">
                  <span
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      task.done
                        ? 'border-emerald-400 bg-emerald-500 text-black shadow-[0_0_6px_#00ff88]'
                        : 'border-zinc-600 bg-transparent text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`truncate text-xs ${
                      task.done ? 'line-through text-zinc-500' : 'text-zinc-200'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {task.done ? 'DONE' : 'PENDING'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Controls at the bottom */}
      <div className="space-y-1.5 mt-auto">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
          D-Pad [↑ / ↓], Toggle/Execute [ENTER]:
        </div>

        {/* Action: Add item via Composer (Index 4) */}
        <button
          type="button"
          onClick={onOpenComposer}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 4
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[+]</span>
            <span>Open On-Glasses Composer</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">VOICE/TEXT</span>
        </button>

        {/* Action: Reset Sample tasks (Index 5) */}
        <button
          type="button"
          onClick={onResetTasks}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all text-left focusable ${
            selectedIndex === 5
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-[#14141f]'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">[↺]</span>
            <span>Reset Default Checklist</span>
          </span>
          <span className="text-[10px] text-zinc-400">ENTER</span>
        </button>
      </div>
    </div>
  );
};
