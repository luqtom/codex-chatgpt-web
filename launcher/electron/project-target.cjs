"use strict";
const { createHash } = require("node:crypto");

// This Project address shape is provisional until a real isolated DEV UI test.
// A changed route must block the operation, not fall back to personal history.
const PROJECT_PAGE = /^\/g\/(g-p-[a-z0-9][a-z0-9-]{7,127})\/project$/;

function validateProjectPageUrl(value) {
  if (typeof value !== "string" || value.length > 512) {
    throw new Error("Select an existing ChatGPT Project page");
  }
  let url;
  try { url = new URL(value); } catch {
    throw new Error("Select an existing ChatGPT Project page");
  }
  if (url.protocol !== "https:" || url.hostname !== "chatgpt.com" ||
    url.port || url.username || url.password || url.search || url.hash ||
    !PROJECT_PAGE.test(url.pathname)) {
    throw new Error("Select the canonical URL of an existing ChatGPT Project page");
  }
  return url.href;
}

// Bind the selection to the server-authenticated account and workspace.
// Only a SHA-256 fingerprint leaves this probe, never raw session fields.
async function authenticatedProjectAccountKey(fetchSession, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();
  try {
    const response = await fetchSession("https://chatgpt.com/api/auth/session", {
      credentials: "include", cache: "no-store", redirect: "error",
      headers: { accept: "application/json" }, signal: controller.signal,
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Authentication cannot be verified");
    }
    const session = await response.json();
    const userId = session?.user?.id;
    const accountId = session?.account?.id;
    const planType = session?.account?.planType;
    const structure = session?.account?.structure;
    if (session?.error != null && session.error !== "") {
      throw new Error("Authentication cannot be verified");
    }
    if (session?.expires != null && (typeof session.expires !== "string" ||
      !Number.isFinite(Date.parse(session.expires)) ||
      Date.parse(session.expires) <= Date.now())) {
      throw new Error("Authentication cannot be verified");
    }
    if ([userId, accountId, planType, structure].some(v =>
      typeof v !== "string" || !v || v.length > 256)) {
      throw new Error("Account and workspace cannot be verified");
    }
    return createHash("sha256").update(userId + "\0" + accountId).digest("hex");
  } catch {
    // No private response, URL or network details in launcher errors or logs.
    throw new Error("ChatGPT account and workspace cannot be verified");
  } finally {
    clearTimeout(timer);
  }
}
module.exports = { validateProjectPageUrl, authenticatedProjectAccountKey };
