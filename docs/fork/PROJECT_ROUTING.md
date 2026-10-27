# ChatGPT Project routing — experimental (fork)

This is a **Draft PR / work in progress** for optionally routing Codex task and subagent chats into an existing ChatGPT Project.

## Safety contract

- OFF by default, preserving upstream behavior.
- Never create, archive, delete or move any conversation.
- While enabled, require an authenticated account match, an empty new chat within the selected Project, and a verified conversation after each Send.
- On mismatch or UI drift, **fail closed**; do not send to ordinary personal history or replay an ambiguous Send.
- Project URLs and account fingerprints are sensitive; redact them in logs.
- Browser-only and Full harness share the routing guard. Zero Risk must remain manual.
- Existing login, model/effort inspection and MCP verification continue using ordinary ChatGPT surfaces.

## Status / acceptance gates

The initial commit contains the stand-alone routing policy and unit tests. It is **not connected to the launcher** and cannot yet route conversations. The remaining integration must be checked against the actual fork code, including task leasing, continuation, compaction, subagents and every physical send.

Required before release: Bun tests + full typecheck, Electron smoke, Linux/Windows/macOS CI, DOM fixtures gathered with explicit DEV session approval, and account-bound E2E with real ChatGPT Project membership confirmed. The route shape in the policy is provisional; no official Projects API is claimed. No live session is used by this PR.
