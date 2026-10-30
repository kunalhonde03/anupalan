# ANUPALAN — Rules for Claude Code

## Mission
Build the SIH 2026 PS 26262 prototype described in `docs/ANUPALAN.md` (export of the planning document).
The 9-step demo in `docs/demo-script.md` is the definition of done. If a task does not help a demo step, do not build it.

## Hard Invariants (Tests enforce these; never weaken a test to make it pass)
1. **Human-Only Decisions**: The system never approves, rejects, returns, or completes a stage. Only a named human actor with a permitted role can. The System actor (scheduler) may only fire alerts, send notifications, and recompute dates.
2. **Single Source of Time**: All time comes from `clock.now()` in `packages/engine`. Never call `Date.now()` or `new Date()` anywhere else. Timezone is `Asia/Kolkata`.
3. **Transactional Audit Logging**: Every state change appends to `audit_log` in the same DB transaction under `pg_advisory_xact_lock`.
4. **Scoped Data Access**: All queries go through the Scope layer (`role`, `region`, `institution`). No raw Prisma calls in route handlers.
5. **Pathways & Policies are DATA**: Pathways, SLAs, escalation ladders, holidays, and obligation types are DATA (`rules/aph-2024-27.yaml` and DB tables). Never hard-code stage names or day counts in logic.
6. **Unverified Rules Flagged**: Any rule not verified against the APH is marked `P` in the rule pack and must not appear in UI copy as an established fact.
7. **Mandatory Reasons & Blocked Transitions**: A Return or Revert always has a non-empty reason. Illegal transitions are blocked and logged as `BLOCKED_TRANSITION`.
8. **Derived Overdue**: Overdue is derived from dates and status. Never store it.

## Working Style
- **Plan first**: list the files and tests you will touch, then implement.
- **Test-first engine**: For anything in `packages/engine`, write the failing test first. Use concrete dates in tests, including a weekend and a holiday.
- **Small commits**: Run `pnpm test` and `pnpm lint` before every commit.
- **Dependency discipline**: No new dependency without a one-line reason. Prefer boring, well-known tools.
- **Deterministic synthetic data**: Seed data is deterministic (seeded RNG) and synthetic. Never use real institution names or attach fake violations to real names.
- **Invariants approval**: Ask before changing the data model or any invariant above.
- **Verification tracking**: When unsure about an AICTE rule, add a `# P` flag and a TODO in `docs/verification-list.md` instead of guessing.

## Stack
TypeScript end to end. pnpm workspaces.
- `packages/engine`: Pure logic, no I/O (calendar, SLA, workflow, readiness, index, hash chain)
- `packages/db`: Prisma schema, migrations, seed
- `packages/shared`: Zod schemas and shared types
- `apps/api`: Fastify + Zod + Prisma, auth, RBAC, file service
- `apps/worker`: Tick, digest, seals, notification dispatch
- `apps/web`: Next.js, Tailwind, shadcn/ui, Recharts, TanStack Query
- `infra/docker-compose.yml`: PostgreSQL, MinIO, MailHog
- `e2e`: Playwright for the 9-step demo regression

## Commands
```bash
pnpm dev        # start all services
pnpm test       # unit + API tests
pnpm e2e        # Playwright: the 9 demo steps
pnpm db:reset   # drop, migrate, seed fixtures
pnpm seed       # deterministic synthetic data (pnpm seed -- --seed 2026)
pnpm lint       # run linter including Date bans
```

## Definition of Done for Any Task
- Tests written and green; invariants still green.
- Audit entry written for every new mutation.
- Empty, loading, and error states exist in the UI.
- The change is reachable from a demo step, or it is removed.

## Review Prompt (Use in a fresh session after each phase)
> "Review the latest diff against the invariants in CLAUDE.md. List any violation, any date or timezone risk, any place a human-only action can be reached by the System actor, and any query that bypasses the Scope layer. Do not add features."
