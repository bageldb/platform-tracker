import netlifyIdentity from "netlify-identity-widget";

export async function getToken(): Promise<string | null> {
  const user = netlifyIdentity.currentUser();
  if (!user) return null;
  return user.jwt();
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers = {
    ...(options.headers as Record<string, string> || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

export function parseHash(): { view: string; activeModule: string; selectedProject: string | null } {
  const hash = window.location.hash.slice(1) || "modules/blox";
  const [segment, ...rest] = hash.split("/");
  const sub = rest.join("/") ? decodeURIComponent(rest.join("/")) : null;
  if (segment === "projects") return { view: "projects", activeModule: "blox", selectedProject: sub };
  return { view: "modules", activeModule: sub || "blox", selectedProject: null };
}

export function buildHash(view: string, activeModule: string, selectedProject: string | null): string {
  if (view === "projects") {
    return selectedProject ? `#projects/${encodeURIComponent(selectedProject)}` : "#projects";
  }
  return `#modules/${activeModule}`;
}
