import type { Module } from "../types";

export const PROJECT_COLORS = [
  "#7c6af7","#e87c3e","#4ec9a0","#e86e6e","#e8c86e",
  "#6eaae8","#c46ee8","#6ee8c4","#e86eae","#8ee86e",
];

export function projectColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length];
}

export const STATUS_CONFIG = {
  todo:       { label: "To Do",       className: "text-[#8b8fa8] bg-[#2a2b36]" },
  inprogress: { label: "In Progress", className: "text-[#e6a817] bg-[#2e2410]" },
  done:       { label: "Done",        className: "text-[#3ec9a7] bg-[#0f2820]" },
  blocked:    { label: "Blocked",     className: "text-[#e05c5c] bg-[#2e1515]" },
} as const;

export const PRIORITY_CONFIG = {
  high:   { label: "High", color: "#ef4444" },
  medium: { label: "Med",  color: "#f59e0b" },
  low:    { label: "Low",  color: "#636580" },
} as const;

export let nextTaskId = 100;
export function bumpNextTaskId(id: number) { nextTaskId = Math.max(nextTaskId, id + 1); }
export function getNextTaskId() { return nextTaskId++; }

export const initialModules: Module[] = [
  { id: "blox",       name: "Blox",       subtitle: "Page Designer",              icon: "Blox",       projects: [], tasks: [
    { id: 1, text: "Make deployable as standalone package",   status: "inprogress", priority: "high" },
    { id: 2, text: "New project scaffolding / easy init",     status: "inprogress", priority: "high" },
    { id: 3, text: "Module independence from other packages", status: "todo",       priority: "high" },
    { id: 4, text: "Production build validation",             status: "todo",       priority: "high" },
  ]},
  { id: "person",     name: "Person",     subtitle: "Contacts",                   icon: "Person",     projects: [], tasks: [] },
  { id: "auth",       name: "Auth",       subtitle: "SSO / OTP / 2FA / RBAC",    icon: "Auth",       projects: [], tasks: [] },
  { id: "invitation", name: "Invitation", subtitle: "Invite System",              icon: "Invitation", projects: [], tasks: [] },
  { id: "org",        name: "Org",        subtitle: "Org Management",             icon: "Org",        projects: [], tasks: [] },
  { id: "agent",      name: "Agent",      subtitle: "AI Engine",                  icon: "Agent",      projects: [], tasks: [] },
  { id: "knowledge",  name: "Knowledge",  subtitle: "Document Store",             icon: "Knowledge",  projects: [], tasks: [] },
  { id: "datastore",  name: "Data Store", subtitle: "Dynamic Schemas",            icon: "DataStore",  projects: [], tasks: [] },
  { id: "ecommerce",  name: "Ecommerce",  subtitle: "Products / Orders",          icon: "Ecommerce",  projects: [], tasks: [] },
  { id: "payment",    name: "Payment",    subtitle: "General Payments",           icon: "Payment",    projects: [], tasks: [] },
  { id: "donation",   name: "Donation",   subtitle: "Donation Management",        icon: "Donation",   projects: [], tasks: [] },
  { id: "invoicing",  name: "Invoicing",  subtitle: "Payables / Receivables",    icon: "Invoicing",  projects: [], tasks: [] },
  { id: "forms",      name: "Forms",      subtitle: "Form Builder",               icon: "Forms",      projects: [], tasks: [] },
  { id: "automation", name: "Automation", subtitle: "Events & Actions",           icon: "Automation", projects: [], tasks: [] },
  { id: "email",      name: "Email",      subtitle: "Newsletter / Transactional", icon: "Email",      projects: [], tasks: [] },
  { id: "whatsapp",   name: "WhatsApp",   subtitle: "Conversations / Broadcast",  icon: "WhatsApp",   projects: [], tasks: [] },
  { id: "sms",        name: "SMS",        subtitle: "SMS Messaging",              icon: "SMS",        projects: [], tasks: [] },
  { id: "pipeline",   name: "Pipeline",   subtitle: "Kanban / Process",           icon: "Pipeline",   projects: [], tasks: [] },
  { id: "exams",      name: "Exams",      subtitle: "Evaluations",                icon: "Exams",      projects: [], tasks: [] },
  { id: "checkin",    name: "Check-in",   subtitle: "Live Events",                icon: "Checkin",    projects: [], tasks: [] },
  { id: "files",      name: "Files",      subtitle: "File Storage",               icon: "Files",      projects: [], tasks: [] },
  { id: "notes",      name: "Notes",      subtitle: "Attached Notes",             icon: "Notes",      projects: [], tasks: [] },
  { id: "analytics",  name: "Analytics",  subtitle: "Graph / SQL / Timescale",    icon: "Analytics",  projects: [], tasks: [] },
  { id: "utils",      name: "Utils",      subtitle: "QR / Integrations",          icon: "Utils",      projects: [], tasks: [] },
];
