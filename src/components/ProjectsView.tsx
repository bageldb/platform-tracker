import { useApp } from "@/context";
import { cn } from "@/lib/utils";
import { projectColor, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { ModuleIcon } from "./ModuleIcon";
import type { Status, Priority } from "@/types";

export function ProjectsView() {
  const ctx = useApp();
  const {
    modules, allProjects, selectedProject, setSelectedProject, navigateTo,
    projectTasks, newProjTaskText, setNewProjTaskText, newProjTaskPri, setNewProjTaskPri,
    addProjectTask, updateProjectTask, deleteProjectTask,
    expandedProjTask, setExpandedProjTask,
    editingProjTask, editProjTaskText, setEditProjTaskText, setEditingProjTask,
    setView,
  } = ctx;

  const stats = (m: typeof modules[0]) => ({
    total: m.tasks.length,
    done: m.tasks.filter((t) => t.status === "done").length,
    inprogress: m.tasks.filter((t) => t.status === "inprogress").length,
    blocked: m.tasks.filter((t) => t.status === "blocked").length,
  });

  // Project list view
  if (!selectedProject) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-bold">Projects</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Tag modules with projects to see them grouped here</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-5 grid grid-cols-2 gap-3">
            {allProjects.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center mt-10">No projects yet. Tag a module with a project to get started.</p>
            )}
            {allProjects.map((proj) => {
              const color = projectColor(proj);
              const mods = modules.filter((m) => m.projects.includes(proj));
              const pts = projectTasks[proj] ?? [];
              const taskCount = mods.reduce((a, m) => a + m.tasks.length, 0) + pts.length;
              return (
                <button key={proj} onClick={() => setSelectedProject(proj)}
                  className="rounded-lg border border-border bg-card p-4 text-left hover:bg-surface-mid transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="text-sm font-semibold text-foreground">{proj}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mods.length} module{mods.length !== 1 && "s"} · {taskCount} task{taskCount !== 1 && "s"}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Project drill-in
  const color = projectColor(selectedProject);
  const pts = projectTasks[selectedProject] ?? [];
  const projectModules = modules.filter((m) => m.projects.includes(selectedProject));

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedProject(null)}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <h2 className="text-base font-bold">{selectedProject}</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 flex flex-col gap-5">
          {/* Project-level tasks */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Project Tasks</h3>
            <div className="flex flex-col gap-1.5">
              {pts.map((task) => {
                const pkey = `${selectedProject}:${task.id}`;
                const isExp = expandedProjTask === pkey;
                return (
                  <div key={task.id} className="border border-border rounded-md bg-surface-mid">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PRIORITY_CONFIG[task.priority].color }} />
                      {editingProjTask?.proj === selectedProject && editingProjTask?.tid === task.id ? (
                        <Input autoFocus value={editProjTaskText}
                          onChange={(e) => setEditProjTaskText(e.target.value)}
                          onBlur={() => { if (editProjTaskText.trim()) updateProjectTask(selectedProject, task.id, { text: editProjTaskText.trim() }); setEditingProjTask(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { if (editProjTaskText.trim()) updateProjectTask(selectedProject, task.id, { text: editProjTaskText.trim() }); setEditingProjTask(null); } }}
                          className="flex-1 h-6 text-xs" />
                      ) : (
                        <span onClick={() => { setEditingProjTask({ proj: selectedProject, tid: task.id }); setEditProjTaskText(task.text); }}
                          className={cn("flex-1 text-xs cursor-pointer", task.status === "done" && "line-through text-muted-foreground")}>
                          {task.text}
                        </span>
                      )}
                      <select value={task.priority} onChange={(e) => updateProjectTask(selectedProject, task.id, { priority: e.target.value as Priority })}
                        className="text-[10px] rounded px-1.5 py-0.5 border border-border bg-input text-muted-foreground cursor-pointer">
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <select value={task.status} onChange={(e) => updateProjectTask(selectedProject, task.id, { status: e.target.value as Status })}
                        className={cn("text-[10px] rounded px-1.5 py-0.5 border cursor-pointer", STATUS_CONFIG[task.status].className, "border-current/20")}>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <button onClick={() => setExpandedProjTask(isExp ? null : pkey)} className="text-muted-foreground text-[10px] px-1">{isExp ? "▾" : "▸"}</button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteProjectTask(selectedProject, task.id)}>
                        <Trash2 className="h-2.5 w-2.5 text-muted-foreground" />
                      </Button>
                    </div>
                    {isExp && (
                      <div className="px-3 pb-2 border-t border-border/20">
                        <textarea value={task.description ?? ""} onChange={(e) => updateProjectTask(selectedProject, task.id, { description: e.target.value })}
                          placeholder="Add notes..." rows={2}
                          className="w-full bg-transparent border-none text-xs text-muted-foreground outline-none mt-1 resize-none" />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Add project task */}
              <div className="flex gap-1.5 mt-2">
                <Input value={newProjTaskText} onChange={(e) => setNewProjTaskText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addProjectTask(selectedProject); }}
                  placeholder="Add project task…" className="flex-1 h-7 text-xs" />
                <select value={newProjTaskPri} onChange={(e) => setNewProjTaskPri(e.target.value)}
                  className="h-7 rounded-md border border-border bg-input px-2 text-xs text-muted-foreground cursor-pointer">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <Button size="sm" onClick={() => addProjectTask(selectedProject)} className="h-7 text-xs">Add</Button>
              </div>
            </div>
          </div>

          {/* Modules in this project */}
          <div className="flex flex-col gap-2">
            {projectModules.map((m) => {
              const s = stats(m);
              return (
                <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                    <ModuleIcon name={m.icon} className="h-3.5 w-3.5" style={{ color }} />
                    <div className="flex-1">
                      <div className="text-xs font-semibold">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.subtitle}</div>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      {s.blocked > 0 && <span className="text-[#ef4444]">{s.blocked} blocked</span>}
                      {s.inprogress > 0 && <span className="text-[#f59e0b]">{s.inprogress} active</span>}
                      <span className="text-muted-foreground">{s.done}/{s.total} done</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]"
                      onClick={() => { setView("modules"); navigateTo(m.id); }}>
                      Open →
                    </Button>
                  </div>
                  {m.tasks.length > 0 && (
                    <div className="px-4 py-2">
                      {m.tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2 py-1 border-b border-border/10 last:border-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIORITY_CONFIG[t.priority].color }} />
                          <span className={cn("flex-1 text-[11px]", t.status === "done" ? "text-muted-foreground line-through" : "text-foreground/80")}>
                            {t.text}
                          </span>
                          <span className="text-[10px]" style={{ color: STATUS_CONFIG[t.status].className.includes("#3ec9a7") ? "#3ec9a7" : undefined }}>
                            {STATUS_CONFIG[t.status].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
