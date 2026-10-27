# ChatGPT Project routing — test report (Draft PR #1)

Baseline: fork `main` and upstream `main` at `cfeaf04bc7f54cea29e1ff2adbcad63bd038b119` (v6.1.14).

## Performed checks

| Check | Status | Evidence / limitation |
|---|---|---|
| Original local PoC policy unit tests | PASS | 7/7 using Node 22 `--experimental-strip-types --test`, in an independent overlay |
| Original local PoC launcher account tests | PASS | 4/4 using `node --test` |
| Original local PoC browser fixtures | PASS | 11/11 using a simulated Playwright Page |
| Original integration anchor fixture | PASS (synthetic) | 65 replacements across 16 source files; not a full checkout |
| Current PR diff / main unchanged | PASS | Six new files in first commit `ea7e06e`; no edits to upstream/main |
| Current PR full TypeScript / `bun run verify` | NOT RUN | This execution container does not have Bun or a full repository checkout |
| `bun run smoke:subagents` / Electron smoke / packaging / audit | NOT RUN | Requires full build environment |
| Fork GitHub Actions Linux/macOS/Windows | NOT RUN | GitHub API returned zero workflow runs and zero check runs following Draft PR creation |
| Real ChatGPT Project DEV browser, MCP, subagents E2E | BLOCKED | Separate explicit approval for authenticated DEV session required |

**Do not interpret offline tests as proof that actual chats are saved in a ChatGPT Project.**
The code on this branch is only the stand-alone routing safety policy and browser helper, not a completed application feature.

## Security / outstanding work

- Verify actual Project routes and DOM in an isolated authorized session before enabling automated sends.
- Integrate AppConfig, launcher Settings, browser helper negotiation and task-only worker navigation.
- Guard account/project/empty composer before every physical send, exact retained conversation identity, and non-retry of accepted Sends.
- Keep Zero Risk manual, default OFF, and leave historical chats untouched.
- Run full tests and CI, address failures, then run E2E; no merge or release approval granted.

Rollback: revert the Draft branch commit(s); no ChatGPT conversations are touched.
