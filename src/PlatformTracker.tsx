import { useState, useEffect, useRef } from "react";
import netlifyIdentity from "netlify-identity-widget";
import { AppContext } from "./context";
import type { View, Filter } from "./context";
import type { Module, Task, ChatMessage, Conversation } from "./types";
import { authFetch, parseHash, buildHash } from "./lib/auth";
import { initialModules, getNextTaskId, bumpNextTaskId } from "./lib/constants";
import { Button } from "@/components/ui/button";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { ModuleDetail } from "@/components/ModuleDetail";
import { ProjectsView } from "@/components/ProjectsView";
import { ChatPanel } from "@/components/ChatPanel";
import { MessageSquare, LogOut } from "lucide-react";

netlifyIdentity.init();

export default function PlatformTracker() {
  const [user, setUser] = useState(() => netlifyIdentity.currentUser());
  const [modules, setModules] = useState<Module[] | null>(null);

  const initial = parseHash();
  const [view, setView] = useState<View>(initial.view as View);
  const [activeModule, setActiveModule] = useState(initial.activeModule);
  const [selectedProject, setSelectedProject] = useState<string | null>(initial.selectedProject);

  // Netlify Identity: listen for login/logout
  useEffect(() => {
    const onLogin = (u: any) => { setUser(u); netlifyIdentity.close(); };
    const onLogout = () => setUser(null);
    netlifyIdentity.on("login", onLogin);
    netlifyIdentity.on("logout", onLogout);
    return () => {
      netlifyIdentity.off("login", onLogin);
      netlifyIdentity.off("logout", onLogout);
    };
  }, []);

  // Auth gate
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground gap-4">
        <div className="text-xl font-bold">Platform Tracker</div>
        <div className="text-sm text-muted-foreground">Sign in to continue</div>
        <Button onClick={() => netlifyIdentity.open("login")} className="px-7 py-2.5 text-sm font-semibold">
          Sign In
        </Button>
      </div>
    );
  }

  // Keep URL in sync with state
  useEffect(() => {
    const hash = buildHash(view, activeModule, selectedProject);
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
  }, [view, activeModule, selectedProject]);

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => {
      const { view: v, activeModule: m, selectedProject: p } = parseHash();
      setView(v as View);
      setActiveModule(m);
      setSelectedProject(p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigateTo = (id: string) => {
    setView("modules");
    setActiveModule(id);
    setTimeout(() => {
      document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const [filter, setFilter] = useState<Filter>("all");
  const [newTaskText, setNewTaskText] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const prevModulesRef = useRef<Module[] | null>(null);
  const initialLoadDone = useRef(false);
  const [editingTask, setEditingTask] = useState<{ mid: string; tid: number } | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [newProjTaskText, setNewProjTaskText] = useState("");
  const [newProjTaskPri, setNewProjTaskPri] = useState("medium");
  const [expandedProjTask, setExpandedProjTask] = useState<string | null>(null);
  const [editingProjTask, setEditingProjTask] = useState<{ proj: string; tid: number } | null>(null);
  const [editProjTaskText, setEditProjTaskText] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatView, setChatView] = useState<"chat" | "history">("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convId, setConvId] = useState(() => crypto.randomUUID());
  const [convTitle, setConvTitle] = useState("");
  const [convsLoading, setConvsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null!);
  const convSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleName, setEditModuleName] = useState("");
  const [editModuleSubtitle, setEditModuleSubtitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");

  // Auto-generate title from first user message
  useEffect(() => {
    if (!convTitle && chatMessages.length > 0) {
      const first = chatMessages.find(m => m.role === "user");
      if (first) setConvTitle(first.text.slice(0, 60).replace(/\n/g, " "));
    }
  }, [chatMessages, convTitle]);

  // Debounced save after each message
  useEffect(() => {
    if (chatMessages.length === 0) return;
    const hasComplete = chatMessages.some(m => m.role === "assistant" && !m.streaming);
    if (!hasComplete) return;
    if (convSaveTimer.current) clearTimeout(convSaveTimer.current);
    convSaveTimer.current = setTimeout(() => saveConversation(), 1500);
  }, [chatMessages]);

  const saveConversation = async () => {
    const title = convTitle || chatMessages.find(m => m.role === "user")?.text?.slice(0, 60) || "Untitled";
    const clean = chatMessages.filter(m => !m.streaming).map(({ role, text, toolCalls }) => ({ role, text, toolCalls }));
    if (clean.length === 0) return;
    await authFetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: convId, title, messages: clean }),
    });
  };

  const loadConversations = async () => {
    setConvsLoading(true);
    try {
      const res = await authFetch("/api/conversations");
      const { conversations: list } = await res.json();
      setConversations(list ?? []);
    } finally {
      setConvsLoading(false);
    }
  };

  const openConversation = async (id: string) => {
    const res = await authFetch(`/api/conversations?id=${id}`);
    const { conversation } = await res.json();
    setConvId(conversation.id);
    setConvTitle(conversation.title);
    setChatMessages(conversation.messages ?? []);
    setChatView("chat");
    setTimeout(() => chatEndRef.current?.scrollIntoView(), 50);
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await authFetch("/api/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConversations(p => p.filter(c => c.id !== id));
    if (id === convId) newConversation();
  };

  const newConversation = () => {
    setConvId(crypto.randomUUID());
    setConvTitle("");
    setChatMessages([]);
    setChatView("chat");
  };

  const openHistory = () => {
    setChatView("history");
    loadConversations();
  };

  // Load state from API
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("/api/state");
        const { data: saved } = await res.json();
        if (saved) {
          const projEntry = saved.find((m: any) => m.id === "__projects__");
          if (projEntry?.projectTasks) setProjectTasks(projEntry.projectTasks);
          const moduleData = saved.filter((m: any) => m.id !== "__projects__");
          const savedIds = new Set(moduleData.map((m: any) => m.id));
          const unseeded = initialModules.filter(m => !savedIds.has(m.id));
          const all = [...moduleData, ...unseeded];
          const maxId = all.flatMap((m: Module) => m.tasks).reduce((max: number, t: Task) => Math.max(max, t.id), 99);
          bumpNextTaskId(maxId);
          setModules(all);
        } else {
          setModules(initialModules);
        }
      } catch {
        setModules(initialModules);
      }
      setLoading(false);
    })();
  }, []);

  // Auto-save modules on change
  useEffect(() => {
    if (!modules) return;
    if (!initialLoadDone.current) {
      prevModulesRef.current = modules;
      initialLoadDone.current = true;
      return;
    }
    const prev = prevModulesRef.current ?? [];
    const saves: Promise<Response>[] = [];

    modules.forEach((m, i) => {
      const p = prev.find(x => x.id === m.id);
      if (!p || JSON.stringify(p) !== JSON.stringify(m)) {
        saves.push(
          authFetch("/api/module", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ module: m, position: i }),
          })
        );
      }
    });

    prev.forEach(p => {
      if (!modules.find(m => m.id === p.id)) {
        saves.push(
          authFetch("/api/module", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id }),
          })
        );
      }
    });

    if (saves.length > 0) {
      setSaving(true);
      Promise.all(saves)
        .catch(console.error)
        .finally(() => setTimeout(() => setSaving(false), 500));
    }
    prevModulesRef.current = modules;
  }, [modules]);

  // Auto-save project tasks
  const prevProjTasksRef = useRef<Record<string, Task[]> | null>(null);
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (JSON.stringify(projectTasks) === JSON.stringify(prevProjTasksRef.current)) return;
    prevProjTasksRef.current = projectTasks;
    authFetch("/api/module", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: { id: "__projects__", projectTasks }, position: -1 }),
    }).catch(console.error);
  }, [projectTasks]);

  const allProjects = [...new Set(modules?.flatMap(m => m.projects) || [])].sort();

  // ── CRUD handlers ──
  const updateTask = (mid: string, tid: number, changes: Partial<Task>) =>
    setModules(p => p!.map(m => m.id === mid ? { ...m, tasks: m.tasks.map(t => t.id === tid ? { ...t, ...changes } : t) } : m));

  const addTask = (mid: string) => {
    if (!newTaskText.trim()) return;
    setModules(p => p!.map(m => m.id === mid
      ? { ...m, tasks: [...m.tasks, { id: getNextTaskId(), text: newTaskText.trim(), status: "todo", priority: newPriority as Task["priority"] }] }
      : m));
    setNewTaskText("");
  };

  const deleteTask = (mid: string, tid: number) =>
    setModules(p => p!.map(m => m.id === mid ? { ...m, tasks: m.tasks.filter(t => t.id !== tid) } : m));

  const addProject = (mid: string) => {
    const name = newProjectName.trim();
    if (!name) return;
    setModules(p => p!.map(m => m.id === mid
      ? { ...m, projects: m.projects.includes(name) ? m.projects : [...m.projects, name] }
      : m));
    setNewProjectName("");
    setShowProjectInput(false);
  };

  const removeProject = (mid: string, proj: string) =>
    setModules(p => p!.map(m => m.id === mid ? { ...m, projects: m.projects.filter(x => x !== proj) } : m));

  const startEditTask = (mid: string, task: Task) => { setEditingTask({ mid, tid: task.id }); setEditTaskText(task.text); };
  const commitEditTask = () => {
    if (editingTask && editTaskText.trim()) updateTask(editingTask.mid, editingTask.tid, { text: editTaskText.trim() });
    setEditingTask(null);
  };

  const startEditModule = (m: Module) => { setEditingModuleId(m.id); setEditModuleName(m.name); setEditModuleSubtitle(m.subtitle || ""); };
  const commitEditModule = () => {
    if (!editModuleName.trim()) { setEditingModuleId(null); return; }
    setModules(p => p!.map(m => m.id === editingModuleId ? { ...m, name: editModuleName.trim(), subtitle: editModuleSubtitle.trim() } : m));
    setEditingModuleId(null);
  };

  const addModule = () => {
    const name = newModuleName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    setModules(p => [...p!, { id, name, subtitle: "", icon: "Utils", projects: [], tasks: [] }]);
    setNewModuleName("");
    setShowAddModule(false);
    setTimeout(() => navigateTo(id), 50);
  };

  const deleteModule = (mid: string) => {
    if (!confirm("Delete this module and all its tasks?")) return;
    setModules(p => p!.filter(m => m.id !== mid));
  };

  const addProjectTask = (proj: string) => {
    if (!newProjTaskText.trim()) return;
    setProjectTasks(p => ({
      ...p,
      [proj]: [...(p[proj] ?? []), { id: Date.now(), text: newProjTaskText.trim(), status: "todo", priority: newProjTaskPri as Task["priority"], description: "" }],
    }));
    setNewProjTaskText("");
  };

  const updateProjectTask = (proj: string, tid: number, changes: Partial<Task>) =>
    setProjectTasks(p => ({ ...p, [proj]: (p[proj] ?? []).map(t => t.id === tid ? { ...t, ...changes } : t) }));

  const deleteProjectTask = (proj: string, tid: number) =>
    setProjectTasks(p => ({ ...p, [proj]: (p[proj] ?? []).filter(t => t.id !== tid) }));

  // ── AI tool call execution ──
  const executeToolCall = ({ name, input }: { name: string; input: Record<string, unknown> }) => {
    switch (name) {
      case "add_module_task":
        setModules(p => p!.map(m => m.id === input.moduleId
          ? { ...m, tasks: [...m.tasks, { id: getNextTaskId(), text: input.text as string, status: "todo", priority: (input.priority as Task["priority"]) || "medium", description: (input.description as string) ?? "" }] }
          : m));
        break;
      case "update_module_task":
        setModules(p => p!.map(m => m.id === input.moduleId
          ? { ...m, tasks: m.tasks.map(t => t.id === input.taskId ? { ...t, ...(input as any) } : t) }
          : m));
        break;
      case "add_project_task":
        setProjectTasks(p => ({
          ...p,
          [(input.project as string)]: [...(p[input.project as string] ?? []), {
            id: Date.now() + Math.random(),
            text: input.text as string,
            status: "todo",
            priority: (input.priority as Task["priority"]) || "medium",
            description: (input.description as string) ?? "",
          }],
        }));
        break;
      case "update_project_task":
        setProjectTasks(p => ({
          ...p,
          [(input.project as string)]: (p[input.project as string] ?? []).map(t => t.id === input.taskId ? { ...t, ...(input as any) } : t),
        }));
        break;
      case "add_project_to_module":
        setModules(p => p!.map(m => m.id === input.moduleId
          ? { ...m, projects: m.projects.includes(input.project as string) ? m.projects : [...m.projects, input.project as string] }
          : m));
        break;
      default:
        break;
    }
  };

  // ── Streaming SSE chat ──
  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");

    const userMsg: ChatMessage = { role: "user", text };
    setChatMessages(p => [...p, userMsg]);
    setChatLoading(true);

    const apiMessages = [...chatMessages, userMsg]
      .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

    const state = {
      modules: (modules ?? []).map(m => ({
        id: m.id, name: m.name, subtitle: m.subtitle, projects: m.projects,
        tasks: m.tasks.map(t => ({ id: t.id, text: t.text, status: t.status, priority: t.priority, description: t.description })),
      })),
      projectTasks: Object.fromEntries(
        Object.entries(projectTasks).map(([proj, tasks]) => [proj, tasks.map(t => ({ id: t.id, text: t.text, status: t.status, priority: t.priority }))])
      ),
      focus: view === "projects"
        ? { type: "project", name: selectedProject ?? null }
        : { type: "module", id: activeModule },
    };

    setChatMessages(p => [...p, { role: "assistant", text: "", toolCalls: [], streaming: true }]);

    try {
      const res = await authFetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, state }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });

        const chunks = buf.split("\n\n");
        buf = chunks.pop()!;

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          let eventType = "";
          let dataStr = "";
          for (const line of chunk.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
          }
          if (!dataStr) continue;
          let evt: any;
          try { evt = JSON.parse(dataStr); } catch { continue; }

          if (eventType === "token") {
            setChatMessages(p => {
              const next = [...p];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                next[next.length - 1] = { ...last, text: last.text + evt.text };
              }
              return next;
            });
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
          } else if (eventType === "tool_call") {
            executeToolCall(evt);
            setChatMessages(p => {
              const next = [...p];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                next[next.length - 1] = { ...last, toolCalls: [...(last.toolCalls ?? []), evt] };
              }
              return next;
            });
          } else if (eventType === "done") {
            setChatMessages(p => {
              const next = [...p];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                next[next.length - 1] = { ...last, streaming: false };
              }
              return next;
            });
          } else if (eventType === "error") {
            throw new Error(evt.message);
          }
        }
      }
    } catch (err: any) {
      setChatMessages(p => {
        const next = [...p];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last.streaming) {
          next[next.length - 1] = { role: "assistant", text: `Error: ${err.message}`, toolCalls: [], streaming: false };
        } else {
          next.push({ role: "assistant", text: `Error: ${err.message}`, toolCalls: [] });
        }
        return next;
      });
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  // ── Loading state ──
  if (loading || !modules) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  // ── Stats for nav bar ──
  const totals = modules.reduce(
    (a, m) => {
      a.total += m.tasks.length;
      a.done += m.tasks.filter(t => t.status === "done").length;
      a.inprogress += m.tasks.filter(t => t.status === "inprogress").length;
      a.blocked += m.tasks.filter(t => t.status === "blocked").length;
      return a;
    },
    { total: 0, done: 0, inprogress: 0, blocked: 0 }
  );

  // ── Context value ──
  const ctxValue = {
    view, setView, activeModule, selectedProject, navigateTo, setSelectedProject,
    modules, saving, allProjects,
    addTask, updateTask, deleteTask, addProject, removeProject,
    addModule, deleteModule, startEditModule, commitEditModule,
    filter, setFilter, newTaskText, setNewTaskText, newPriority, setNewPriority,
    editingTask, editTaskText, setEditTaskText, startEditTask, commitEditTask,
    expandedTask, setExpandedTask,
    newProjectName, setNewProjectName, showProjectInput, setShowProjectInput,
    editingModuleId, editModuleName, setEditModuleName, editModuleSubtitle, setEditModuleSubtitle,
    showAddModule, setShowAddModule, newModuleName, setNewModuleName,
    projectTasks, newProjTaskText, setNewProjTaskText, newProjTaskPri, setNewProjTaskPri,
    expandedProjTask, setExpandedProjTask,
    editingProjTask, editProjTaskText, setEditProjTaskText, setEditingProjTask,
    addProjectTask, updateProjectTask, deleteProjectTask,
    chatOpen, setChatOpen, chatMessages, setChatMessages, chatInput, setChatInput,
    chatLoading, chatView, setChatView, conversations, convsLoading, convId, convTitle,
    sendChatMessage, executeToolCall, openConversation, deleteConversation, newConversation, openHistory,
    chatEndRef,
  };

  return (
    <AppContext.Provider value={ctxValue}>
      <div className="h-screen flex flex-col bg-background text-foreground font-sans">
        {/* Top nav */}
        <div className="px-6 py-3.5 border-b border-border shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight">Module Tracker</h1>
            <span className={`text-xs ${saving ? "text-muted-foreground" : "text-emerald-500"}`}>
              {saving ? "saving..." : "✓"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* Stats */}
            <div className="flex gap-5">
              {[
                { label: "Total", value: totals.total, cls: "text-muted-foreground" },
                { label: "Active", value: totals.inprogress, cls: "text-amber-500" },
                { label: "Blocked", value: totals.blocked, cls: "text-red-500" },
                { label: "Done", value: totals.done, cls: "text-emerald-500" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-xl font-bold ${s.cls}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex gap-1 bg-surface-mid p-0.5 rounded-lg border border-border">
              {(["modules", "projects"] as const).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => { setView(v); setSelectedProject(null); setFilter("all"); }}
                  className={`text-xs px-4 ${view === v ? "bg-surface-high font-semibold" : "text-muted-foreground"}`}
                >
                  {v === "modules" ? "Modules" : "Projects"}
                </Button>
              ))}
            </div>

            {/* Chat toggle */}
            <Button
              variant={chatOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setChatOpen(o => !o)}
              className="gap-1.5 text-xs font-semibold"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              AI
            </Button>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => netlifyIdentity.logout()}
              title={(user as any)?.email}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {view === "modules" && (
            <>
              <ModuleSidebar />
              <ModuleDetail />
            </>
          )}
          {view === "projects" && <ProjectsView />}
          <ChatPanel />
        </div>
      </div>
    </AppContext.Provider>
  );
}
