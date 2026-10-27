# ChatGPT Projects routing — fork work plan

Goal: optionally route Codex task/subagent conversations into one existing ChatGPT Project instead of personal ChatGPT history.

1. **Baseline & security research — PASS (offline):** fork/upstream `cfeaf04`, no pre-existing fork feature, controlled workspace; no official Projects API. Browser URL/DOM identity **not confirmed live**.
2. **Fail-closed core guard — IMPLEMENTED (Draft):** validate target/current account and Project, new empty composer, retained conversation; check before/after each physical Send; no silent personal-chat fallback.
3. **Launcher configuration — IMPLEMENTED (Draft):** optional Project field in Settings, default OFF, authenticated account fingerprint, private temporary handoff to existing transactional setup; invalidates retained tabs on target changes; Zero Risk stays manual.
4. **Runtime/agent bridge — IMPLEMENTED (Draft):** AppConfig → provider → helper feature negotiation → worker, preserves Browser-only/Full harness routing, freshness, streaming/compaction hooks. Real subagent behavior **not tested**.
5. **Regression coverage — PARTIAL:** unit and browser-facade tests locally passed; in-repository tests added. Must run full `bun run verify`, `smoke:subagents`, `app:smoke`, `app:package`, `audit`, review Linux/Windows/macOS CI.
6. **DEV ChatGPT E2E — BLOCKED:** use isolated authorized account and existing Project; confirm actual URL/DOM and saved Project membership for new and retained chats, multipart, cancellation, MCP tools, images, V1/native subagents, account switch, denied access, drift; no retries after accepted Send.
7. **Release gate — PENDING:** continue Draft PR #1; merge and release require a separate explicit approval.

Rollback: disable Project routing for already-finished tasks, or revert feature branch; never automatically delete/move existing ChatGPT conversations. No cookies, tokens, raw diagnostics or private Project IDs in PR.
