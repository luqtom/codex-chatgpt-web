import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteFile, getConfigDir } from "../../config";
import { chatGptProjectStableId, parseChatGptProjectRoute, type ChatGptProjectTarget } from "../../chatgpt-project-routing";

const MAX_ENTRIES = 256;
const CONVERSATION_ID = /^[a-f0-9-]{8,100}$/;

/**
 * Pins a retained Codex conversation to the exact Project chat it was verified in.
 * Persisted privately so a runtime or helper restart can continue the same chat;
 * entries are keyed by a fingerprint of account, Project and conversation key.
 */
export class ChatGptProjectConversationStore {
  private entries?: Map<string, string>;

  constructor(private readonly path = join(getConfigDir(), "runtime", "project-conversations.json")) {}

  get(target: ChatGptProjectTarget, conversationKey: string): string | undefined {
    return this.load().get(this.key(target, conversationKey));
  }

  set(target: ChatGptProjectTarget, conversationKey: string, conversationId: string): void {
    const entries = this.load();
    const key = this.key(target, conversationKey);
    if (entries.get(key) === conversationId) return;
    entries.delete(key);
    entries.set(key, conversationId);
    while (entries.size > MAX_ENTRIES) entries.delete(entries.keys().next().value!);
    try {
      atomicWriteFile(this.path, `${JSON.stringify(Object.fromEntries(entries))}\n`);
    } catch (error) {
      // The in-memory pin still protects this process; a restart then fails closed.
      console.warn(`[chatgpt-web] Project conversation pin was not persisted: ${error instanceof Error ? error.name : "error"}`);
    }
  }

  clear(): void {
    this.entries = undefined;
  }

  private key(target: ChatGptProjectTarget, conversationKey: string): string {
    const projectId = chatGptProjectStableId(parseChatGptProjectRoute(target.url)!.projectId);
    return createHash("sha256").update(`${target.accountKey}\0${projectId}\0${conversationKey}`).digest("hex");
  }

  private load(): Map<string, string> {
    if (this.entries) return this.entries;
    const entries = new Map<string, string>();
    try {
      const parsed: unknown = JSON.parse(readFileSync(this.path, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const [key, value] of Object.entries(parsed)) {
          if (/^[a-f0-9]{64}$/.test(key) && typeof value === "string" && CONVERSATION_ID.test(value)) {
            entries.set(key, value);
          }
        }
      }
    } catch {
      // Missing or unreadable pins only mean that a retained chat cannot be continued.
    }
    this.entries = entries;
    return entries;
  }
}
