import { useState, useEffect, useRef } from "react";

const STATUS = {
  todo:       { label: "To Do",       color: "#8b8fa8", bg: "#2a2b36" },
  inprogress: { label: "In Progress", color: "#e6a817", bg: "#2e2410" },
  done:       { label: "Done",        color: "#3ec9a7", bg: "#0f2820" },
  blocked:    { label: "Blocked",     color: "#e05c5c", bg: "#2e1515" },
};

const PRIORITY = {
  high:   { label: "High", color: "#ef4444" },
  medium: { label: "Med",  color: "#f59e0b" },
  low:    { label: "Low",  color: "#636580" },
};

const Icons = {
  Blox:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Person:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Auth:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Invitation: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 12 19.79 19.79 0 0 1 1.08 3.38 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 8 8l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 18z"/></svg>,
  Org:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Agent:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Knowledge:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  DataStore:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  Ecommerce:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  Payment:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Donation:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Invoicing:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Forms:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Automation: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Email:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  WhatsApp:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  SMS:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Pipeline:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="4" height="18"/><rect x="10" y="3" width="4" height="12"/><rect x="17" y="3" width="4" height="8"/></svg>,
  Exams:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Checkin:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Files:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Notes:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Analytics:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Utils:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Project:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>,
  Tag:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Plus:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:          () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const initialModules = [
  { id: "blox",       name: "Blox",       subtitle: "Page Designer",             icon: "Blox",       projects: [], tasks: [
    { id: 1, text: "Make deployable as standalone package",   status: "inprogress", priority: "high" },
    { id: 2, text: "New project scaffolding / easy init",     status: "inprogress", priority: "high" },
    { id: 3, text: "Module independence from other packages", status: "todo",       priority: "high" },
    { id: 4, text: "Production build validation",             status: "todo",       priority: "high" },
  ]},
  { id: "person",     name: "Person",     subtitle: "Contacts",                  icon: "Person",     projects: [], tasks: [] },
  { id: "auth",       name: "Auth",       subtitle: "SSO / OTP / 2FA / RBAC",   icon: "Auth",       projects: [], tasks: [] },
  { id: "invitation", name: "Invitation", subtitle: "Invite System",             icon: "Invitation", projects: [], tasks: [] },
  { id: "org",        name: "Org",        subtitle: "Org Management",            icon: "Org",        projects: [], tasks: [] },
  { id: "agent",      name: "Agent",      subtitle: "AI Engine",                 icon: "Agent",      projects: [], tasks: [] },
  { id: "knowledge",  name: "Knowledge",  subtitle: "Document Store",            icon: "Knowledge",  projects: [], tasks: [] },
  { id: "datastore",  name: "Data Store", subtitle: "Dynamic Schemas",           icon: "DataStore",  projects: [], tasks: [] },
  { id: "ecommerce",  name: "Ecommerce",  subtitle: "Products / Orders",         icon: "Ecommerce",  projects: [], tasks: [] },
  { id: "payment",    name: "Payment",    subtitle: "General Payments",          icon: "Payment",    projects: [], tasks: [] },
  { id: "donation",   name: "Donation",   subtitle: "Donation Management",       icon: "Donation",   projects: [], tasks: [] },
  { id: "invoicing",  name: "Invoicing",  subtitle: "Payables / Receivables",   icon: "Invoicing",  projects: [], tasks: [] },
  { id: "forms",      name: "Forms",      subtitle: "Form Builder",              icon: "Forms",      projects: [], tasks: [] },
  { id: "automation", name: "Automation", subtitle: "Events & Actions",          icon: "Automation", projects: [], tasks: [] },
  { id: "email",      name: "Email",      subtitle: "Newsletter / Transactional",icon: "Email",      projects: [], tasks: [] },
  { id: "whatsapp",   name: "WhatsApp",   subtitle: "Conversations / Broadcast", icon: "WhatsApp",   projects: [], tasks: [] },
  { id: "sms",        name: "SMS",        subtitle: "SMS Messaging",             icon: "SMS",        projects: [], tasks: [] },
  { id: "pipeline",   name: "Pipeline",   subtitle: "Kanban / Process",          icon: "Pipeline",   projects: [], tasks: [] },
  { id: "exams",      name: "Exams",      subtitle: "Evaluations",               icon: "Exams",      projects: [], tasks: [] },
  { id: "checkin",    name: "Check-in",   subtitle: "Live Events",               icon: "Checkin",    projects: [], tasks: [] },
  { id: "files",      name: "Files",      subtitle: "File Storage",              icon: "Files",      projects: [], tasks: [] },
  { id: "notes",      name: "Notes",      subtitle: "Attached Notes",            icon: "Notes",      projects: [], tasks: [] },
  { id: "analytics",  name: "Analytics",  subtitle: "Graph / SQL / Timescale",   icon: "Analytics",  projects: [], tasks: [] },
  { id: "utils",      name: "Utils",      subtitle: "QR / Integrations",         icon: "Utils",      projects: [], tasks: [] },
];

let nextTaskId = 100;
const STORAGE_KEY = "platform-modules-v3";

const C = {
  bg:           "#1e1f2e",
  surface:      "#262735",
  surfaceMid:   "#2e2f40",
  surfaceHigh:  "#383a4e",
  border:       "#3a3c50",
  borderBright: "#525470",
  textPrimary:  "#d4d6e8",
  textSecondary:"#9698b0",
  textMuted:    "#636580",
};

// Deterministic color from string
const projectColor = (name) => {
  const colors = ["#7c6af7","#e87c3e","#4ec9a0","#e86e6e","#e8c86e","#6eaae8","#c46ee8","#6ee8c4","#e86eae","#8ee86e"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
};

export default function PlatformTracker() {
  const [modules, setModules]           = useState(null);
  const [view, setView]                 = useState("modules"); // "modules" | "projects"
  const [activeModule, setActiveModule] = useState(() => window.location.hash.slice(1) || "blox");

  const navigateTo = (id) => {
    setActiveModule(id);
    window.location.hash = id;
    setTimeout(() => {
      document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };
  const [filter, setFilter]             = useState("all");
  const [newTaskText, setNewTaskText]   = useState("");
  const [newPriority, setNewPriority]   = useState("medium");
  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // for projects view drill-in
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const prevModulesRef  = useRef(null);
  const initialLoadDone = useRef(false);
  const [editingTask, setEditingTask]   = useState(null); // { mid, tid }
  const [editTaskText, setEditTaskText] = useState("");
  const [expandedTask, setExpandedTask]         = useState(null); // "mid:tid"
  const [projectTasks, setProjectTasks]         = useState({}); // { [proj]: Task[] }
  const [newProjTaskText, setNewProjTaskText]   = useState("");
  const [newProjTaskPri, setNewProjTaskPri]     = useState("medium");
  const [expandedProjTask, setExpandedProjTask] = useState(null); // "proj:tid"
  const [editingProjTask, setEditingProjTask]   = useState(null); // { proj, tid }
  const [editProjTaskText, setEditProjTaskText] = useState("");
  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // { role, text, toolCalls? }
  const [chatInput, setChatInput]       = useState("");
  const [chatLoading, setChatLoading]   = useState(false);
  const chatEndRef = useRef(null);

  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editModuleName, setEditModuleName]   = useState("");
  const [editModuleSubtitle, setEditModuleSubtitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        const { data: saved } = await res.json();
        if (saved) {
          const projEntry = saved.find(m => m.id === "__projects__");
          if (projEntry?.projectTasks) setProjectTasks(projEntry.projectTasks);
          const moduleData = saved.filter(m => m.id !== "__projects__");
          const savedIds = new Set(moduleData.map(m => m.id));
          const unseeded = initialModules.filter(m => !savedIds.has(m.id));
          const all = [...moduleData, ...unseeded];
          const maxId = all.flatMap(m => m.tasks).reduce((max, t) => Math.max(max, t.id), 99);
          nextTaskId = maxId + 1;
          setModules(all);
        } else {
          setModules(initialModules);
        }
      } catch { setModules(initialModules); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!modules) return;

    // Skip saving on the initial load from DB
    if (!initialLoadDone.current) {
      prevModulesRef.current = modules;
      initialLoadDone.current = true;
      return;
    }

    const prev = prevModulesRef.current ?? [];
    const saves = [];

    modules.forEach((m, i) => {
      const p = prev.find(x => x.id === m.id);
      if (!p || JSON.stringify(p) !== JSON.stringify(m)) {
        saves.push(
          fetch("/api/module", {
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
          fetch("/api/module", {
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

  const prevProjTasksRef = useRef(null);
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (JSON.stringify(projectTasks) === JSON.stringify(prevProjTasksRef.current)) return;
    prevProjTasksRef.current = projectTasks;
    fetch("/api/module", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: { id: "__projects__", projectTasks }, position: -1 }),
    }).catch(console.error);
  }, [projectTasks]);

  // All unique projects across all modules
  const allProjects = [...new Set(modules?.flatMap(m => m.projects) || [])].sort();

  const updateTask = (mid, tid, changes) =>
    setModules(p => p.map(m => m.id === mid ? { ...m, tasks: m.tasks.map(t => t.id === tid ? { ...t, ...changes } : t) } : m));

  const addTask = (mid) => {
    if (!newTaskText.trim()) return;
    setModules(p => p.map(m => m.id === mid
      ? { ...m, tasks: [...m.tasks, { id: nextTaskId++, text: newTaskText.trim(), status: "todo", priority: newPriority }] }
      : m));
    setNewTaskText("");
  };

  const deleteTask = (mid, tid) =>
    setModules(p => p.map(m => m.id === mid ? { ...m, tasks: m.tasks.filter(t => t.id !== tid) } : m));

  const addProject = (mid) => {
    const name = newProjectName.trim();
    if (!name) return;
    setModules(p => p.map(m => m.id === mid
      ? { ...m, projects: m.projects.includes(name) ? m.projects : [...m.projects, name] }
      : m));
    setNewProjectName("");
    setShowProjectInput(false);
  };

  const removeProject = (mid, proj) =>
    setModules(p => p.map(m => m.id === mid ? { ...m, projects: m.projects.filter(x => x !== proj) } : m));

  const startEditTask = (mid, task) => { setEditingTask({ mid, tid: task.id }); setEditTaskText(task.text); };
  const commitEditTask = () => {
    if (editingTask && editTaskText.trim()) updateTask(editingTask.mid, editingTask.tid, { text: editTaskText.trim() });
    setEditingTask(null);
  };

  const startEditModule = (m) => { setEditingModuleId(m.id); setEditModuleName(m.name); setEditModuleSubtitle(m.subtitle || ""); };
  const commitEditModule = () => {
    if (!editModuleName.trim()) { setEditingModuleId(null); return; }
    setModules(p => p.map(m => m.id === editingModuleId ? { ...m, name: editModuleName.trim(), subtitle: editModuleSubtitle.trim() } : m));
    setEditingModuleId(null);
  };

  const addModule = () => {
    const name = newModuleName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    setModules(p => [...p, { id, name, subtitle: "", icon: "Utils", projects: [], tasks: [] }]);
    setNewModuleName("");
    setShowAddModule(false);
    setTimeout(() => navigateTo(id), 50);
  };

  const deleteModule = (mid) => {
    if (!confirm("Delete this module and all its tasks?")) return;
    setModules(p => p.filter(m => m.id !== mid));
  };

  const addProjectTask = (proj) => {
    if (!newProjTaskText.trim()) return;
    setProjectTasks(p => ({ ...p, [proj]: [...(p[proj] ?? []), { id: Date.now(), text: newProjTaskText.trim(), status: "todo", priority: newProjTaskPri, description: "" }] }));
    setNewProjTaskText("");
  };
  const updateProjectTask = (proj, tid, changes) =>
    setProjectTasks(p => ({ ...p, [proj]: (p[proj] ?? []).map(t => t.id === tid ? { ...t, ...changes } : t) }));
  const deleteProjectTask = (proj, tid) =>
    setProjectTasks(p => ({ ...p, [proj]: (p[proj] ?? []).filter(t => t.id !== tid) }));

  const executeToolCall = ({ name, input }) => {
    switch (name) {
      case "add_module_task":
        setModules(p => p.map(m => m.id === input.moduleId
          ? { ...m, tasks: [...m.tasks, { id: nextTaskId++, text: input.text, status: "todo", priority: input.priority, description: input.description ?? "" }] }
          : m));
        break;
      case "update_module_task":
        setModules(p => p.map(m => m.id === input.moduleId
          ? { ...m, tasks: m.tasks.map(t => t.id === input.taskId ? { ...t, ...input } : t) }
          : m));
        break;
      case "add_project_task":
        setProjectTasks(p => ({ ...p, [input.project]: [...(p[input.project] ?? []), { id: Date.now() + Math.random(), text: input.text, status: "todo", priority: input.priority, description: input.description ?? "" }] }));
        break;
      case "update_project_task":
        setProjectTasks(p => ({ ...p, [input.project]: (p[input.project] ?? []).map(t => t.id === input.taskId ? { ...t, ...input } : t) }));
        break;
      case "add_project_to_module":
        setModules(p => p.map(m => m.id === input.moduleId
          ? { ...m, projects: m.projects.includes(input.project) ? m.projects : [...m.projects, input.project] }
          : m));
        break;
      default:
        break;
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");

    const userMsg = { role: "user", text };
    setChatMessages(p => [...p, userMsg]);
    setChatLoading(true);

    const apiMessages = [...chatMessages, userMsg]
      .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

    const state = {
      modules: modules.map(m => ({
        id: m.id, name: m.name, subtitle: m.subtitle, projects: m.projects,
        tasks: m.tasks.map(t => ({ id: t.id, text: t.text, status: t.status, priority: t.priority, description: t.description })),
      })),
      projectTasks: Object.fromEntries(
        Object.entries(projectTasks).map(([proj, tasks]) => [proj, tasks.map(t => ({ id: t.id, text: t.text, status: t.status, priority: t.priority }))])
      ),
    };

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, state }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      (data.toolCalls ?? []).forEach(executeToolCall);

      setChatMessages(p => [...p, { role: "assistant", text: data.text, toolCalls: data.toolCalls ?? [] }]);
    } catch (err) {
      setChatMessages(p => [...p, { role: "assistant", text: `Error: ${err.message}`, toolCalls: [] }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const stats = (m) => ({
    total:      m.tasks.length,
    done:       m.tasks.filter(t => t.status === "done").length,
    inprogress: m.tasks.filter(t => t.status === "inprogress").length,
    blocked:    m.tasks.filter(t => t.status === "blocked").length,
  });

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <span style={{ color: C.textMuted, fontSize: 13 }}>Loading...</span>
    </div>
  );

  const active = modules.find(m => m.id === activeModule);
  const filtered = active?.tasks.filter(t => filter === "all" || t.status === filter) || [];
  const totals = modules.reduce((a, m) => {
    const s = stats(m);
    a.total += s.total; a.done += s.done; a.inprogress += s.inprogress; a.blocked += s.blocked;
    return a;
  }, { total: 0, done: 0, inprogress: 0, blocked: 0 });

  // Project view: modules per project
  const projectModules = selectedProject
    ? modules.filter(m => m.projects.includes(selectedProject))
    : [];

  const pill = (label, active, onClick) => (
    <button onClick={onClick} style={{
      background: active ? C.surfaceHigh : "transparent",
      border: `1px solid ${active ? C.borderBright : C.border}`,
      borderRadius: 5, padding: "3px 10px", fontSize: 11,
      color: active ? C.textPrimary : C.textMuted, cursor: "pointer"
    }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, height: "100vh", display: "flex", flexDirection: "column", color: C.textPrimary }}>

      {/* Top nav */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Module Tracker</h1>
          <span style={{ fontSize: 12, color: saving ? C.textMuted : "#10b981" }}>{saving ? "saving..." : "✓"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Total",   value: totals.total,      color: C.textSecondary },
              { label: "Active",  value: totals.inprogress, color: "#f59e0b" },
              { label: "Blocked", value: totals.blocked,    color: "#ef4444" },
              { label: "Done",    value: totals.done,       color: "#10b981" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, background: C.surfaceMid, padding: 3, borderRadius: 7, border: `1px solid ${C.border}` }}>
            {[{ id: "modules", label: "Modules" }, { id: "projects", label: "Projects" }].map(v => (
              <button key={v.id} onClick={() => { setView(v.id); setSelectedProject(null); }} style={{
                background: view === v.id ? C.surfaceHigh : "transparent",
                border: `1px solid ${view === v.id ? C.borderBright : "transparent"}`,
                borderRadius: 5, padding: "5px 16px", fontSize: 13,
                color: view === v.id ? C.textPrimary : C.textMuted, cursor: "pointer", fontWeight: view === v.id ? 600 : 400
              }}>{v.label}</button>
            ))}
          </div>
          <button onClick={() => setChatOpen(o => !o)} style={{
            background: chatOpen ? "#7c6af7" : C.surfaceMid, border: `1px solid ${chatOpen ? "#7c6af7" : C.border}`,
            borderRadius: 7, padding: "6px 14px", fontSize: 13, color: chatOpen ? "#fff" : C.textSecondary,
            cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            AI
          </button>
        </div>
      </div>

      {/* ── BODY (views + chat panel) ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "column" }}>

      {/* ── MODULES VIEW ── */}
      {view === "modules" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sidebar */}
          <div style={{ width: 192, borderRight: `1px solid ${C.border}`, overflowY: "auto", flexShrink: 0, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 10 }}>
              {["all", "inprogress", "blocked", "todo", "done"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  background: filter === f ? C.surfaceHigh : "transparent",
                  border: `1px solid ${filter === f ? C.borderBright : "transparent"}`,
                  borderRadius: 5, padding: "4px 10px", fontSize: 12, textAlign: "left",
                  color: filter === f ? C.textPrimary : C.textMuted, cursor: "pointer",
                }}>
                  {f === "all" ? "All" : STATUS[f]?.label}
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: C.border, margin: "0 4px 8px" }} />
            {/* Module list */}
            {modules.map(m => {
              const s = stats(m);
              const isActive = m.id === activeModule;
              const accent = s.blocked > 0 ? "#ef4444" : s.inprogress > 0 ? "#f59e0b" : (s.total > 0 && s.done === s.total) ? "#10b981" : null;
              const IconComp = Icons[m.icon] || Icons.Utils;
              return (
                <button key={m.id} onClick={() => { navigateTo(m.id); setShowProjectInput(false); }} style={{
                  background: isActive ? C.surfaceMid : "transparent",
                  border: `1px solid ${isActive ? (accent || C.borderBright) : "transparent"}`,
                  borderLeft: `2px solid ${isActive ? (accent || C.borderBright) : "transparent"}`,
                  borderRadius: 6, padding: "7px 10px", cursor: "pointer", textAlign: "left", width: "100%",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: isActive ? C.textPrimary : C.textMuted }}>
                    <IconComp />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, paddingLeft: 20 }}>
                    {s.total === 0 ? "—" : `${s.done}/${s.total}`}
                    {m.projects.length > 0 && <span> · {m.projects.length}p</span>}
                  </div>
                </button>
              );
            })}

            {/* Add module */}
            <div style={{ marginTop: 8 }}>
              {showAddModule ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "8px 6px" }}>
                  <input autoFocus value={newModuleName} onChange={e => setNewModuleName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addModule(); if (e.key === "Escape") { setShowAddModule(false); setNewModuleName(""); } }}
                    placeholder="Module name..."
                    style={{ background: C.surfaceMid, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "5px 8px", fontSize: 13, color: C.textPrimary, outline: "none" }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={addModule} style={{ flex: 1, background: C.surfaceHigh, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "4px 0", fontSize: 12, color: C.textPrimary, cursor: "pointer", fontWeight: 600 }}>Add</button>
                    <button onClick={() => { setShowAddModule(false); setNewModuleName(""); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 8px", fontSize: 12, color: C.textMuted, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddModule(true)} style={{
                  width: "100%", background: "transparent", border: `1px dashed ${C.border}`,
                  borderRadius: 6, padding: "7px 10px", fontSize: 12, color: C.textMuted, cursor: "pointer", textAlign: "left"
                }}>+ Add module</button>
              )}
            </div>
          </div>

          {/* Main content — all modules */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            {modules.map(m => {
              const mFiltered = m.tasks.filter(t => filter === "all" || t.status === filter);
              const isActive = m.id === activeModule;
              const IconComp = Icons[m.icon] || Icons.Utils;
              return (
                <div key={m.id} id={`module-${m.id}`} style={{ marginBottom: 36 }}>
                  {/* Module header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ color: C.textSecondary, background: C.surfaceMid, padding: 7, borderRadius: 7, border: `1px solid ${C.border}`, display: "flex" }}>
                        <IconComp />
                      </div>
                      {editingModuleId === m.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <input autoFocus value={editModuleName} onChange={e => setEditModuleName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") commitEditModule(); if (e.key === "Escape") setEditingModuleId(null); }}
                            style={{ background: C.surfaceMid, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "3px 8px", fontSize: 14, fontWeight: 700, color: C.textPrimary, outline: "none", width: 200 }} />
                          <input value={editModuleSubtitle} onChange={e => setEditModuleSubtitle(e.target.value)}
                            onBlur={commitEditModule}
                            onKeyDown={e => { if (e.key === "Enter") commitEditModule(); if (e.key === "Escape") setEditingModuleId(null); }}
                            placeholder="Subtitle..."
                            style={{ background: C.surfaceMid, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 8px", fontSize: 12, color: C.textMuted, outline: "none", width: 200 }} />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{m.subtitle}</div>
                        </div>
                      )}
                      <button onClick={() => startEditModule(m)} title="Edit module"
                        style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>✎</button>
                    </div>
                    {/* Project tags + delete module */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <button onClick={() => deleteModule(m.id)} title="Delete module"
                        style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, color: "#ef4444", cursor: "pointer", fontSize: 11, padding: "2px 7px", opacity: 0.6 }}>
                        Delete
                      </button>
                      {m.projects.map(proj => (
                        <span key={proj} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: projectColor(proj) + "18", border: `1px solid ${projectColor(proj)}50`,
                          borderRadius: 99, padding: "2px 8px 2px 10px", fontSize: 11, color: projectColor(proj)
                        }}>
                          {proj}
                          <button onClick={() => removeProject(m.id, proj)} style={{ background: "none", border: "none", cursor: "pointer", color: projectColor(proj), opacity: 0.7, padding: 0, display: "flex", alignItems: "center" }}>
                            <Icons.X />
                          </button>
                        </span>
                      ))}
                      {isActive && showProjectInput ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <input autoFocus value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") addProject(m.id); if (e.key === "Escape") { setShowProjectInput(false); setNewProjectName(""); } }}
                            placeholder="Project name..."
                            style={{ background: C.surface, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "3px 8px", fontSize: 12, color: C.textPrimary, outline: "none", width: 140 }} />
                          {allProjects.filter(p => !m.projects.includes(p) && p.toLowerCase().includes(newProjectName.toLowerCase())).slice(0, 4).map(p => (
                            <button key={p} onClick={() => { setModules(prev => prev.map(x => x.id === m.id ? { ...x, projects: [...x.projects, p] } : x)); setShowProjectInput(false); setNewProjectName(""); }}
                              style={{ background: projectColor(p) + "18", border: `1px solid ${projectColor(p)}50`, borderRadius: 99, padding: "2px 10px", fontSize: 11, color: projectColor(p), cursor: "pointer" }}>{p}</button>
                          ))}
                          <button onClick={() => { setShowProjectInput(false); setNewProjectName(""); }}
                            style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 8px", fontSize: 11, color: C.textMuted, cursor: "pointer" }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { navigateTo(m.id); setShowProjectInput(true); }} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 99,
                          padding: "2px 8px", fontSize: 11, color: C.textMuted, cursor: "pointer"
                        }}>
                          <Icons.Plus /><span>Add project</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                    {mFiltered.length === 0 && filter === "all" && (
                      <div style={{ color: C.textMuted, fontSize: 12, padding: "6px 0" }}>No tasks yet</div>
                    )}
                    {mFiltered.map(task => {
                      const key = `${m.id}:${task.id}`;
                      const isExpanded = expandedTask === key;
                      const borderColor = task.status === "blocked" ? "#ef444428" : task.status === "inprogress" ? "#f59e0b22" : task.status === "done" ? "#10b98118" : C.border;
                      return (
                        <div key={task.id} style={{ background: C.surface, borderRadius: 7, border: `1px solid ${borderColor}` }}>
                          {/* Main row */}
                          <div style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY[task.priority].color, flexShrink: 0 }} />
                            <button onClick={() => setExpandedTask(isExpanded ? null : key)} title={isExpanded ? "Collapse" : "Add notes"}
                              style={{ background: "transparent", border: "none", color: isExpanded || task.description ? C.textSecondary : C.textMuted, cursor: "pointer", fontSize: 11, padding: "0 1px", lineHeight: 1, flexShrink: 0 }}>
                              {isExpanded ? "▾" : "▸"}
                            </button>
                            {editingTask?.mid === m.id && editingTask?.tid === task.id ? (
                              <input autoFocus value={editTaskText} onChange={e => setEditTaskText(e.target.value)}
                                onBlur={commitEditTask}
                                onKeyDown={e => { if (e.key === "Enter") commitEditTask(); if (e.key === "Escape") setEditingTask(null); }}
                                style={{ flex: 1, background: C.surfaceMid, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "2px 7px", fontSize: 13, color: C.textPrimary, outline: "none" }} />
                            ) : (
                              <div onClick={() => startEditTask(m.id, task)} title="Click to edit"
                                style={{ flex: 1, fontSize: 13, color: task.status === "done" ? C.textMuted : C.textPrimary, textDecoration: task.status === "done" ? "line-through" : "none", cursor: "text" }}>
                                {task.text}
                                {task.description && !isExpanded && (
                                  <span style={{ marginLeft: 8, fontSize: 11, color: C.textMuted }}>· has notes</span>
                                )}
                              </div>
                            )}
                            <select value={task.priority} onChange={e => updateTask(m.id, task.id, { priority: e.target.value })}
                              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 5px", fontSize: 11, color: PRIORITY[task.priority].color, cursor: "pointer" }}>
                              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <select value={task.status} onChange={e => updateTask(m.id, task.id, { status: e.target.value })}
                              style={{ background: STATUS[task.status].bg, border: `1px solid ${STATUS[task.status].color}45`, borderRadius: 5, padding: "2px 7px", fontSize: 11, color: STATUS[task.status].color, cursor: "pointer" }}>
                              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <button onClick={() => deleteTask(m.id, task.id)}
                              style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
                          </div>
                          {/* Description panel */}
                          {isExpanded && (
                            <div style={{ padding: "0 12px 10px 28px", borderTop: `1px solid ${C.border}20` }}>
                              <textarea
                                autoFocus
                                value={task.description ?? ""}
                                onChange={e => updateTask(m.id, task.id, { description: e.target.value })}
                                placeholder="Add notes or details..."
                                rows={3}
                                style={{
                                  width: "100%", background: "transparent", border: "none", resize: "vertical",
                                  color: C.textSecondary, fontSize: 12, lineHeight: 1.6, outline: "none",
                                  fontFamily: "inherit", marginTop: 8, padding: 0,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add task row */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={isActive ? newTaskText : ""} onChange={e => { navigateTo(m.id); setNewTaskText(e.target.value); }}
                      onKeyDown={e => e.key === "Enter" && addTask(m.id)}
                      placeholder={`Add task to ${m.name}...`}
                      style={{ flex: 1, background: C.surface, border: `1px solid ${isActive ? C.borderBright : C.border}`, borderRadius: 7, padding: "7px 12px", color: C.textPrimary, fontSize: 13, outline: "none" }} />
                    <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 8px", color: C.textSecondary, fontSize: 12, cursor: "pointer" }}>
                      {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => addTask(m.id)}
                      style={{ background: C.surfaceHigh, border: `1px solid ${C.borderBright}`, borderRadius: 7, padding: "7px 16px", color: C.textPrimary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Add
                    </button>
                  </div>

                  <div style={{ height: 1, background: C.border, marginTop: 28 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PROJECTS VIEW ── */}
      {view === "projects" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {!selectedProject ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.textPrimary }}>All Projects</h2>
                <span style={{ fontSize: 12, color: C.textMuted }}>{allProjects.length} project{allProjects.length !== 1 ? "s" : ""}</span>
              </div>

              {allProjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: C.textMuted, fontSize: 13 }}>
                  No projects yet — go to a module and tag it with a project name
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {allProjects.map(proj => {
                    const projModules = modules.filter(m => m.projects.includes(proj));
                    const projTasks   = [...projModules.flatMap(m => m.tasks), ...(projectTasks[proj] ?? [])];
                    const done        = projTasks.filter(t => t.status === "done").length;
                    const blocked     = projTasks.filter(t => t.status === "blocked").length;
                    const inprogress  = projTasks.filter(t => t.status === "inprogress").length;
                    const pct         = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
                    const color       = projectColor(proj);

                    return (
                      <button key={proj} onClick={() => setSelectedProject(proj)} style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderTop: `3px solid ${color}`,
                        borderRadius: 9, padding: 16, cursor: "pointer", textAlign: "left"
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{proj}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
                          {projModules.length} module{projModules.length !== 1 ? "s" : ""} · {projTasks.length} task{projTasks.length !== 1 ? "s" : ""}
                        </div>

                        {/* Module icon strip */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                          {projModules.map(m => {
                            const I = Icons[m.icon] || Icons.Utils;
                            return (
                              <span key={m.id} title={m.name} style={{
                                color: color, background: color + "15",
                                border: `1px solid ${color}30`,
                                borderRadius: 5, padding: "3px 6px", display: "flex", alignItems: "center", gap: 4
                              }}>
                                <I /><span style={{ fontSize: 10 }}>{m.name}</span>
                              </span>
                            );
                          })}
                        </div>

                        {/* Progress bar */}
                        {projTasks.length > 0 && (
                          <>
                            <div style={{ background: C.surfaceHigh, borderRadius: 99, height: 4, marginBottom: 6, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.3s" }} />
                            </div>
                            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                              <span style={{ color: "#10b981" }}>{done} done</span>
                              {inprogress > 0 && <span style={{ color: "#f59e0b" }}>{inprogress} active</span>}
                              {blocked > 0 && <span style={{ color: "#ef4444" }}>{blocked} blocked</span>}
                              <span style={{ color: C.textMuted, marginLeft: "auto" }}>{pct}%</span>
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Project drill-in */
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <button onClick={() => setSelectedProject(null)} style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: "4px 10px", fontSize: 12, color: C.textMuted, cursor: "pointer"
                }}>← Back</button>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: projectColor(selectedProject) }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{selectedProject}</h2>
              </div>

              {/* Project-level tasks */}
              {(() => {
                const color = projectColor(selectedProject);
                const pts = projectTasks[selectedProject] ?? [];
                return (
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${color}`, borderRadius: 9, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 2 }}>Project Tasks</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>Tasks specific to this project</div>
                    </div>
                    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                      {pts.length === 0 && <div style={{ fontSize: 12, color: C.textMuted, padding: "4px 0" }}>No project tasks yet</div>}
                      {pts.map(task => {
                        const pkey = `${selectedProject}:${task.id}`;
                        const isExp = expandedProjTask === pkey;
                        return (
                          <div key={task.id} style={{ background: C.surfaceMid, borderRadius: 7, border: `1px solid ${task.status === "blocked" ? "#ef444428" : task.status === "inprogress" ? "#f59e0b22" : task.status === "done" ? "#10b98118" : C.border}` }}>
                            <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY[task.priority].color, flexShrink: 0 }} />
                              <button onClick={() => setExpandedProjTask(isExp ? null : pkey)}
                                style={{ background: "transparent", border: "none", color: isExp || task.description ? C.textSecondary : C.textMuted, cursor: "pointer", fontSize: 11, padding: "0 1px", lineHeight: 1, flexShrink: 0 }}>
                                {isExp ? "▾" : "▸"}
                              </button>
                              {editingProjTask?.proj === selectedProject && editingProjTask?.tid === task.id ? (
                                <input autoFocus value={editProjTaskText} onChange={e => setEditProjTaskText(e.target.value)}
                                  onBlur={() => { if (editProjTaskText.trim()) updateProjectTask(selectedProject, task.id, { text: editProjTaskText.trim() }); setEditingProjTask(null); }}
                                  onKeyDown={e => { if (e.key === "Enter") { if (editProjTaskText.trim()) updateProjectTask(selectedProject, task.id, { text: editProjTaskText.trim() }); setEditingProjTask(null); } if (e.key === "Escape") setEditingProjTask(null); }}
                                  style={{ flex: 1, background: C.surfaceHigh, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "2px 7px", fontSize: 13, color: C.textPrimary, outline: "none" }} />
                              ) : (
                                <div onClick={() => { setEditingProjTask({ proj: selectedProject, tid: task.id }); setEditProjTaskText(task.text); }}
                                  style={{ flex: 1, fontSize: 13, cursor: "text", color: task.status === "done" ? C.textMuted : C.textPrimary, textDecoration: task.status === "done" ? "line-through" : "none" }}>
                                  {task.text}
                                  {task.description && !isExp && <span style={{ marginLeft: 8, fontSize: 11, color: C.textMuted }}>· has notes</span>}
                                </div>
                              )}
                              <select value={task.priority} onChange={e => updateProjectTask(selectedProject, task.id, { priority: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 5px", fontSize: 11, color: PRIORITY[task.priority].color, cursor: "pointer" }}>
                                {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                              <select value={task.status} onChange={e => updateProjectTask(selectedProject, task.id, { status: e.target.value })}
                                style={{ background: STATUS[task.status].bg, border: `1px solid ${STATUS[task.status].color}45`, borderRadius: 5, padding: "2px 7px", fontSize: 11, color: STATUS[task.status].color, cursor: "pointer" }}>
                                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                              <button onClick={() => deleteProjectTask(selectedProject, task.id)}
                                style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
                            </div>
                            {isExp && (
                              <div style={{ padding: "0 12px 10px 30px", borderTop: `1px solid ${C.border}20` }}>
                                <textarea autoFocus value={task.description ?? ""} onChange={e => updateProjectTask(selectedProject, task.id, { description: e.target.value })}
                                  placeholder="Add notes or details..." rows={3}
                                  style={{ width: "100%", background: "transparent", border: "none", resize: "vertical", color: C.textSecondary, fontSize: 12, lineHeight: 1.6, outline: "none", fontFamily: "inherit", marginTop: 8, padding: 0 }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Add project task */}
                      <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                        <input value={newProjTaskText} onChange={e => setNewProjTaskText(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addProjectTask(selectedProject)}
                          placeholder="Add project task..."
                          style={{ flex: 1, background: C.surfaceMid, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 11px", color: C.textPrimary, fontSize: 13, outline: "none" }} />
                        <select value={newProjTaskPri} onChange={e => setNewProjTaskPri(e.target.value)}
                          style={{ background: C.surfaceMid, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 6px", color: C.textSecondary, fontSize: 12, cursor: "pointer" }}>
                          {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button onClick={() => addProjectTask(selectedProject)}
                          style={{ background: C.surfaceHigh, border: `1px solid ${C.borderBright}`, borderRadius: 7, padding: "7px 14px", color: C.textPrimary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add</button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {projectModules.map(m => {
                  const s = stats(m);
                  const I = Icons[m.icon] || Icons.Utils;
                  const color = projectColor(selectedProject);
                  return (
                    <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: m.tasks.length > 0 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ color: color, display: "flex" }}><I /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{m.subtitle}</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
                          {s.blocked > 0   && <span style={{ color: "#ef4444" }}>{s.blocked} blocked</span>}
                          {s.inprogress > 0 && <span style={{ color: "#f59e0b" }}>{s.inprogress} active</span>}
                          <span style={{ color: C.textMuted }}>{s.done}/{s.total} done</span>
                        </div>
                        <button onClick={() => { setView("modules"); navigateTo(m.id); }} style={{
                          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5,
                          padding: "3px 8px", fontSize: 11, color: C.textMuted, cursor: "pointer"
                        }}>Open →</button>
                      </div>
                      {m.tasks.length > 0 && (
                        <div style={{ padding: "8px 16px 10px" }}>
                          {m.tasks.map(t => (
                            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: `1px solid ${C.border}20` }}>
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: PRIORITY[t.priority].color, flexShrink: 0 }} />
                              <span style={{ flex: 1, fontSize: 12, color: t.status === "done" ? C.textMuted : C.textSecondary, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.text}</span>
                              <span style={{ fontSize: 11, color: STATUS[t.status].color }}>{STATUS[t.status].label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      </div>{/* end views column */}

      {/* ── CHAT PANEL ── */}
      {chatOpen && (
        <div style={{ width: 360, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Chat header */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>AI Assistant</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Paste emails, transcripts, or ask anything</div>
            </div>
            <button onClick={() => setChatMessages([])} title="Clear chat"
              style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 11 }}>Clear</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.length === 0 && (
              <div style={{ color: C.textMuted, fontSize: 12, textAlign: "center", marginTop: 40, lineHeight: 1.7 }}>
                Paste an email or meeting transcript and I'll extract tasks and add them for you.
                <br /><br />
                Or ask me to help prioritize, plan, or update existing tasks.
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "92%", padding: "9px 12px", borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                  background: msg.role === "user" ? "#7c6af7" : C.surfaceMid,
                  border: msg.role === "user" ? "none" : `1px solid ${C.border}`,
                  fontSize: 13, color: msg.role === "user" ? "#fff" : C.textPrimary,
                  lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {msg.text}
                </div>
                {msg.toolCalls?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: "92%" }}>
                    {msg.toolCalls.map((tc, j) => (
                      <span key={j} style={{
                        fontSize: 10, padding: "2px 7px", borderRadius: 99,
                        background: "#7c6af720", border: "1px solid #7c6af740", color: "#7c6af7",
                      }}>
                        {tc.name.replace(/_/g, " ")} {tc.input.moduleId ?? tc.input.project ?? ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.textMuted, fontSize: 12 }}>
                <span style={{ animation: "pulse 1.2s infinite" }}>●</span>
                <span style={{ animation: "pulse 1.2s infinite 0.2s" }}>●</span>
                <span style={{ animation: "pulse 1.2s infinite 0.4s" }}>●</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
              placeholder={"Paste an email, transcript, or ask a question...\n(Enter to send, Shift+Enter for new line)"}
              rows={4}
              style={{
                width: "100%", background: C.surfaceMid, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "9px 11px", color: C.textPrimary, fontSize: 13,
                lineHeight: 1.5, resize: "none", outline: "none", fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} style={{
              marginTop: 6, width: "100%", background: chatLoading || !chatInput.trim() ? C.surfaceHigh : "#7c6af7",
              border: "none", borderRadius: 7, padding: "8px 0", fontSize: 13, fontWeight: 600,
              color: chatLoading || !chatInput.trim() ? C.textMuted : "#fff", cursor: chatLoading || !chatInput.trim() ? "default" : "pointer",
            }}>
              {chatLoading ? "Thinking…" : "Send"}
            </button>
          </div>
        </div>
      )}

      </div>{/* end body flex row */}
    </div>
  );
}
