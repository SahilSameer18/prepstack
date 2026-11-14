# Instructions for AI coding agents (any tool)

This file is for agents that look for `AGENTS.md`. The full rules are in `CLAUDE.md` (same content, kept as the one source: read it), and the current state is in `PROJECT_STATUS.md`.

Start here, in this order:
1. `docs/HANDOFF.md`: where the project stands, the API a client can call, how the client is built, practical notes.
2. `PROJECT_STATUS.md`: what is done, what is left, the build order. The next job is My plan Phase 5 (the public builder page).
3. `CLAUDE.md`: the rules (never commit; one-line commit messages without trailers; easy words for learners; sources for every fact; the Today screen is sacred; tests and mutation checks; keep cost low).
4. `docs/plans/MY_PLAN_PLAN.md`: the full plan and a dated log of every phase.

Before you say a piece is done: run the server and client tests, the build and the lint, update `PROJECT_STATUS.md`, `TESTING.md` and the plan's status paragraph, and give the owner the `git add` and one-line `git commit -m` commands.
