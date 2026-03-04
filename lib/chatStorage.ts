/**
 * localStorage-based chat session persistence.
 *
 * Stores sessions under `medtriage_sessions` as a JSON array.
 * Each session holds serialised messages (Date → ISO string) so it
 * survives a page reload. Swap this module for API calls once a DB
 * is in place — the rest of the app stays the same.
 */

// ─── Types ───

export type TriageLevel = 1 | 2 | 3;

export interface PipelineMetadata {
  intentType?: string;
  intentConfidence?: number;
  ragOutput?: unknown;
  criticOutput?: unknown;
  criticDecision?: string | null;
  guardianOutput?: unknown;
}

export interface SerializedMessage {
  id: string;
  role: "user" | "ai" | "system" | "error";
  content: string;
  triageLevel?: TriageLevel;
  timestamp: string; // ISO 8601
  status?: "pending" | "verified" | "rejected";
  doctorNotes?: string;
  errorType?: string;
  pipeline?: PipelineMetadata;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: SerializedMessage[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  highestTriageLevel?: TriageLevel;
  isLocked: boolean;
  model: string;
}

// ─── Storage key ───

const STORAGE_KEY = "medtriage_sessions";

// ─── Helpers ───

function readAll(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ─── Public API ───

/** Return all sessions sorted newest-first. */
export function getSessions(): ChatSession[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Get a single session by id, or null. */
export function getSession(id: string): ChatSession | null {
  return readAll().find((s) => s.id === id) ?? null;
}

/** Create a brand-new empty session and persist it. Returns the session. */
export function createSession(model: string): ChatSession {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: "New Conversation",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLocked: false,
    model,
  };
  const all = readAll();
  all.push(session);
  writeAll(all);
  return session;
}

/** Overwrite an existing session (matched by id). */
export function saveSession(session: ChatSession) {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    all[idx] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    all.push({ ...session, updatedAt: new Date().toISOString() });
  }
  writeAll(all);
}

/** Delete a session by id. */
export function deleteSession(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}

/** Delete all sessions. */
export function clearAllSessions() {
  writeAll([]);
}
