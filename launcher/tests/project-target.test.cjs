const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProjectPageUrl, authenticatedProjectAccountKey } = require("../electron/project-target.cjs");

const url = "https://chatgpt.com/g/g-p-1234567890123456/project";
test("validates only canonical ChatGPT Project page", () => {
  assert.equal(validateProjectPageUrl(url), url);
  for (const invalid of [url + "?temporary-chat=true", url + "#x",
    "https://example.org/g/g-p-1234567890123456/project",
    "https://chatgpt.com/c/old", "https://chatgpt.com/"]) {
    assert.throws(() => validateProjectPageUrl(invalid));
  }
});
test("account binding uses authenticated server identity", async () => {
  const session = { user:{id:"user"}, account:{id:"workspace",planType:"plus",structure:"personal"},
    expires:new Date(Date.now()+60000).toISOString() };
  const fetchSession = async (_url,options) => {
    assert.equal(options.redirect,"error");
    return { ok:true, headers:{get:()=> "application/json"}, json: async()=>session };
  };
  const key = await authenticatedProjectAccountKey(fetchSession);
  assert.match(key,/^[a-f0-9]{64}$/);
  assert.equal(key,await authenticatedProjectAccountKey(fetchSession));
});
test("unverified account fails without exposing user data", async () => {
  const fetchSession = async () => ({ok:true,headers:{get:()=> "application/json"},
    json:async()=>({user:{id:"sensitive-user"},account:{id:"secret-workspace"}})});
  await assert.rejects(authenticatedProjectAccountKey(fetchSession),
    error=>!error.message.includes("sensitive-user") && !error.message.includes("secret-workspace"));
});
test("launcher diagnostics never expose selected Project URLs or account fingerprints", () => {
  const { redactText, redactExportText, sanitizeForExport } = require("../electron/logging.cjs");
  const selected = "https://chatgpt.com/g/g-p-1234567890123456/project";
  const chat = "https://chatgpt.com/g/g-p-1234567890123456/c/12345678-1234-1234-1234-123456789abc";
  for (const redact of [redactText, redactExportText]) {
    assert.doesNotMatch(redact("Failed to open " + selected), /g-p-1234567890123456/);
    assert.doesNotMatch(redact("Failed to open " + chat), /g-p-1234567890123456/);
  }
  const exported = sanitizeForExport({
    projectTarget: { url: selected, accountKey: "a".repeat(64) }, status: "failure",
  });
  assert.equal(exported.projectTarget, "[redacted]");
  assert.equal(exported.status, "failure");
});
test("Project selection may not retire retained conversations before a successful setup", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const main = fs.readFileSync(path.join(__dirname, "..", "electron", "main.cjs"), "utf8");
  const start = main.indexOf('handle("launcher:project-target"');
  const end = main.indexOf('handle("launcher:fresh-conversation-per-turn"', start);
  assert.ok(start > 0 && end > start, "launcher Project setting handler should exist");
  const handler = main.slice(start, end);
  assert.match(handler, /await runtimeHost\.setChatGptProjectTarget\(url, accountKey\)/);
  assert.doesNotMatch(handler, /releaseRetainedConversation\(/, "retained chats must survive setup failure");
  assert.match(handler, /syncBrowserPreferences\(stateStore, runtimeHost\.runtimeConfigSnapshot\(\)\.config\)/);
});
