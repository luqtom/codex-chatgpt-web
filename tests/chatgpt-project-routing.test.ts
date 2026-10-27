import { test, expect } from "bun:test";
import {
  assertChatGptProjectRoute, validateChatGptProjectTarget,
  parseChatGptProjectRoute, redactChatGptProjectSensitiveText,
} from "../src/chatgpt-project-routing";

const id = "g-p-1234567890123456";
const accountKey = "a".repeat(64);
const target = { url: "https://chatgpt.com/g/" + id + "/project", accountKey };
const chat = "https://chatgpt.com/g/" + id + "/c/12345678-1234-1234-1234-123456789abc";

test("project target is optional, exact and tied to a valid account fingerprint", () => {
  expect(validateChatGptProjectTarget(target)).toEqual(target);
  for (const url of [
    "https://chatgpt.com/", "https://chatgpt.com/c/previous",
    "https://example.com/g/" + id + "/project",
    "https://chatgpt.com/g/" + id + "/project?temporary-chat=true",
  ]) expect(() => validateChatGptProjectTarget({ url, accountKey })).toThrow();
  expect(parseChatGptProjectRoute(chat)?.kind).toBe("conversation");
});

test("new task requires a pristine composer under selected account/project", () => {
  const empty = { url: target.url, accountKey, composerVisible: true,
    composerEmpty: true, userTurnCount: 0, assistantTurnCount: 0 };
  expect(assertChatGptProjectRoute(target, empty, "before-attach").kind).toBe("new");
  expect(() => assertChatGptProjectRoute(target, { ...empty, userTurnCount: 1 }, "before-attach")).toThrow();
  expect(() => assertChatGptProjectRoute(target, { ...empty, accountKey: "b".repeat(64) }, "before-attach")).toThrow();
  expect(() => assertChatGptProjectRoute(target, { ...empty, url: "https://chatgpt.com/" }, "before-attach")).toThrow();
});

test("physical send cannot escape project or change a retained chat", () => {
  expect(assertChatGptProjectRoute(target, { url: chat, accountKey, composerVisible: true },
    "before-send").kind).toBe("conversation");
  expect(() => assertChatGptProjectRoute(target, { url: chat, accountKey },
    "after-send", "wrong-chat")).toThrow();
  expect(assertChatGptProjectRoute(target, { url: chat, accountKey },
    "after-send", "12345678-1234-1234-1234-123456789abc").kind).toBe("conversation");
  expect(() => assertChatGptProjectRoute(target, {
    url: "https://chatgpt.com/c/123", accountKey,
  }, "after-send")).toThrow();
});

test("diagnostics redact private project URL and opaque ID", () => {
  const message = "Failed " + target.url + " " + id;
  const redacted = redactChatGptProjectSensitiveText(message);
  expect(redacted).not.toContain(id);
  expect(redacted).not.toContain(target.url);
});
