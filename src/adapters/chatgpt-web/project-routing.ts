import type { Page } from "playwright-core";
import {
  CHATGPT_ASSISTANT_TURN_SELECTOR,
  CHATGPT_COMPOSER_SELECTOR,
  CHATGPT_USER_TURN_SELECTOR,
} from "../../chatgpt-session";
import {
  assertChatGptProjectRoute,
  ChatGptProjectRoutingError,
  parseChatGptProjectRoute,
  type ChatGptProjectTarget,
  type ChatGptProjectCheckpoint,
  type ChatGptProjectRoute,
} from "../../chatgpt-project-routing";
import { readChatGptUsageAccount } from "./limits";

/** Task-only verification. Never route independent login or diagnostic operations. */
export async function verifyChatGptProjectTurnPage(
  page: Page, target: ChatGptProjectTarget, phase: ChatGptProjectCheckpoint,
  expectedConversationId?: string,
): Promise<ChatGptProjectRoute> {
  const before = page.url();
  const { accountKey } = await readChatGptUsageAccount(page);
  const composer = page.locator(CHATGPT_COMPOSER_SELECTOR).filter({ visible: true });
  const [composerCount, userTurnCount, assistantTurnCount] = await Promise.all([
    phase === "after-send" ? Promise.resolve(0) : composer.count(),
    phase === "after-send" ? Promise.resolve(undefined) : page.locator(CHATGPT_USER_TURN_SELECTOR).count(),
    phase === "after-send" ? Promise.resolve(undefined) : page.locator(CHATGPT_ASSISTANT_TURN_SELECTOR).count(),
  ]);
  const composerEmpty = phase === "before-attach" && composerCount === 1
    ? await composer.first().evaluate(element => {
      const text = element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement
        ? element.value : element.textContent ?? "";
      return text.trim() === "";
    })
    : undefined;
  const after = page.url();
  if (before !== after) {
    throw new ChatGptProjectRoutingError("active ChatGPT address changed during verification");
  }
  return assertChatGptProjectRoute(target, {
    url: after, accountKey, composerVisible: composerCount === 1,
    composerEmpty, userTurnCount, assistantTurnCount,
  }, phase, expectedConversationId);
}

/** Never resend a physical message already accepted by ChatGPT. */
export async function verifyAcceptedChatGptProjectTurn(
  page: Page, target: ChatGptProjectTarget,
  expectedConversationId?: string, signal?: AbortSignal,
): Promise<ChatGptProjectRoute> {
  const deadline = Date.now() + 8_000;
  while (true) {
    signal?.throwIfAborted();
    const current = parseChatGptProjectRoute(page.url());
    const selected = parseChatGptProjectRoute(target.url)!;
    if (!current || current.projectId !== selected.projectId) {
      throw new ChatGptProjectRoutingError("accepted message left the selected project");
    }
    if (current.kind === "conversation") {
      return verifyChatGptProjectTurnPage(page, target, "after-send", expectedConversationId);
    }
    if (Date.now() >= deadline) {
      throw new ChatGptProjectRoutingError("accepted message did not establish a project conversation URL");
    }
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => { clearTimeout(timer); reject(signal?.reason); };
      const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, 100);
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
    });
  }
}
