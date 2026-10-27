# ChatGPT Project routing — verification report

Updated: 2026-10-28. PR #1: https://github.com/luqtom/codex-chatgpt-web/pull/1 (Draft).
Base fork and upstream `main`: `cfeaf04`, v6.1.14.

| Check | Status | Evidence / scope |
| --- | --- | --- |
| Original local routing policy | **PASS** | 7/7 Node v22.16 `--experimental-strip-types --test` against locally staged logic |
| Original local account URL/fingerprint tests | **PASS** | 4/4 `node --test` against local launcher module |
| Original local simulated browser probe | **PASS** | 11/11 against isolated Playwright Page facade (not Electron) |
| GitHub source anchor validation | **PASS** | Each replacement anchored exactly once in live fork source at v6.1.14 |
| GitHub candidate CJS parser | **PASS** | 7 modified Electron/launcher CJS modules parsed by V8 `Function` without execution |
| GitHub candidate core source sanity | **PASS (static)** | Required guards and paths found across 16 modified real-source candidates |
| New in-repo browser fixture test | **NOT RUN** | Added as `tests/chatgpt-project-browser-guard.test.ts`, requires Bun/dependencies |
| Full `bun run verify`, `bun run smoke:subagents` | **NOT RUN** | Bun 1.4.0 unavailable in current container and repository clone blocked by DNS |
| `bun run app:smoke`, packaging and audit | **NOT RUN** | Electron environment/dependencies unavailable |
| GitHub Actions CI matrix | **NOT RUN** | Check for runs after pushing this commit; prior PR had zero Actions runs |
| Real authenticated Project DEV E2E and native↔Web subagents | **BLOCKED** | No isolated authorized logged-in DEV browser/session, and unverified Project DOM route |

## Scope implemented in Draft PR

- Optional launcher Settings Project URL, server-authenticated account binding, private temporary setup file and config validation.
- Task-only Project navigation with checks before composer attachment, before physical Send, after accepted Send and before continuing a retained chat.
- Browser helper protocol feature gate, nonretryable routing errors, account/project drift failure, log redaction.
- Ordinary diagnostics/sign-in/MCP connector checks stay outside Project; Zero Risk remains manual.
- Routing default OFF; no conversations moved, archived, deleted or recreated automatically.

## Important limitations

The account-bound route is a provisional browser-automation contract, **not an official Projects API**. Published Help Center confirms Projects group related conversations and instructions but does not confirm the exact URL/DOM contract. A logged-in isolated DEV experiment is required before release. Changing URL, workspace, account, Project permissions, helper process or DOM shape must block without fallback.

Do not mark ready for production and do not merge before all required tests and E2E pass.

Rollback: revert the feature commit on the topic branch; no ChatGPT conversations are touched.
