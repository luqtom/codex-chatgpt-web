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
