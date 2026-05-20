# Devex PO Grid Filters — Chromatic minimal repro

Reproduction of the RSVN Hub test `@P1 - Devex - PO Grid Filters` for [Chromatic Playwright](https://github.com/AriPerkkio/minimal-repro-chromatic-playwright).

Source: `quality-assurance/End-To-End/RSVN/Playwright`

## Layout

| Path | Role |
|------|------|
| `testsuite/non-parallel/hub/devex/devex-suite.spec.ts` | Test suite entry |
| `tests/hub/testcases/non-parallel/devex/devex-po-grid-filters.spec.ts` | Main test (many `takeSnapshot()` calls) |
| `tests/hub/testcases/.../devex-po-grid-filters-sub-tests.spec.ts` | Sub-test helpers (`DevexPOSubTests`) |
| `tests/hub/utils/devex.utils.ts` | Full Devex grid helpers (from QA) |
| `tests/hub/utils/hub.utils.ts` | Trimmed Hub helpers (login/navigation only) |
| `tests/hub/utils/login-page.utils.ts` | Trimmed login (`qabusiness`) |
| `tests/hub/utils/po.utils.ts` | Trimmed PO search |
| `fixtures/global-before-after-each.ts` | Chromatic `test` + Angular page proxy |

The bundled `example.test.ts` (local Vite page) remains for upstream demos; the Devex repro uses the real Hub URL.

## Setup

This repro always targets the **mb-chromatic** Azure QA Hub:

`https://mb-chromatic-rsvn.c3qualitycontrol.com/RSVN/app/login`

That URL is built from `AZURE_NAMESPACE=mb-chromatic` in `playwright.config.ts` (see `.env.template`). There is no `isAzure` flag in this repo — Azure is assumed. Login uses the shared QA user `qabusiness` / `qabusiness`.

```bash
pnpm install
pnpm exec playwright install chromium
```

### Environment file

| Goal | `.env` needed? |
|------|----------------|
| Local repro (`pnpm test:devex`) | **No** — defaults are enough |
| Upload to Chromatic (`pnpm chromatic`) | **Yes** — copy template and set token |

```bash
cp .env.template .env   # Windows: copy .env.template .env
```

Edit `.env` and set `CHROMATIC_PROJECT_TOKEN` only. Keep `AZURE_NAMESPACE=mb-chromatic` unchanged.

The token is under **Manage → Configure** in your [Chromatic project](https://www.chromatic.com/docs/access/#project-token). Share it only with people who should upload builds to that project.

## Run locally

```bash
pnpm test:devex
```

No `.env` file and no Chromatic token required.

## Run on Chromatic

```bash
pnpm chromatic
```

Requires `CHROMATIC_PROJECT_TOKEN` in `.env` or in the environment (e.g. CI secret). The Chromatic CLI sets `IS_CHROMATIC=true` automatically; you do not add that to `.env`.

## Notes for Chromatic maintainers

- `disableAutoSnapshot: true` globally; snapshots are manual via `takeSnapshot()` in `DevexPOSubTests.handleOptionalParameters`.
- Failure under investigation: `page.evaluate: Execution context was destroyed` inside `executeSnapshotScript`, often after several snapshots on Angular + DevExtreme PO grid.
- Page proxy (`fixtures/angular/angular-stability.ts`) matches production tests.
