import { createHash } from "node:crypto";
import { expect, test } from "bun:test";
import type { Page } from "playwright-core";
import { verifyAcceptedChatGptProjectTurn, verifyChatGptProjectTurnPage } from "../src/adapters/chatgpt-web/project-routing";

const projectId = "g-p-1234567890123456";
const projectUrl = "https://chatgpt.com/g/" + projectId + "/project";
const conversationId = "12345678-1234-1234-1234-123456789abc";
const conversationUrl = "https://chatgpt.com/g/" + projectId + "/c/" + conversationId;
const accountKey = createHash("sha256").update("user\0workspace").digest("hex");
const target = { url: projectUrl, accountKey };

type Fixture = {
  url?: string;
  nextUrl?: string;
  userTurns?: number;
  assistantTurns?: number;
  composerCount?: number;
  composerEmpty?: boolean;
  userId?: string;
  accountId?: string;
};

function fakePage(f: Fixture = {}): Page {
  let urlReads = 0;
  return {
    url: () => (++urlReads >= 2 && f.nextUrl ? f.nextUrl : f.url ?? projectUrl),
    evaluate: async () => ({
      userId: f.userId ?? "user", accountId: f.accountId ?? "workspace",
      planType: "plus", structure: "personal", needsAttention: false,
    }),
    locator: (selector: string) => {
      const count = async () => selector.includes("prompt-textarea")
        ? f.composerCount ?? 1
        : selector.includes('data-turn="user"')
        ? f.userTurns ?? 0
        : f.assistantTurns ?? 0;
      return {
        count,
        filter: () => ({ count, first: () => ({ evaluate: async () => f.composerEmpty ?? true }) }),
      };
    },
  } as unknown as Page;
}

test("new Project chat must belong to authenticated account and be pristine", async () => {
  expect((await verifyChatGptProjectTurnPage(fakePage(), target, "before-attach")).kind).toBe("new");
  await expect(verifyChatGptProjectTurnPage(fakePage({ userTurns: 1 }), target, "before-attach")).rejects.toThrow("empty");
  await expect(verifyChatGptProjectTurnPage(fakePage({ composerEmpty: false }), target, "before-attach")).rejects.toThrow("empty");
  await expect(verifyChatGptProjectTurnPage(fakePage({ accountId: "other" }), target, "before-attach")).rejects.toThrow("account");
});
test("safely rejects personal history, missing project and changing URL", async () => {
  await expect(verifyChatGptProjectTurnPage(fakePage({url:"https://chatgpt.com/"}),target,"before-attach")).rejects.toThrow();
  await expect(verifyChatGptProjectTurnPage(fakePage({
    nextUrl: "https://chatgpt.com/c/ordinary",
  }),target,"before-attach")).rejects.toThrow("changed");
});
test("retained conversation must keep the exact conversation identity", async () => {
  expect((await verifyChatGptProjectTurnPage(fakePage({url:conversationUrl}),target,"before-send",conversationId)).conversationId).toBe(conversationId);
  await expect(verifyChatGptProjectTurnPage(fakePage({url:conversationUrl}),target,"before-send","different"))
    .rejects.toThrow("retained");
});
test("post-Send verifies project URL without replay or a fallback", async () => {
  expect((await verifyAcceptedChatGptProjectTurn(fakePage({url:conversationUrl}),target)).conversationId).toBe(conversationId);
  await expect(verifyAcceptedChatGptProjectTurn(fakePage({url:"https://chatgpt.com/c/ordinary"}),target))
    .rejects.toThrow("selected project");
});
