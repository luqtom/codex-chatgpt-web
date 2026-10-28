# ChatGPT Project routing — current test report

Date: 2026-10-28. Draft PR: https://github.com/luqtom/codex-chatgpt-web/pull/1
Fork `main` / upstream base: `cfeaf04` (v6.1.14). Topic head after DEV fix: `fe35600`.

## Code and scope

Implemented on PR branch (default OFF): Settings selection of an existing Project, authenticated account fingerprint, owner-only setup handoff, AppConfig/provider/helper/worker routing, task-only new-chat preparation, Project/account/composer checks before Send, post-acceptance verification, exact retained-chat binding, non-retryable failure, no personal-history fallback, CJS log redaction and DEV CLI flag support. No chats are moved, archived or deleted.

## Verification matrix

| Test | Status | Grounded evidence |
|---|---|---|
| Core routing policy (local overlay) | **PASS** | 7/7 Node 22.16 `--experimental-strip-types --test` |
| Launcher account/Project page contract (local overlay) | **PASS** | 4/4 `node --test` |
| Browser guard simulated Page (local overlay) | **PASS** | 11/11; no real browser |
| Isolated strict TypeScript on new policy + guard (local overlay) | **PASS** | `node scripts/test-isolated-types.mjs` with facade types |
| Staged integration anchors, syntax and drift handling (local overlay) | **PASS (synthetic)** | 65 exact source replacements / 16 files; 8 fragment syntax checks; not a full build |
| GitHub PR source integration and CJS syntax | **PASS (static)** | 30+ modified files; diff reviewed, seven CJS files parsed by V8, exact target anchors confirmed |
| In-repo new browser guard test | **NOT RUN** | Code published; requires Bun/dependencies |
| Full `bun run verify` / `bun run smoke:subagents` | **NOT RUN** | Bun not present; direct clone blocked by DNS |
| `bun run app:smoke`, `bun run app:package`, `bun run audit` | **NOT RUN** | Full Electron runtime, deps, build unavailable |
| GitHub Actions CI (Linux, Windows, macOS) | **NOT RUN** | GitHub reports 0 runs and 0 check runs for fork PR, including after code updates |
| Account-bound Project DEV + MCP + subagents E2E | **BLOCKED** | No isolated logged-in DEV browser and observed URL/DOM fixture |

## Outstanding risk and acceptance

**Do not mark feature ready or merge/release.** Official Projects documentation confirms organizational semantics but not browser URL or DOM shape. The strict URL parser is provisional. E2E must prove actual saved Project membership, cancellation, compaction, images, streaming, account switch, access denied, helper restarts and subagents (Compatibility V1 and Native/V2). Every failure must block or preserve a previously accepted Send without replay.

Potential deployment blocker: GitHub Actions appears not to have started workflows in this fork; inspect/enable the repository's Actions configuration using an authorized GitHub UI/account or available administrative interface. Do not describe CI as PASS when there are no jobs.

Rollback: disable optional setting after active turns finish or revert topic branch changes. Both actions leave existing chats untouched.
