import React from 'react';
import { TaskItem } from '../types';

interface TasksViewProps {
  selectedIndex: number;
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: () => void;
  onResetTasks: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  selectedIndex,
  tasks,
  onToggleTask,
  onAddTask,
  onResetTasks,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      {/* Title / Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            GLANCEABLE TASKS
          </span>
          <span className="text-xs font-mono text-zinc-400">
            {tasks.filter((t) => t.done).length}/{tasks.length} DONE
          </span>
        </div>

        {/* Task Items List (strictly limited to 4 to prevent any scrolling) */}
        <div className="space-y-2">
          {tasks.slice(0, 4).map((task, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(task.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-mono transition-all text-left ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-white hud-focus-active'
                    : 'border-zinc-800 text-zinc-300 bg-black'
                }`}
              >
                <div className="flex items-center space-x-3 truncate mr-2">
                  <span
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] font-bold ${
                      task.done
                        ? 'border-emerald-400 bg-emerald-500 text-black shadow-[0_0_6px_#00ff88]'
                        : 'border-zinc-600 bg-transparent text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`truncate text-sm ${
                      task.done ? 'line-through text-zinc-500' : 'text-zinc-200'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                  {task.done ? 'DONE' : 'PENDING'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Controls at the bottom */}
      <div className="space-y-2 mt-auto">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
          Select with [↑ / ↓], toggle with [ENTER]:
        </div>

        {/* Action: Add item (Index 4) */}
        <button
          type="button"
          onClick={onAddTask}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-md border text-xs font-mono transition-all text-left ${
            selectedIndex === 4
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-zinc-500">[+]</span>
            <span>Add Quick Task</span>
          </span>
          <span className="text-emerald-400 font-bold">ENTER</span>
        </button>

        {/* Action: Reset Sample tasks (Index 5) */}
        <button
          type="button"
          onClick={onResetTasks}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-md border text-xs font-mono transition-all text-left ${
            selectedIndex === 5
              ? 'border-emerald-400 bg-emerald-950/40 text-white hud-focus-active'
              : 'border-zinc-800 text-zinc-300 bg-black'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-zinc-500">[↺]</span>
            <span>Reset Default Checklist</span>
          </span>
          <span className="text-zinc-400">ENTER</span>
        </button>
      </div>
    </div>
  );
};
