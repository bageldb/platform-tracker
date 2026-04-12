import { useState, useEffect } from "react";

const STATUS = {
  todo:       { label: "To Do",       color: "#6b7280", bg: "#1a1a1a" },
  inprogress: { label: "In Progress", color: "#f59e0b", bg: "#2a1f00" },
  done:       { label: "Done",        color: "#10b981", bg: "#001f12" },
  blocked:    { label: "Blocked",     color: "#ef4444", bg: "#1f0000" },
};

const PRIORITY = {
  high:   { label: "High", color: "#ef4444" },
  medium: { label: "Med",  color: "#f59e0b" },
  low:    { label: "Low",  color: "#4b5563" },
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
  bg:           "#0a0a0a",
  surface:      "#141414",
  surfaceMid:   "#1c1c1c",
  surfaceHigh:  "#252525",
  border:       "#2a2a2a",
  borderBright: "#3a3a3a",
  textPrimary:  "#f0f0f0",
  textSecondary:"#888888",
  textMuted:    "#555555",
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
  const [activeModule, setActiveModule] = useState("blox");
  const [filter, setFilter]             = useState("all");
  const [newTaskText, setNewTaskText]   = useState("");
  const [newPriority, setNewPriority]   = useState("medium");
  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // for projects view drill-in
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        const { data: saved } = await res.json();
        if (saved) {
          const merged = initialModules.map(m => {
            const s = saved.find(x => x.id === m.id);
            return s ? { ...m, tasks: s.tasks, projects: s.projects || [] } : m;
          });
          const maxId = merged.flatMap(m => m.tasks).reduce((max, t) => Math.max(max, t.id), 99);
          nextTaskId = maxId + 1;
          setModules(merged);
        } else {
          setModules(initialModules);
        }
      } catch { setModules(initialModules); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!modules) return;
    setSaving(true);
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: modules }),
    })
      .catch(console.error)
      .finally(() => setTimeout(() => setSaving(false), 500));
  }, [modules]);

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
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh", color: C.textPrimary }}>

      {/* Top nav */}
      <div style={{ padding: "18px 24px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Module Tracker</h1>
            <span style={{ fontSize: 11, color: saving ? C.textMuted : "#10b981" }}>{saving ? "saving..." : "✓"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Stats */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Total",    value: totals.total,      color: C.textSecondary },
                { label: "Active",   value: totals.inprogress, color: "#f59e0b" },
                { label: "Blocked",  value: totals.blocked,    color: "#ef4444" },
                { label: "Done",     value: totals.done,       color: "#10b981" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* View toggle */}
            <div style={{ display: "flex", gap: 4, background: C.surfaceMid, padding: 3, borderRadius: 7, border: `1px solid ${C.border}` }}>
              {[
                { id: "modules",  label: "Modules"  },
                { id: "projects", label: "Projects" },
              ].map(v => (
                <button key={v.id} onClick={() => { setView(v.id); setSelectedProject(null); }} style={{
                  background: view === v.id ? C.surfaceHigh : "transparent",
                  border: `1px solid ${view === v.id ? C.borderBright : "transparent"}`,
                  borderRadius: 5, padding: "4px 14px", fontSize: 12,
                  color: view === v.id ? C.textPrimary : C.textMuted, cursor: "pointer", fontWeight: view === v.id ? 600 : 400
                }}>{v.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Module pills (only in modules view) */}
        {view === "modules" && (
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 1, scrollbarWidth: "none" }}>
            {modules.map(m => {
              const s = stats(m);
              const isActive = m.id === activeModule;
              const accent = s.blocked > 0 ? "#ef4444" : s.inprogress > 0 ? "#f59e0b" : (s.total > 0 && s.done === s.total) ? "#10b981" : null;
              const IconComp = Icons[m.icon] || Icons.Utils;
              return (
                <button key={m.id} onClick={() => { setActiveModule(m.id); setFilter("all"); setShowProjectInput(false); }} style={{
                  flexShrink: 0, background: isActive ? C.surfaceMid : "transparent",
                  border: `1px solid ${isActive ? (accent || C.borderBright) : C.border}`,
                  borderBottom: isActive ? `2px solid ${accent || C.borderBright}` : `1px solid ${C.border}`,
                  borderRadius: "6px 6px 0 0", padding: "7px 11px 9px", cursor: "pointer", minWidth: 82,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: isActive ? C.textPrimary : C.textMuted }}>
                    <IconComp />
                    <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{m.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, paddingLeft: 19 }}>
                    {s.total === 0 ? "—" : `${s.done}/${s.total}`}
                    {m.projects.length > 0 && <span style={{ color: C.textMuted }}> · {m.projects.length}p</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODULES VIEW ── */}
      {view === "modules" && active && (
        <div style={{ padding: 24, maxWidth: 720 }}>
          {/* Module header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: C.textSecondary, background: C.surfaceMid, padding: 8, borderRadius: 7, border: `1px solid ${C.border}`, display: "flex" }}>
                {(() => { const I = Icons[active.icon] || Icons.Utils; return <I />; })()}
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{active.name}</h2>
                <p style={{ fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{active.subtitle}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "inprogress", "blocked", "todo", "done"].map(f => pill(f === "all" ? "All" : STATUS[f]?.label, filter === f, () => setFilter(f)))}
            </div>
          </div>

          {/* Project tags */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.textMuted, fontSize: 11 }}>
                <Icons.Tag /><span>Projects:</span>
              </div>
              {active.projects.map(proj => (
                <span key={proj} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: projectColor(proj) + "18", border: `1px solid ${projectColor(proj)}50`,
                  borderRadius: 99, padding: "2px 8px 2px 10px", fontSize: 11, color: projectColor(proj)
                }}>
                  {proj}
                  <button onClick={() => removeProject(active.id, proj)} style={{ background: "none", border: "none", cursor: "pointer", color: projectColor(proj), opacity: 0.7, padding: 0, display: "flex", alignItems: "center" }}>
                    <Icons.X />
                  </button>
                </span>
              ))}
              {showProjectInput ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    autoFocus
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addProject(active.id); if (e.key === "Escape") { setShowProjectInput(false); setNewProjectName(""); } }}
                    placeholder="Project name..."
                    style={{ background: C.surface, border: `1px solid ${C.borderBright}`, borderRadius: 5, padding: "3px 8px", fontSize: 12, color: C.textPrimary, outline: "none", width: 140 }}
                  />
                  {/* Suggest existing projects not yet tagged */}
                  {allProjects.filter(p => !active.projects.includes(p) && p.toLowerCase().includes(newProjectName.toLowerCase())).slice(0, 4).map(p => (
                    <button key={p} onClick={() => { setModules(prev => prev.map(m => m.id === active.id ? { ...m, projects: [...m.projects, p] } : m)); setShowProjectInput(false); setNewProjectName(""); }}
                      style={{ background: projectColor(p) + "18", border: `1px solid ${projectColor(p)}50`, borderRadius: 99, padding: "2px 10px", fontSize: 11, color: projectColor(p), cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => { setShowProjectInput(false); setNewProjectName(""); }}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 8px", fontSize: 11, color: C.textMuted, cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowProjectInput(true)} style={{
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
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontSize: 13 }}>
                {filter === "all" ? "No tasks yet — add one below" : `No ${STATUS[filter]?.label} tasks`}
              </div>
            )}
            {filtered.map(task => (
              <div key={task.id} style={{
                background: C.surface, borderRadius: 7, padding: "10px 13px",
                display: "flex", alignItems: "center", gap: 10,
                border: `1px solid ${task.status === "blocked" ? "#ef444428" : task.status === "inprogress" ? "#f59e0b22" : task.status === "done" ? "#10b98118" : C.border}`
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY[task.priority].color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, color: task.status === "done" ? C.textMuted : C.textPrimary, textDecoration: task.status === "done" ? "line-through" : "none" }}>
                  {task.text}
                </div>
                <select value={task.priority} onChange={e => updateTask(active.id, task.id, { priority: e.target.value })}
                  style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 5px", fontSize: 11, color: PRIORITY[task.priority].color, cursor: "pointer" }}>
                  {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={task.status} onChange={e => updateTask(active.id, task.id, { status: e.target.value })}
                  style={{ background: STATUS[task.status].bg, border: `1px solid ${STATUS[task.status].color}45`, borderRadius: 5, padding: "2px 7px", fontSize: 11, color: STATUS[task.status].color, cursor: "pointer" }}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button onClick={() => deleteTask(active.id, task.id)}
                  style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
              </div>
            ))}
          </div>

          {/* Add task */}
          <div style={{ display: "flex", gap: 6 }}>
            <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask(active.id)}
              placeholder={`Add task to ${active.name}...`}
              style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 13px", color: C.textPrimary, fontSize: 13, outline: "none" }} />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 8px", color: C.textSecondary, fontSize: 12, cursor: "pointer" }}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={() => addTask(active.id)}
              style={{ background: C.surfaceHigh, border: `1px solid ${C.borderBright}`, borderRadius: 7, padding: "9px 18px", color: C.textPrimary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── PROJECTS VIEW ── */}
      {view === "projects" && (
        <div style={{ padding: 24 }}>
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
                    const projTasks   = projModules.flatMap(m => m.tasks);
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
                        <button onClick={() => { setView("modules"); setActiveModule(m.id); }} style={{
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
    </div>
  );
}
