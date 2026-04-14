import { createContext, useContext } from "react";
import type { Module, Task, ChatMessage, Conversation } from "./types";

export type View = "modules" | "projects";
export type Filter = "all" | "todo" | "inprogress" | "done" | "blocked";

export interface AppContextValue {
  // Navigation
  view: View;
  setView: (v: View) => void;
  activeModule: string;
  selectedProject: string | null;
  navigateTo: (id: string) => void;
  setSelectedProject: (p: string | null) => void;

  // Modules
  modules: Module[];
  saving: boolean;
  allProjects: string[];

  // Module CRUD
  addTask: (mid: string) => void;
  updateTask: (mid: string, tid: number, changes: Partial<Task>) => void;
  deleteTask: (mid: string, tid: number) => void;
  addProject: (mid: string) => void;
  removeProject: (mid: string, proj: string) => void;
  addModule: () => void;
  deleteModule: (mid: string) => void;
  startEditModule: (m: Module) => void;
  commitEditModule: () => void;

  // Task input state
  filter: Filter;
  setFilter: (f: Filter) => void;
  newTaskText: string;
  setNewTaskText: (s: string) => void;
  newPriority: string;
  setNewPriority: (s: string) => void;
  editingTask: { mid: string; tid: number } | null;
  editTaskText: string;
  setEditTaskText: (s: string) => void;
  startEditTask: (mid: string, task: Task) => void;
  commitEditTask: () => void;
  expandedTask: string | null;
  setExpandedTask: (k: string | null) => void;
  newProjectName: string;
  setNewProjectName: (s: string) => void;
  showProjectInput: boolean;
  setShowProjectInput: (b: boolean) => void;

  // Module edit state
  editingModuleId: string | null;
  editModuleName: string;
  setEditModuleName: (s: string) => void;
  editModuleSubtitle: string;
  setEditModuleSubtitle: (s: string) => void;
  showAddModule: boolean;
  setShowAddModule: (b: boolean) => void;
  newModuleName: string;
  setNewModuleName: (s: string) => void;

  // Project tasks
  projectTasks: Record<string, Task[]>;
  newProjTaskText: string;
  setNewProjTaskText: (s: string) => void;
  newProjTaskPri: string;
  setNewProjTaskPri: (s: string) => void;
  expandedProjTask: string | null;
  setExpandedProjTask: (k: string | null) => void;
  editingProjTask: { proj: string; tid: number } | null;
  editProjTaskText: string;
  setEditProjTaskText: (s: string) => void;
  addProjectTask: (proj: string) => void;
  updateProjectTask: (proj: string, tid: number, changes: Partial<Task>) => void;
  deleteProjectTask: (proj: string, tid: number) => void;
  setEditingProjTask: (v: { proj: string; tid: number } | null) => void;

  // Chat
  chatOpen: boolean;
  setChatOpen: (b: boolean) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatInput: string;
  setChatInput: (s: string) => void;
  chatLoading: boolean;
  chatView: "chat" | "history";
  setChatView: (v: "chat" | "history") => void;
  conversations: Conversation[];
  convsLoading: boolean;
  convId: string;
  convTitle: string;
  sendChatMessage: () => void;
  executeToolCall: (tc: { name: string; input: Record<string, unknown> }) => void;
  openConversation: (id: string) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  newConversation: () => void;
  openHistory: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppContext.Provider");
  return ctx;
}
