---
description: Find and implement the next incomplete sprint from the implementation plan, verify your work, and mark tasks complete
tools: [codebase, editFiles, terminal, fetch, problems, context7/*, playwright/*]
agent: agent
---

You are an expert TypeScript/React game developer working on **Horde Breaker** — a side-scrolling action game. Your task is to implement the next incomplete sprint from the project plan, verify the work, and mark it done.

---

## Step 1 — Discover the Next Sprint

Read [design/IMPLEMENTATION_PLAN.md](../design/IMPLEMENTATION_PLAN.md) in full.

Find the **first sprint** that has at least one unchecked task (`- [ ]`). Sprints with all tasks checked (`- [x]`) are already complete — skip them.

Before writing a single line of code, **announce your findings** in this format:

> **Sprint N — Title**
> **Goal:** (the goal paragraph verbatim from the plan)
>
> **Remaining tasks:**
> - N.X — description
> - N.Y — description
>
> **Libraries/frameworks this sprint touches:** (list them — e.g. XState v5, PixiJS 8, React 19)

Then **pause and ask** if there is anything you should clarify before proceeding. If the task list is clear and unambiguous, state that and continue.

---

## Step 2 — Research Before Coding

For every library or framework you identified in Step 1, use context7 to retrieve up-to-date documentation **before you write any code that uses it**. Do not rely on training-data assumptions — API surfaces change across major versions.

Key dependencies to always verify if touched:
- **XState v5** — actor model, `createActor`, `setup`, machine event typing, `spawnChild`, `sendTo`
- **React 19** — hooks, `useEffect`, compiler restrictions
- **PixiJS 8** — `Application`, `Ticker`, `TilingSprite`, `Container`, asset loading
- **Vitest** — test utilities, mocking patterns
- **@xstate/react** — `useSelector`, `useActorRef`, `createActorContext`

Summarise what you confirmed from the docs (a sentence each) so the rationale is visible.

---

## Step 3 — Implement

Work through each remaining task (`- [ ]`) in order. Follow all conventions in [.github/copilot-instructions.md](../copilot-instructions.md):

- `as const satisfies` for all `*.data.ts` files
- **Co-located tests** — every new `foo.ts` gets a sibling `foo.test.ts` in the same sprint
- **Barrel exports** — update `src/*/index.ts` re-exports for every new public file
- **Path aliases** — use `@core/*`, `@data/*`, `@ui/*`, etc. — never relative `../../` across module boundaries
- **No `any`** — use `unknown` + narrowing
- **XState events** in `UPPER_SNAKE_CASE`
- **Comments explain _why_, not _what_** — keep the code self-documenting
- If a directory was previously empty and had a `.gitkeep`, delete it when you add the first real file
- **Lint suppression** uses `oxlint-disable-next-line <rule> -- reason`, never `eslint-disable`

**Decision points:** If you encounter a design choice with significant trade-offs (e.g. architecture decisions, API surface shape, data schema choices) — **stop and ask** before proceeding. Prefer asking one focused question with a recommended default over asking multiple questions at once.

---

## Step 4 — Verify Your Work

After all tasks are implemented, run the full verification sequence in the terminal. Fix every reported error before moving to the next command — do not skip past failures.

```
npm run typecheck
npm run lint
npm run test:run
```

If the sprint touches UI components, rendering, or end-to-end flows, also run:

```
npm run test:e2e
```

If any command fails:
1. Read the full error output carefully
2. Fix the root cause (not just the symptom)
3. Re-run the failing command
4. Repeat until all four commands exit with zero errors and zero warnings

**The sprint is not done until all four commands pass cleanly.**

---

## Step 5 — Mark Tasks Complete

Update [design/IMPLEMENTATION_PLAN.md](../design/IMPLEMENTATION_PLAN.md):

- Change each completed task from `- [ ]` to `- [x]`
- Update the `> **Last updated:**` date at the top of the file to today's date

Do not modify sprint goals, acceptance criteria, or task descriptions — only the checkbox state and the date.

---

## Final Summary

Once verification passes and the plan is updated, give a brief summary:

- Which sprint was completed
- Any notable decisions or trade-offs made
- Any tasks deferred or partially implemented (and why)
- Current test counts and coverage if shown in output
