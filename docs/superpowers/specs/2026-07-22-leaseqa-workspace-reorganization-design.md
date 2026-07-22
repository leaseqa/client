# LeaseQA Workspace Reorganization Design

**Date:** 2026-07-22  
**Status:** Approved for implementation planning

## 1. Objective

Create one understandable local entry point for the LeaseQA product, its live
`2 x 2` research implementation, and the associated paper while preserving the
three existing Git histories and all current uncommitted work.

The reorganization must make the relationship between product code and research
artifacts visible without merging the repositories or duplicating the paper.

## 2. Constraints and decisions

- `/Users/Z1nk/Desktop/proj/leaseqa` remains the local project hub.
- The client, server, and research paper remain separate Git repositories.
- The GitHub repository `leaseqa/UPL` is renamed to `leaseqa/research`.
- The course directory `/Users/Z1nk/Desktop/neu/7375/UPL` keeps its existing
  name and remains the physical location of the research repository.
- The project hub exposes the research repository through a local-only symbolic
  link named `research`.
- Client and server directory names lose the redundant `leaseqa-` prefix.
- The client and server branches `codex/upl-study-2x2-live` remain intact and
  are not merged, renamed, or deleted.
- Invalid historical worktree registrations are pruned; no valid checkout is
  deleted.
- Raw participant data, Prolific billing records, environment files, and other
  sensitive research materials remain local under `.private/` and are ignored
  by Git.
- Existing uncommitted client and server files must be preserved exactly.

## 3. Target structure

### 3.1 Local project hub

```text
/Users/Z1nk/Desktop/proj/leaseqa/
├── client/                    # GitHub leaseqa/client
├── server/                    # GitHub leaseqa/server
├── research -> /Users/Z1nk/Desktop/neu/7375/UPL
├── resources/
│   └── rag-corpus/            # local RAG source corpus
├── docs/
│   └── notes/                 # project-hub notes and pointers
└── .local/
    ├── logs/
    ├── uploads/
    ├── test-results/
    ├── tmp/
    ├── caches/
    └── environments/
```

The hub is not converted into a fourth Git repository. It is an organizational
container for the two code repositories, one research link, shared local
resources, and disposable runtime state.

### 3.2 Research repository

```text
/Users/Z1nk/Desktop/neu/7375/UPL/
├── README.md
├── manuscript/
├── study-materials/
├── analysis/
├── presentation/
├── references/
├── templates/
│   └── acm/
├── archive/
└── .private/
    ├── data/
    ├── billing/
    └── participant-materials/
```

`leaseqa-paper-upl-pilot/` is not retained as another namespace. Its useful
contents are promoted into the corresponding root-level directories. Exact
duplicate drafts at the repository root and inside that directory are reduced
to one canonical copy under `manuscript/`.

## 4. Remote repository model

```text
github.com/leaseqa/client
github.com/leaseqa/server
github.com/leaseqa/research
```

Renaming `leaseqa/UPL` changes only the repository name. Its commit history,
default `main` branch, visibility, and permissions remain unchanged. After the
rename, the local UPL checkout's `origin` is explicitly updated to the new URL
instead of relying on GitHub's old-URL redirect.

The local symbolic link is not committed to any remote repository. Repository
relationships are documented using normal GitHub URLs in the three README
files.

## 5. Canonical ownership

| Content | Canonical location |
| --- | --- |
| Frontend and study UI | `client/` |
| Backend, RAG, study assignment, and transcript export | `server/` |
| Paper, study protocol, analysis, and presentation | `research/` target (`7375/UPL`) |
| Raw Qualtrics export and billing records | `research/.private/` |
| Tenant-rights source corpus used locally | `resources/rag-corpus/` |
| Runtime logs, uploads, screenshots, and caches | `.local/` |

No authoritative file is maintained in two locations. README files point to the
owner rather than copying its content.

## 6. File classification and cleanup

### 6.1 Preserve and relocate

- Rename `leaseqa-client/` to `client/` and `leaseqa-server/` to `server/`.
- Move the current tenant-rights source corpus into `resources/rag-corpus/`.
- Move workspace notes such as `00_WORKSPACE_ROLE.md`, `PRD.md`, and
  `前端去AI味.md` into a small documented notes area, eliminating obsolete
  pointer content where the canonical client documentation already exists.
- Move project-hub logs, uploads, Playwright screenshots, test results, and
  caches into `.local/` when they remain useful. Repository-owned runtime
  directories stay in place when application code depends on their relative
  paths; they are ignored or cleaned within that repository instead.
- Do not move an existing virtual environment because its scripts may embed
  absolute paths. Record its reproducible dependencies, remove it only when it
  is safe to recreate, and create any replacement under `.local/environments/`.
- Consolidate research manuscripts, materials, analysis outputs,
  presentations, references, and ACM templates into the target research
  structure.

### 6.2 Sensitive material

The following classes must live under `research/.private/` and be excluded by
the research repository's `.gitignore` before any research files are staged:

- raw Qualtrics CSV exports;
- Prolific invoices and payment summaries;
- participant-identifying exports or notes;
- environment files and credentials;
- other administrative records not intended for publication.

The implementation verifies exclusion with `git check-ignore` and verifies
that none of these paths appear in `git status` as stageable files.

### 6.3 Remove only when safe

- Delete exact duplicate manuscript copies only after matching cryptographic
  hashes and confirming the canonical destination exists.
- Remove empty log, upload, and test-result placeholders only after confirming
  they contain no useful state.
- Remove disposable virtual environments and dependency caches only when they
  can be recreated from repository configuration.
- Remove `.DS_Store` files and other macOS metadata.
- Do not delete ambiguous files; place them in `archive/needs-review/` with an
  inventory entry instead.

## 7. Git branch and worktree handling

The active client and server directories remain on
`codex/upl-study-2x2-live`. Their uncommitted changes are inventoried before the
directory rename and verified byte-for-byte afterward.

The following worktree records are already missing on disk and may be pruned
after a second existence check:

- the former `/Users/Z1nk/Desktop/proj/leaseqa-main/...` worktrees;
- the former `/private/tmp/leaseqa-*-main-release` worktrees.

Pruning removes stale Git metadata only. It does not remove a branch or a live
directory. No new worktree is created because the retained experiment branch
does not currently need simultaneous editing alongside `main`.

## 8. Path-reference policy

Directory renames affect many absolute path references. Migration updates:

- active README files;
- active AGENTS files;
- executable scripts;
- current architecture, API, release, and documentation-index files;
- current research manuscript links to source code.

Historical implementation plans and archived records retain their original
paths as historical evidence unless a path is executed by a current workflow.
After migration, a repository-wide search reports every remaining old path and
classifies it as either intentionally historical or still actionable.

## 9. Migration order

1. Capture repository status, branch tips, remotes, worktrees, and hashes of
   uncommitted files.
2. Confirm sensitive-file ignore rules before staging anything in the research
   repository.
3. Bring the local research repository's understanding of the remote state up
   to date without overwriting local files.
4. Rename the GitHub repository from `UPL` to `research` and update `origin`.
5. Consolidate the research directory while preserving private data.
6. Rename the local client and server directories.
7. Create the local-only `research` symbolic link.
8. Classify and relocate project-hub notes, resources, and runtime artifacts.
9. Update active path references and cross-repository README links.
10. Prune only verified stale worktree metadata.
11. Run structural, Git, and targeted project verification.

This order keeps every source path available until its destination and Git
state have been verified.

## 10. Verification

### 10.1 Structural checks

- `client`, `server`, and `research` resolve from the project hub.
- `research` resolves exactly to `/Users/Z1nk/Desktop/neu/7375/UPL`.
- No redundant `leaseqa-client`, `leaseqa-server`, or
  `leaseqa-paper-upl-pilot` directory remains.
- The old `/Desktop/neu/7375/UPL` physical path still exists.

### 10.2 Git checks

- All three repositories have the expected `origin` URLs.
- Client and server remain on `codex/upl-study-2x2-live` at the same commit IDs.
- Pre-existing uncommitted client and server changes remain present.
- Research remains on `main`, tracks the renamed remote, and exposes no private
  files for staging.
- No valid branch is deleted and no live worktree is pruned.

### 10.3 Content checks

- Canonical manuscript and study-material files exist once.
- Duplicate removals have recorded hash evidence.
- Current docs and scripts contain no stale actionable absolute paths.
- Cross-repository links point to `leaseqa/research`.

### 10.4 Project checks

- Run targeted client tests covering the study view and AI-review flow.
- Run targeted server tests covering `LeaseQA/Study` and RAG session framing.
- Run the least expensive available research build or manuscript integrity
  check without exposing `.private/` contents.

## 11. Recovery strategy

- Directory moves remain on the same volume and are recorded in a migration
  manifest containing old path, new path, type, size, and hash where relevant.
- Git-tracked content is recoverable from its repository history.
- Sensitive and untracked files are copied or moved only after inventory and
  destination verification.
- If verification fails, reverse the manifest in dependency order; do not use
  `git reset --hard` or other destructive Git recovery.

## 12. Non-goals

- Merging client, server, and research into a monorepo.
- Introducing Git submodules or a fourth workspace repository.
- Merging or renaming the `codex/upl-study-2x2-live` branches.
- Publishing raw participant data or administrative records.
- Rewriting historical Git commits or historical planning documents.
- Refactoring application behavior as part of the directory cleanup.
