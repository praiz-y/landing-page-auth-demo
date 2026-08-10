# .ai/ — Change reports

Every work session that changes the codebase gets a report here, written
after the work is done. This is a log of what actually happened, in build
order — `docs/roadmap.md` is the plan going in, this folder is the record
coming out.

## Naming

`YYYY-MM-DD-short-slug.md`, e.g. `2026-07-29-docs-setup.md`. If a phase from
the roadmap spans multiple sessions, one file per session, not one growing
file — smaller and easier to skim later.

## Template

```markdown
# YYYY-MM-DD — Title

**Roadmap phase:** (link to the docs/roadmap.md phase, if applicable)

## What changed
- ...

## Why
- ...

## Files touched
- ...

## Notes for next time
- Anything the next session should know: open questions, things deferred,
  decisions made and why.
```

Keep entries factual and short. This folder is for picking up context fast,
not for prose.
