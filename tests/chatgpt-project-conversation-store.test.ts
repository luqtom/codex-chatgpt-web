import { test, expect } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ChatGptProjectConversationStore } from "../src/adapters/chatgpt-web/project-conversation-store";
import { assertChatGptProjectRoute, chatGptProjectStableId } from "../src/chatgpt-project-routing";

const hex = "0123456789abcdef0123456789abcdef";
const accountKey = "a".repeat(64);
const target = { url: `https://chatgpt.com/g/g-p-${hex}-codex/project`, accountKey };
const chatId = "12345678-1234-1234-1234-123456789abc";

test("retained Project chat pin survives a new worker process", () => {
  const dir = mkdtempSync(join(tmpdir(), "project-pins-"));
  try {
    const path = join(dir, "runtime", "project-conversations.json");
    new ChatGptProjectConversationStore(path).set(target, "thread-1", chatId);
    const restarted = new ChatGptProjectConversationStore(path);
    expect(restarted.get(target, "thread-1")).toBe(chatId);
    expect(restarted.get(target, "thread-2")).toBeUndefined();
    expect(restarted.get({ ...target, accountKey: "b".repeat(64) }, "thread-1")).toBeUndefined();
    expect(restarted.get({ ...target, url: `https://chatgpt.com/g/g-p-${hex}-renamed/project` }, "thread-1")).toBe(chatId);
    const raw = readFileSync(path, "utf8");
    expect(raw).not.toContain("thread-1");
    expect(raw).not.toContain(hex);
    if (process.platform !== "win32") expect(statSync(path).mode & 0o077).toBe(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("renamed Project slug still matches the selected Project, other Projects do not", () => {
  expect(chatGptProjectStableId(`g-p-${hex}-codex`)).toBe(`g-p-${hex}`);
  expect(chatGptProjectStableId("g-p-1234567890123456")).toBe("g-p-1234567890123456");
  const observed = { accountKey, composerVisible: true, userTurnCount: 0, assistantTurnCount: 0 };
  expect(assertChatGptProjectRoute(target, {
    ...observed, url: `https://chatgpt.com/g/g-p-${hex}-renamed/project`,
  }, "before-send").kind).toBe("new");
  expect(() => assertChatGptProjectRoute(target, {
    ...observed, url: `https://chatgpt.com/g/g-p-${"f".repeat(32)}-codex/project`,
  }, "before-send")).toThrow("outside selected project");
});
