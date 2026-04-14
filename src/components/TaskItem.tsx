import { cn } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import type { Task, Status, Priority } from "@/types";

interface TaskItemProps {
  task: Task;
  expanded: boolean;
  editing: boolean;
  editText: string;
  onToggleExpand: () => void;
  onStatusChange: (s: Status) => void;
  onPriorityChange: (p: Priority) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onEditTextChange: (s: string) => void;
  onDescriptionChange: (s: string) => void;
}

export function TaskItem({
  task, expanded, editing, editText,
  onToggleExpand, onStatusChange, onPriorityChange, onDelete,
  onStartEdit, onCommitEdit, onEditTextChange, onDescriptionChange,
}: TaskItemProps) {
  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card hover:bg-surface-mid transition-colors">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Priority dot */}
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: priority.color }} />

        {/* Task text */}
        {editing ? (
          <Input
            autoFocus
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") onCommitEdit(); if (e.key === "Escape") onCommitEdit(); }}
            className="flex-1 h-7 text-xs"
          />
        ) : (
          <span
            onClick={onStartEdit}
            className={cn(
              "flex-1 text-xs cursor-pointer truncate",
              task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
            )}
          >
            {task.text}
          </span>
        )}

        {/* Status badge */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as Status)}
          className={cn(
            "text-[10px] rounded-md px-2 py-0.5 border cursor-pointer appearance-none",
            status.className, "border-current/20"
          )}
        >
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Priority badge */}
        <select
          value={task.priority}
          onChange={(e) => onPriorityChange(e.target.value as Priority)}
          className="text-[10px] rounded-md px-2 py-0.5 border border-border bg-surface-mid text-muted-foreground cursor-pointer appearance-none"
        >
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="text-muted-foreground hover:text-foreground text-[10px] px-1"
        >
          {expanded ? "▾" : "▸"}
        </button>

        {/* Delete */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <Trash2 className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div className="px-3 pb-2 pt-0 border-t border-border/20">
          <Textarea
            autoFocus
            value={task.description ?? ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add notes or details..."
            rows={3}
            className="mt-2 text-xs bg-transparent border-none p-0 focus-visible:ring-0 text-muted-foreground"
          />
        </div>
      )}
    </div>
  );
}
