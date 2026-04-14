import { useApp } from "@/context";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskItem } from "./TaskItem";
import { ModuleIcon } from "./ModuleIcon";
import { Plus, Trash2, X, Tag } from "lucide-react";
import type { Status, Priority } from "@/types";

export function ModuleDetail() {
  const ctx = useApp();
  const {
    modules, activeModule, filter, setFilter,
    newTaskText, setNewTaskText, newPriority, setNewPriority, addTask,
    updateTask, deleteTask, expandedTask, setExpandedTask,
    editingTask, editTaskText, setEditTaskText, startEditTask, commitEditTask,
    newProjectName, setNewProjectName, showProjectInput, setShowProjectInput,
    addProject, removeProject,
    editingModuleId, editModuleName, setEditModuleName, editModuleSubtitle, setEditModuleSubtitle,
    startEditModule, commitEditModule, deleteModule,
  } = ctx;

  const active = modules.find((m) => m.id === activeModule);
  if (!active) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a module</div>;

  const filtered = active.tasks.filter((t) => filter === "all" || t.status === filter);

  const stats = {
    total: active.tasks.length,
    done: active.tasks.filter((t) => t.status === "done").length,
    inprogress: active.tasks.filter((t) => t.status === "inprogress").length,
    blocked: active.tasks.filter((t) => t.status === "blocked").length,
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Module header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ModuleIcon name={active.icon} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            {editingModuleId === active.id ? (
              <div className="flex flex-col gap-1">
                <Input value={editModuleName} onChange={(e) => setEditModuleName(e.target.value)}
                  onBlur={commitEditModule}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEditModule(); }}
                  className="h-7 text-sm font-bold" autoFocus />
                <Input value={editModuleSubtitle} onChange={(e) => setEditModuleSubtitle(e.target.value)}
                  onBlur={commitEditModule}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEditModule(); }}
                  className="h-6 text-xs" placeholder="Subtitle" />
              </div>
            ) : (
              <div onClick={() => startEditModule(active)} className="cursor-pointer">
                <h2 className="text-base font-bold text-foreground">{active.name}</h2>
                <p className="text-xs text-muted-foreground">{active.subtitle}</p>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteModule(active.id)}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Projects tags */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {active.projects.map((p) => (
            <Badge key={p} variant="outline" className="text-[10px] gap-1 pr-1">
              {p}
              <button onClick={() => removeProject(active.id, p)} className="ml-0.5 hover:text-destructive">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          {showProjectInput ? (
            <div className="flex gap-1">
              <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addProject(active.id); if (e.key === "Escape") setShowProjectInput(false); }}
                placeholder="Project name…" autoFocus className="h-6 w-28 text-[10px]" />
            </div>
          ) : (
            <button onClick={() => setShowProjectInput(true)}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
              <Tag className="h-2.5 w-2.5" /> Add project
            </button>
          )}
        </div>

        {/* Stats + filter */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{stats.total} tasks</span>
            {stats.done > 0 && <span className="text-[#3ec9a7]">{stats.done} done</span>}
            {stats.inprogress > 0 && <span className="text-[#e6a817]">{stats.inprogress} active</span>}
            {stats.blocked > 0 && <span className="text-[#e05c5c]">{stats.blocked} blocked</span>}
          </div>
          <div className="flex-1" />
          <div className="flex gap-1">
            {(["all", "todo", "inprogress", "done", "blocked"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "secondary" : "ghost"} size="sm"
                onClick={() => setFilter(f)}
                className={cn("h-6 text-[10px] px-2", filter === f && "bg-surface-high")}>
                {f === "all" ? "All" : STATUS_CONFIG[f].label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-1.5">
          {filtered.map((task) => {
            const key = `${active.id}:${task.id}`;
            return (
              <TaskItem
                key={task.id}
                task={task}
                expanded={expandedTask === key}
                editing={editingTask?.mid === active.id && editingTask?.tid === task.id}
                editText={editTaskText}
                onToggleExpand={() => setExpandedTask(expandedTask === key ? null : key)}
                onStatusChange={(s) => updateTask(active.id, task.id, { status: s })}
                onPriorityChange={(p) => updateTask(active.id, task.id, { priority: p })}
                onDelete={() => deleteTask(active.id, task.id)}
                onStartEdit={() => startEditTask(active.id, task)}
                onCommitEdit={commitEditTask}
                onEditTextChange={setEditTaskText}
                onDescriptionChange={(d) => updateTask(active.id, task.id, { description: d })}
              />
            );
          })}

          {/* Add task */}
          <div className="flex gap-2 mt-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTask(active.id); }}
              placeholder="Add a task…"
              className="flex-1 h-8 text-xs"
            />
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
              className="h-8 rounded-md border border-border bg-input px-2 text-xs text-muted-foreground cursor-pointer">
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <Button size="sm" onClick={() => addTask(active.id)} className="h-8">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
