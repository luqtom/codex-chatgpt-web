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

The current Draft branch contains task-only browser-worker routing, helper feature negotiation, optional Launcher Settings, private account binding and setup, plus tests and documentation. **Integration is committed but not yet fully built/tested with Bun/Electron or validated in a real Project.**

Publicly documented third-party examples show routes of the forms `/g/g-p-<id>[-<slug>]/project` and `/g/g-p-<id>[-<slug>]/c/<conversation-id>`; these examples support the strict parser's expected path structure but **do not validate UI selectors, conversation membership, or permission checks in our DEV environment**. References:
- https://github.com/fitz-s/open-claude-gpt/blob/main/.env.example
- https://github.com/NataTassi/chatgpt-exporter
- https://github.com/openai/codex/issues/50161

Required before release: Bun `verify` + full typecheck, Electron smoke and packaging, Linux/Windows/macOS CI, DOM fixtures gathered with explicit DEV session approval, and account-bound E2E with real ChatGPT Project membership confirmed. No official Projects API is claimed. No live session has been used by this PR.
