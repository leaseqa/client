# LeaseQA Client Documentation Map

This directory contains the current, versioned product documentation for the live LeaseQA client.

## Canonical Docs

Use these files as the source of truth for current behavior:

- [product-prd.md](product-prd.md)
  - Current v2 product scope, roles, flows, constraints, and acceptance criteria
- [architecture.md](architecture.md)
  - Current system architecture and deployment topology
- [api-design.md](api-design.md)
  - Current app-level API contract summary
- [release-checklist.md](release-checklist.md)
  - Pre-release and regression verification checklist
- [README.md](../README.md)
  - Repo-level setup, deployment entry points, and high-level shipped features

## Historical Docs

These documents remain useful, but they are not the current source of truth:

- [project-plan.md](project-plan.md)
  - Original v1 delivery timeline and milestone plan
- `docs/superpowers/specs/*`
  - Point-in-time design records for completed work
- `docs/superpowers/plans/*`
  - Point-in-time implementation plans for completed work

## Cross-Repo Docs

- Server operational docs live in [server/README.md](https://github.com/leaseqa/server/blob/codex/upl-study-2x2-live/README.md)
- Server-specific implementation notes live in [server/AGENTS.md](https://github.com/leaseqa/server/blob/codex/upl-study-2x2-live/AGENTS.md)

## Maintenance Rule

If a feature changes public behavior, this docs set should be reviewed before the work is considered complete.
