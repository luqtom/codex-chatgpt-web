# ChatGPT Project routing — working plan

Objective: route future Codex task and subagent ChatGPT Web conversations into one existing chosen Project, optionally and fail-closed.

1. **Repository reconnaissance — PASS**: fork/upstream `cfeaf04`; provider/browser/helper/launcher and tests mapped; `main` untouched.
2. **Core policy — IMPLEMENTED (Draft)**: strict selected account/Project and empty composer checks; retained chat binding and post-Send verification. Actual Project DOM unconfirmed.
3. **Launcher & CLI — IMPLEMENTED (Draft)**: optional Settings field, private account fingerprint and temp file, config validation, rollback-compatible setup, stale lease retirement; DEV CLI accepts flags. Zero Risk remains manual.
4. **Bridge & subagents — IMPLEMENTED (Draft, E2E outstanding)**: provider → launcher helper feature negotiation → task worker, preserving model/effort and ordinary inspection surfaces.
5. **Offline verification — PARTIAL PASS**: isolated unit/facade tests, CJS parser and static source anchors. Full Bun/TypeScript runtime and Electron test suites NOT RUN.
6. **CI — BLOCKED/NOT RUN**: fork GitHub Actions currently exposes zero runs; require activation/configuration and full matrix Linux, Windows, macOS, then repair regressions.
7. **DEV E2E — BLOCKED**: requires isolated, authorized logged-in account and a real Project. Record observed DOM/URL, verify membership after sending, cancellation, reuse/compaction, MCP, images, streaming, Browser-only/Full, V1/Native subagents and negative cases.
8. **Merge/release — PENDING separate explicit approval**. Maintain Draft PR #1.

Invariants: no hidden fallback to ordinary history when Project routing is enabled, no automatic chat deletion/moving, no private Project IDs or auth artifacts in GitHub. Project instructions/memory influence model context; Projects aren't a sandbox boundary. Rollback is disabling the feature or reverting the topic branch, not removing chat history.

## Immediate remaining work (prioritized)

1. Enable/verify the fork's Actions CI matrix and fix `bun run verify` issues before calling the feature working.
2. Develop a safe, durable Project conversation binding across browser-helper restarts, without adopting an unrelated chat inside the same Project. An unavailable binding must remain fail-closed.
3. Validate the strict Project URL/DOM route using an authorized isolated DEV ChatGPT session; prove actual membership after a physical Send and verify no fallback to ordinary history.
4. Verify package builds, image/streaming/MCP/compaction, both subagent protocols, and update documentation. Keep Draft until required PASS gates are met.
