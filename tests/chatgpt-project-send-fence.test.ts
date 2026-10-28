import { readFileSync } from "node:fs";
import { test, expect } from "bun:test";

/**
 * Regression for ChatGPT Project Send TOCTOU. This test checks the source
 * contract; real browser behavior must still be confirmed in DEV E2E.
 */
test("each physical Send verifies the Project after activation and before keypress", () => {
  const source = readFileSync(new URL("../src/adapters/chatgpt-web/browser-worker.ts", import.meta.url), "utf8");
  const begin = source.indexOf("  private async sendAttachedPrompt(");
  const end = source.indexOf("  private async waitForMultipartAcknowledgement(", begin);
  expect(begin).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(begin);
  const method = source.slice(begin, end);
  const activated = method.indexOf("await submissionLifecycle?.onSendActivated?.();");
  const guard = method.indexOf("await submissionLifecycle?.beforePhysicalSend?.();");
  const press = method.indexOf('sendButton.press("Enter"');
  expect(activated).toBeGreaterThan(-1);
  expect(guard).toBeGreaterThan(activated);
  expect(press).toBeGreaterThan(guard);
  expect(method).toContain('if (abortSignal?.aborted) throw new DOMException("ChatGPT web turn aborted"');

  const turns = source.slice(source.indexOf("  private async runBrowserTurn("));
  expect(turns.match(/beforePhysicalSend: async \(\) =>/g)?.length).toBe(2);
  expect(turns.match(/verifyChatGptProjectTurnPage\(page, taskProject, "before-send", projectConversationId\)/g)?.length)
    .toBeGreaterThanOrEqual(2);
});
