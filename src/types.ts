export type Status = "todo" | "inprogress" | "done" | "blocked";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: number;
  text: string;
  status: Status;
  priority: Priority;
  description?: string;
}

export interface Module {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  projects: string[];
  tasks: Task[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  toolCalls?: ToolCall[];
  streaming?: boolean;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface AppState {
  modules: Module[];
  projectTasks: Record<string, Task[]>;
}
