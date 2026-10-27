/**
 * Experimental ChatGPT Project routing policy.
 * UI routes are not an official API. An unknown location must block sending.
 * This module never sends prompts or modifies conversations.
 */
export type ChatGptProjectTarget = Readonly<{ url: string; accountKey: string }>;
export type ChatGptProjectRoute = Readonly<{
  projectId: string; kind: "new" | "conversation"; conversationId?: string;
}>;
export type ChatGptProjectObservation = Readonly<{
  url: string; accountKey?: string; userTurnCount?: number;
  assistantTurnCount?: number; composerVisible?: boolean; composerEmpty?: boolean;
}>;
export type ChatGptProjectCheckpoint = "before-attach" | "before-send" | "after-send";

export class ChatGptProjectRoutingError extends Error {
  readonly code = "chatgpt_project_routing_unverified";
  constructor(reason: string) {
    super("ChatGPT Project routing blocked: " + reason);
    this.name = "ChatGptProjectRoutingError";
  }
}

export function redactChatGptProjectSensitiveText(value: string): string {
  return value
    .replace(/https?:\/\/chatgpt\.com\/g\/g-p-[a-z0-9-]+(?:\/[^\s"'<>),;}]*)?/gi, "[redacted ChatGPT Project URL]")
    .replace(/\/g\/g-p-[a-z0-9-]+(?:\/[^\s"'<>),;}]*)?/gi, "/g/[redacted-project]")
    .replace(/\bg-p-[a-z0-9][a-z0-9-]{7,127}\b/gi, "[redacted-project-id]");
}

function canonicalUrl(value: string): URL {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "chatgpt.com" || url.port ||
        url.username || url.password || url.search || url.hash) {
      throw new Error("unexpected URL components");
    }
    return url;
  } catch {
    throw new ChatGptProjectRoutingError("active project address is not canonical");
  }
}

// Route shapes are exploratory and must be confirmed in an isolated DEV session.
const PROJECT_ID = "(g-p-[a-z0-9][a-z0-9-]{7,127})";
const NEW_PROJECT_PATH = new RegExp("^/g/" + PROJECT_ID + "/project$");
const PROJECT_CHAT_PATH = new RegExp("^/g/" + PROJECT_ID + "/c/([a-f0-9-]{8,100})$");

export function parseChatGptProjectRoute(value: string): ChatGptProjectRoute | undefined {
  const url = canonicalUrl(value);
  const fresh = NEW_PROJECT_PATH.exec(url.pathname);
  if (fresh) return { projectId: fresh[1]!, kind: "new" };
  const existing = PROJECT_CHAT_PATH.exec(url.pathname);
  if (existing) return {
    projectId: existing[1]!, kind: "conversation", conversationId: existing[2]!,
  };
  return undefined;
}

export function validateChatGptProjectTarget(value: unknown): ChatGptProjectTarget {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ChatGptProjectRoutingError("selected project is missing");
  }
  const input = value as Partial<ChatGptProjectTarget>;
  if (typeof input.url !== "string" || typeof input.accountKey !== "string" ||
      !/^[a-f0-9]{64}$/.test(input.accountKey)) {
    throw new ChatGptProjectRoutingError("selected project or account is missing");
  }
  const route = parseChatGptProjectRoute(input.url);
  if (route?.kind !== "new") {
    throw new ChatGptProjectRoutingError("select a project page, not a conversation");
  }
  return { url: input.url, accountKey: input.accountKey };
}

export function assertChatGptProjectRoute(
  target: ChatGptProjectTarget,
  observed: ChatGptProjectObservation,
  checkpoint: ChatGptProjectCheckpoint,
  expectedConversationId?: string,
): ChatGptProjectRoute {
  const selected = parseChatGptProjectRoute(validateChatGptProjectTarget(target).url)!;
  const current = parseChatGptProjectRoute(observed.url);
  if (!current || current.projectId !== selected.projectId) {
    throw new ChatGptProjectRoutingError("active composer is outside selected project");
  }
  if (!observed.accountKey || observed.accountKey !== target.accountKey) {
    throw new ChatGptProjectRoutingError("account changed or could not be proven");
  }
  if (expectedConversationId !== undefined &&
      (current.kind !== "conversation" || current.conversationId !== expectedConversationId)) {
    throw new ChatGptProjectRoutingError("retained conversation changed");
  }
  if (checkpoint === "before-attach") {
    if (current.kind !== "new" || observed.composerVisible !== true ||
        observed.composerEmpty !== true || observed.userTurnCount !== 0 ||
        observed.assistantTurnCount !== 0) {
      throw new ChatGptProjectRoutingError("new project chat is not an empty composer");
    }
  } else if (checkpoint === "before-send") {
    if (observed.composerVisible !== true) {
      throw new ChatGptProjectRoutingError("project composer unavailable");
    }
    if (current.kind === "new" &&
        (observed.userTurnCount !== 0 || observed.assistantTurnCount !== 0)) {
      throw new ChatGptProjectRoutingError("fresh project chat already has messages");
    }
  } else if (checkpoint === "after-send") {
    if (current.kind !== "conversation") {
      throw new ChatGptProjectRoutingError("accepted message did not establish a project conversation");
    }
  } else {
    throw new ChatGptProjectRoutingError("unknown checkpoint");
  }
  return current;
}
