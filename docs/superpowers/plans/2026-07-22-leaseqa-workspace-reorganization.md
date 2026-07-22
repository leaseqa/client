# LeaseQA Workspace Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the local LeaseQA workspace into `client`, `server`, and a local `research` link; rename the GitHub UPL repository to `research`; consolidate the paper repository; and isolate sensitive and disposable local files without losing current work.

**Architecture:** Keep three independent Git repositories and use `/Users/Z1nk/Desktop/proj/leaseqa` only as a local project hub. The physical research checkout remains `/Users/Z1nk/Desktop/neu/7375/UPL`; the hub exposes it through a local-only symbolic link. Every destructive cleanup is preceded by an explicit path, hash, Git, or symlink check and followed by structural and project verification.

**Tech Stack:** Git, GitHub CLI, zsh, macOS filesystem/symlinks, Node.js/npm, Next.js/Vitest, Express/Node test runner, LaTeX source files.

## Global Constraints

- `/Users/Z1nk/Desktop/proj/leaseqa` remains the local project hub and is not turned into another Git repository.
- Client, server, and research remain separate Git repositories.
- `/Users/Z1nk/Desktop/neu/7375/UPL` keeps its physical directory name.
- GitHub `leaseqa/upl` is renamed to `leaseqa/research` without changing visibility, history, or the `main` default branch.
- Client and server stay on `codex/upl-study-2x2-live`; do not merge, rename, or delete that branch.
- Preserve all current client and server uncommitted files byte-for-byte.
- `.env.xintao-study`, raw Qualtrics exports, Prolific records, participant-identifying material, and local reference PDFs must never be staged or pushed.
- Do not commit the local absolute `research` symbolic link.
- Do not edit historical plan/spec paths merely to make old records look current.
- Do not use `git reset --hard`, `git checkout -- <path>`, or recursive deletion against an unresolved path.
- Use `rtk` wrappers where supported; use raw commands only when RTK has no equivalent or exact output is required.

## File and ownership map

| Path after migration | Responsibility |
| --- | --- |
| `/Users/Z1nk/Desktop/proj/leaseqa/client` | Frontend product and study UI Git repository |
| `/Users/Z1nk/Desktop/proj/leaseqa/server` | Backend, RAG, study assignment, and transcript export Git repository |
| `/Users/Z1nk/Desktop/proj/leaseqa/research` | Local-only symlink to the physical research checkout |
| `/Users/Z1nk/Desktop/neu/7375/UPL` | Physical `leaseqa/research` Git repository |
| `/Users/Z1nk/Desktop/proj/leaseqa/resources/rag-corpus` | Local tenant-rights source corpus |
| `/Users/Z1nk/Desktop/proj/leaseqa/docs/notes` | Local hub notes and pointers |
| `/Users/Z1nk/Desktop/proj/leaseqa/docs/archive/superpowers` | Historical untracked hub-level design/plan documents |
| `/Users/Z1nk/Desktop/proj/leaseqa/.local` | Logs, caches, temporary verification material, and migration recovery data |
| `/Users/Z1nk/Desktop/neu/7375/UPL/.private` | Ignored participant data, billing records, private references, and debug output |

---

### Task 1: Capture the pre-migration state and establish recovery evidence

**Files:**
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/manifest.md`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/upl-snapshot/`
- Read: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/`
- Read: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/`
- Read: `/Users/Z1nk/Desktop/neu/7375/UPL/`

**Interfaces:**
- Consumes: Current directory tree, Git state, and known working-file hashes.
- Produces: A recovery snapshot and exact invariants used by every later task.

- [ ] **Step 1: Verify the three source paths resolve to the expected object types**

Run:

```bash
test -d /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/.git
test -d /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/.git
test -d /Users/Z1nk/Desktop/neu/7375/UPL/.git
test -L /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa
```

Expected: exit code `0` for all four checks.

- [ ] **Step 2: Verify branch tips and remote URLs before any move**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client branch --show-current
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client rev-parse HEAD
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client merge-base --is-ancestor 781a5ceb5dd237190e939190a9b91689a384fac9 HEAD
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server branch --show-current
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server rev-parse HEAD
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL branch --show-current
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL remote -v
```

Expected:

```text
client branch: codex/upl-study-2x2-live
client HEAD: contains design commit 781a5ceb5dd237190e939190a9b91689a384fac9 as an ancestor
server branch: codex/upl-study-2x2-live
server HEAD: 131ff850658b2372564585568a62cbb0ef1733ae
research branch: main
research origin: https://github.com/leaseqa/UPL.git or the lowercase-equivalent URL
```

If either code HEAD has advanced because another intentional commit landed,
record the new commit in the manifest; do not move the directory until the
branch name and working-file hashes below still match.

- [ ] **Step 3: Verify the current uncommitted files have not changed since planning**

Run:

```bash
cd /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client
shasum apps/web/app/ai-review/page.tsx apps/web/app/page.tsx apps/web/app/refresh.css apps/web/next.config.mjs apps/web/.gitignore
cd /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server
shasum .env.xintao-study
```

Expected:

```text
95a724d6cdbe720ae16b887563b2d1773a03acab  apps/web/app/ai-review/page.tsx
54cbe23e025f341f95d8df2717dae9ecfb0e6deb  apps/web/app/page.tsx
df5b6bb6dbb82b1f3c3aa2bc57a61315c86ccff0  apps/web/app/refresh.css
7a4e4b59f8562d15a15f80ead1cd70e9de394e29  apps/web/next.config.mjs
5ef831bad77dad8cab915d9463fe982d293ded54  apps/web/.gitignore
045294981865145d6196f2b86f03ef4599ef185d  .env.xintao-study
```

Expected: every hash matches. Stop if any hash differs and refresh the
manifest before continuing.

- [ ] **Step 4: Create the migration directories and a research recovery snapshot**

Run:

```bash
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/upl-snapshot
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine
rsync -a --exclude='.git' --exclude='venv' /Users/Z1nk/Desktop/neu/7375/UPL/ /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/upl-snapshot/
```

Expected: snapshot contains the paper, study materials, private files, ACM
assets, presentations, and references, but no `.git` directory or `venv`.

- [ ] **Step 5: Create the exact manifest with apply_patch**

Create `/Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/manifest.md`
with the verified branch tips, six working-file hashes, the three remote URLs,
and the output of these commands:

```bash
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client status --short
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client worktree list
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server status --short
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server worktree list
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL status --short
```

Expected: the manifest contains no environment-file contents or participant
data, only paths, Git state, and hashes.

---

### Task 2: Rename the GitHub research repository and safely fast-forward the local checkout

**Files:**
- Modify GitHub repository metadata: `leaseqa/upl` -> `leaseqa/research`
- Modify Git remote: `/Users/Z1nk/Desktop/neu/7375/UPL/.git/config`
- Temporarily move: `/Users/Z1nk/Desktop/neu/7375/UPL/plans/`

**Interfaces:**
- Consumes: Task 1 snapshot and the physical UPL checkout.
- Produces: Local research `main` at the current remote commit with origin set to `leaseqa/research`.

- [ ] **Step 1: Confirm GitHub permissions and destination availability**

Run:

```bash
gh repo view leaseqa/upl --json nameWithOwner,viewerPermission,isPrivate,defaultBranchRef
gh repo view leaseqa/research --json nameWithOwner 2>&1
```

Expected: `leaseqa/upl` reports `viewerPermission: ADMIN`, `isPrivate: true`,
and default branch `main`; the destination lookup reports that
`leaseqa/research` does not yet exist.

- [ ] **Step 2: Move the one known untracked path that conflicts with remote `main`**

Run:

```bash
mv /Users/Z1nk/Desktop/neu/7375/UPL/plans /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-plans-before-sync
```

Expected: `UPL/plans` is absent and the quarantined copy contains
`2026-04-06-autoacad-draft-upgrade.md`.

- [ ] **Step 3: Rename the remote repository**

Run:

```bash
gh api --method PATCH repos/leaseqa/upl -f name=research --jq '.full_name'
```

Expected: `leaseqa/research`.

- [ ] **Step 4: Update and verify the local remote**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL remote set-url origin https://github.com/leaseqa/research.git
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL remote -v
git -C /Users/Z1nk/Desktop/neu/7375/UPL ls-remote --symref origin HEAD
```

Expected: fetch/push URLs use `leaseqa/research.git`; remote HEAD resolves to
`refs/heads/main`.

- [ ] **Step 5: Fetch and fast-forward without overwriting untracked research files**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL fetch origin main
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL merge --ff-only origin/main
```

Expected: local `main` fast-forwards to the remote commit and creates the
tracked `.gitignore`, `README.md`, `manuscript/`, and `study-materials/`
structure. No merge commit is created.

- [ ] **Step 6: Confirm remote canonical files before local consolidation**

Run:

```bash
test -f /Users/Z1nk/Desktop/neu/7375/UPL/README.md
test -f /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/leaseqa_acm.tex
test -f /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/leaseqa_pilot_paper_draft.md
test -f /Users/Z1nk/Desktop/neu/7375/UPL/study-materials/upl-leaseqa-survey-import.txt
```

Expected: all checks exit `0`.

---

### Task 3: Consolidate the research tree and isolate private material

**Files:**
- Modify: `/Users/Z1nk/Desktop/neu/7375/UPL/.gitignore`
- Modify: `/Users/Z1nk/Desktop/neu/7375/UPL/README.md`
- Create: `/Users/Z1nk/Desktop/neu/7375/UPL/analysis/notes/`
- Create: `/Users/Z1nk/Desktop/neu/7375/UPL/templates/acm/`
- Create: `/Users/Z1nk/Desktop/neu/7375/UPL/archive/course-exports/`
- Create: `/Users/Z1nk/Desktop/neu/7375/UPL/archive/legacy_scripts/requirements.txt`
- Create: `/Users/Z1nk/Desktop/neu/7375/UPL/references/README.md`
- Create: `/Users/Z1nk/Desktop/neu/7375/UPL/.private/{data,billing,references,debug}/`
- Consolidate: `/Users/Z1nk/Desktop/neu/7375/UPL/leaseqa-paper-upl-pilot/`
- Consolidate: `/Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/`

**Interfaces:**
- Consumes: Synced research tree from Task 2 and Task 1 recovery snapshot.
- Produces: One canonical research tree with private files ignored and duplicate content quarantined.

- [ ] **Step 1: Add privacy and local-artifact rules before moving sensitive files**

Using apply_patch, ensure `.gitignore` contains these exact entries:

```gitignore
.private/
venv/
.DS_Store
*.aux
*.bbl
*.blg
*.fdb_latexmk
*.fls
*.log
*.out
manuscript/*.pdf
references/*.pdf
```

Run:

```bash
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/.private/data
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/.private/billing
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/.private/references
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/.private/debug
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL check-ignore -v .private/data .private/billing .private/references .private/debug
```

Expected: all four directories match the `.private/` ignore rule.

- [ ] **Step 2: Move sensitive data and administrative files into `.private`**

Run:

```bash
mv '/Users/Z1nk/Desktop/neu/7375/UPL/data/raw/leaseqa_April 3, 2026_16.19.csv' /Users/Z1nk/Desktop/neu/7375/UPL/.private/data/
mv /Users/Z1nk/Desktop/neu/7375/UPL/Prolific_Invoice_2026-04-01_69cd57a8d067f99e6643b534.pdf /Users/Z1nk/Desktop/neu/7375/UPL/.private/billing/
mv /Users/Z1nk/Desktop/neu/7375/UPL/prolific_summary_detailed_69cd5741a59e0cd5814620ff.pdf /Users/Z1nk/Desktop/neu/7375/UPL/.private/billing/
mv /Users/Z1nk/Desktop/neu/7375/UPL/references/*.pdf /Users/Z1nk/Desktop/neu/7375/UPL/.private/references/
mv /Users/Z1nk/Desktop/neu/7375/UPL/archive/debug_outputs/* /Users/Z1nk/Desktop/neu/7375/UPL/.private/debug/
rmdir /Users/Z1nk/Desktop/neu/7375/UPL/data/raw /Users/Z1nk/Desktop/neu/7375/UPL/data
rmdir /Users/Z1nk/Desktop/neu/7375/UPL/archive/debug_outputs
```

Expected: the raw CSV, two Prolific PDFs, reference PDFs, and debug outputs are
under `.private`; none appears in `rtk git status --short`.

Using apply_patch, create `references/README.md` with this exact local-reference
inventory:

```markdown
# Local reference library

The source PDFs are stored locally under `.private/references/` and are not committed.

- `(A)I Am Not a Lawyer, But...- Engaging Legal Experts towards Responsible LLM Policies for Legal Advice.pdf`
- `Conceptual Metaphors Impact Perceptions of Human-AI Collaboration.pdf`
- `Confronting verbalized uncertainty- Understanding how LLM’s verbalized uncertainty influences users in AI-assisted decision-making.pdf`
```

- [ ] **Step 3: Preserve the old analysis environment dependency set, then quarantine the non-portable venv**

Using apply_patch, create
`archive/legacy_scripts/requirements.txt` with exactly:

```text
annotated-doc==0.0.4
anyio==4.12.1
certifi==2026.2.25
charset-normalizer==3.4.6
click==8.3.1
filelock==3.25.2
fsspec==2026.2.0
gradio_client==2.3.0
h11==0.16.0
hf-xet==1.4.2
httpcore==1.0.9
httpx==0.28.1
huggingface_hub==1.7.1
idna==3.11
markdown-it-py==4.0.0
mdurl==0.1.2
packaging==26.0
Pygments==2.19.2
PyYAML==6.0.3
requests==2.32.5
rich==14.3.3
shellingham==1.5.4
tqdm==4.67.3
typer==0.24.1
typing_extensions==4.15.0
urllib3==2.6.3
```

Run:

```bash
/Users/Z1nk/Desktop/neu/7375/UPL/venv/bin/python -m pip freeze
mv /Users/Z1nk/Desktop/neu/7375/UPL/venv /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-venv
```

Expected: `pip freeze` matches the committed requirements file and the old
absolute-path venv is quarantined outside the research repository.

- [ ] **Step 4: Verify and quarantine duplicate manuscript files**

Run:

```bash
cmp /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa_pilot_paper_draft.md /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/leaseqa_pilot_paper_draft.md
cmp /Users/Z1nk/Desktop/neu/7375/UPL/literaturereivew.tex /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/literaturereivew.tex
cmp /Users/Z1nk/Desktop/neu/7375/UPL/methods.tex /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/methods.tex
cmp /Users/Z1nk/Desktop/neu/7375/UPL/pilot_paper_outline.md /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/pilot_paper_outline.md
cmp /Users/Z1nk/Desktop/neu/7375/UPL/PROGRESS.md /Users/Z1nk/Desktop/neu/7375/UPL/manuscript/PROGRESS.md
```

Expected: all comparisons exit `0`. Then run:

```bash
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-root-duplicates
mv /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa_pilot_paper_draft.md /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-root-duplicates/
mv /Users/Z1nk/Desktop/neu/7375/UPL/literaturereivew.tex /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-root-duplicates/
mv /Users/Z1nk/Desktop/neu/7375/UPL/methods.tex /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-root-duplicates/
mv /Users/Z1nk/Desktop/neu/7375/UPL/pilot_paper_outline.md /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-root-duplicates/
mv /Users/Z1nk/Desktop/neu/7375/UPL/PROGRESS.md /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/upl-root-duplicates/
```

Expected: each canonical file remains under `manuscript/` exactly once.

- [ ] **Step 5: Verify the nested pilot directory duplicates canonical content, then quarantine it**

Run:

```bash
for rel in manuscript/PROGRESS.md manuscript/leaseqa_pilot_paper_draft.md manuscript/literaturereivew.tex manuscript/methods.tex manuscript/pilot_paper_outline.md manuscript/proposal.bib manuscript/proposal.tex plans/2026-04-06-autoacad-draft-upgrade.md study-materials/README.md study-materials/leaseqa-high-banner-with-conversation.png study-materials/massachusetts-framing-basis.md study-materials/upl-leaseqa-survey-import.txt study-materials/upl-participant-task-instructions.md study-materials/upl-security-deposit-case-packet.md; do
  cmp "/Users/Z1nk/Desktop/neu/7375/UPL/leaseqa-paper-upl-pilot/$rel" "/Users/Z1nk/Desktop/neu/7375/UPL/$rel"
done
```

Expected: every comparison exits `0`. Preserve the nested README for history,
then quarantine the redundant directory:

```bash
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/archive/legacy_docs
cp /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa-paper-upl-pilot/README.md /Users/Z1nk/Desktop/neu/7375/UPL/archive/legacy_docs/leaseqa-paper-upl-pilot-README.md
mv /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa-paper-upl-pilot /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/
```

- [ ] **Step 6: Consolidate analysis notes, presentations, course exports, and ACM assets**

Run:

```bash
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/analysis
mv /Users/Z1nk/Desktop/neu/7375/UPL/notes /Users/Z1nk/Desktop/neu/7375/UPL/analysis/notes
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/archive/course-exports
mv /Users/Z1nk/Desktop/proj/leaseqa/Methods.pdf /Users/Z1nk/Desktop/neu/7375/UPL/archive/course-exports/
mv /Users/Z1nk/Desktop/proj/leaseqa/literaturereivew.pdf /Users/Z1nk/Desktop/neu/7375/UPL/archive/course-exports/
mv /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa_academic_talk_notes.pdf /Users/Z1nk/Desktop/neu/7375/UPL/presentation/
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/archive/needs-review
mv /Users/Z1nk/Desktop/neu/7375/UPL/image.png /Users/Z1nk/Desktop/neu/7375/UPL/archive/needs-review/
mkdir -p /Users/Z1nk/Desktop/neu/7375/UPL/templates/acm
```

Restore the ACM template files from the Task 1 snapshot into `templates/acm/`:

```bash
for name in ACM-Reference-Format.bst README.txt acmart.cls acmauthoryear.bbx acmauthoryear.cbx acmdatamodel.dbx acmguide.pdf acmnumeric.bbx acmnumeric.cbx sample-base.bib sample-franklin.png sample-manuscript.tex; do
  cp "/Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/upl-snapshot/$name" "/Users/Z1nk/Desktop/neu/7375/UPL/templates/acm/$name"
done
```

Expected: no ACM template file remains loose at UPL root.

- [ ] **Step 7: Consolidate project-hub Qualtrics materials into the research repository**

First verify the six common files are exact duplicates:

```bash
for name in README.md leaseqa-high-banner-with-conversation.png massachusetts-framing-basis.md upl-leaseqa-survey-import.txt upl-participant-task-instructions.md upl-security-deposit-case-packet.md; do
  cmp "/Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/$name" "/Users/Z1nk/Desktop/neu/7375/UPL/study-materials/$name"
done
```

Expected: every comparison exits `0`. Move the five unique artifacts into the
canonical study-materials directory:

```bash
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/LeaseQA_Security_Deposit_Case_Packet.docx /Users/Z1nk/Desktop/neu/7375/UPL/study-materials/
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/LeaseQA_Security_Deposit_Case_Packet.pdf /Users/Z1nk/Desktop/neu/7375/UPL/study-materials/
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/upl-security-deposit-case-packet.html /Users/Z1nk/Desktop/neu/7375/UPL/study-materials/
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/upl-security-deposit-case-packet.rtf /Users/Z1nk/Desktop/neu/7375/UPL/study-materials/
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics/upload-pdf-after-start-chat-no-answer.png /Users/Z1nk/Desktop/neu/7375/UPL/study-materials/
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/qualtrics /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/hub-qualtrics-duplicates
```

Expected: the hub no longer owns a second study-materials tree.

- [ ] **Step 8: Remove the backward research-to-code symlink to prevent a link cycle**

Run:

```bash
test -L /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa
readlink /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa
unlink /Users/Z1nk/Desktop/neu/7375/UPL/leaseqa
```

Expected: `readlink` reports `/Users/Z1nk/Desktop/proj/leaseqa`; only the
symlink is removed, not its target.

---

### Task 4: Document, commit, and push the canonical research repository

**Files:**
- Modify: `/Users/Z1nk/Desktop/neu/7375/UPL/README.md`
- Modify: `/Users/Z1nk/Desktop/neu/7375/UPL/study-materials/README.md`
- Modify: current links under `/Users/Z1nk/Desktop/neu/7375/UPL/manuscript/`
- Add: the approved public research directories from Task 3
- Exclude: `/Users/Z1nk/Desktop/neu/7375/UPL/.private/`

**Interfaces:**
- Consumes: Consolidated and privacy-guarded research tree.
- Produces: A clean `leaseqa/research` `main` branch whose README maps the paper to the retained code branches.

- [ ] **Step 1: Update the research README with the final ownership map**

Using apply_patch, make `README.md` contain these sections and facts:

```markdown
# LeaseQA Research

Research artifacts for the LeaseQA pilot study on advice-like perception in a Massachusetts tenant-rights chatbot.

## Repositories

- Client and study UI: https://github.com/leaseqa/client/tree/codex/upl-study-2x2-live
- Server, study assignment, framing, and transcript export: https://github.com/leaseqa/server/tree/codex/upl-study-2x2-live

## Structure

- `manuscript/`: canonical paper sources and ACM build files
- `study-materials/`: participant-facing task and interface materials
- `analysis/`: research notes and reproducibility material
- `presentation/`: talk deck, figures, notes, and build script
- `templates/acm/`: retained ACM template assets
- `archive/`: legacy scripts and superseded material

## Private local material

Raw participant data, Prolific records, private source PDFs, and debug outputs live under the ignored `.private/` directory and are never committed.
```

In current files under `manuscript/`, apply these exact path mappings:

```text
/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client -> /Users/Z1nk/Desktop/proj/leaseqa/client
/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server -> /Users/Z1nk/Desktop/proj/leaseqa/server
/Users/Z1nk/Desktop/neu/7375/UPL/leaseqa-paper-upl-pilot/manuscript -> /Users/Z1nk/Desktop/neu/7375/UPL/manuscript
https://github.com/leaseqa/UPL -> https://github.com/leaseqa/research
https://github.com/leaseqa/upl -> https://github.com/leaseqa/research
```

- [ ] **Step 2: Verify private and generated files cannot be staged**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL check-ignore -v .private/data/* .private/billing/* .private/references/* .private/debug/*
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL status --short
```

Expected: every private file is ignored; status contains only public research
structure changes and no `.private`, invoice, Prolific, raw CSV, or reference
PDF path.

- [ ] **Step 3: Run structural research checks**

Run:

```bash
make -n -C /Users/Z1nk/Desktop/neu/7375/UPL/manuscript
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL diff --check
rg -n 'leaseqa/UPL|leaseqa-paper-upl-pilot|/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-(client|server)' /Users/Z1nk/Desktop/neu/7375/UPL --glob '!archive/**' --glob '!.private/**'
```

Expected: `make -n` prints the `latexmk` command without executing it;
`diff --check` passes; `rg` reports no current-file references to the old
repository name, nested pilot directory, or old code paths. A full PDF build is
not required because no TeX engine is installed locally.

- [ ] **Step 4: Commit only public research files**

Run:

```bash
cd /Users/Z1nk/Desktop/neu/7375/UPL
rtk git add .gitignore README.md manuscript study-materials analysis presentation references templates archive plans
rtk git diff --cached --check
rtk git diff --cached --stat
rtk git commit -m 'chore: organize LeaseQA research artifacts'
```

Expected: commit succeeds and the cached diff contains no private files.

- [ ] **Step 5: Push and verify the renamed remote**

Run:

```bash
rtk git push origin main
gh repo view leaseqa/research --json nameWithOwner,url,defaultBranchRef,isPrivate
```

Expected: push succeeds; GitHub reports private repository
`leaseqa/research` with default branch `main`.

---

### Task 5: Rename the local code directories and preserve active working state

**Files:**
- Move: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client/` -> `/Users/Z1nk/Desktop/proj/leaseqa/client/`
- Move: `/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server/` -> `/Users/Z1nk/Desktop/proj/leaseqa/server/`
- Create symlink: `/Users/Z1nk/Desktop/proj/leaseqa/research`

**Interfaces:**
- Consumes: Task 1 branch and hash invariants; physical UPL path from Task 4.
- Produces: The three final hub entry names without changing code branches or working files.

- [ ] **Step 1: Confirm target names do not already exist**

Run:

```bash
test ! -e /Users/Z1nk/Desktop/proj/leaseqa/client
test ! -e /Users/Z1nk/Desktop/proj/leaseqa/server
test ! -e /Users/Z1nk/Desktop/proj/leaseqa/research
```

Expected: all checks exit `0`.

- [ ] **Step 2: Rename the two repositories on the same volume**

Run:

```bash
mv /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client /Users/Z1nk/Desktop/proj/leaseqa/client
mv /Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server /Users/Z1nk/Desktop/proj/leaseqa/server
```

Expected: both old names are absent; both new directories contain `.git`.

- [ ] **Step 3: Create and verify the one-way research symlink**

Run:

```bash
ln -s /Users/Z1nk/Desktop/neu/7375/UPL /Users/Z1nk/Desktop/proj/leaseqa/research
test -L /Users/Z1nk/Desktop/proj/leaseqa/research
readlink /Users/Z1nk/Desktop/proj/leaseqa/research
```

Expected: `readlink` prints `/Users/Z1nk/Desktop/neu/7375/UPL`.

- [ ] **Step 4: Re-verify branch tips and user working-file hashes after the move**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client branch --show-current
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client rev-parse HEAD
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server branch --show-current
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server rev-parse HEAD
cd /Users/Z1nk/Desktop/proj/leaseqa/client
shasum apps/web/app/ai-review/page.tsx apps/web/app/page.tsx apps/web/app/refresh.css apps/web/next.config.mjs apps/web/.gitignore
cd /Users/Z1nk/Desktop/proj/leaseqa/server
shasum .env.xintao-study
```

Expected: branch names, commit IDs, and all six hashes match Task 1.

---

### Task 6: Update active path references and cross-repository documentation

**Files:**
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/README.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/AGENTS.md` (local ignored file)
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/docs/README.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/docs/product-prd.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/docs/architecture.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/docs/api-design.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/docs/release-checklist.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/client/scripts/check-home-hero-preview-structure.mjs`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/server/README.md`
- Modify: `/Users/Z1nk/Desktop/proj/leaseqa/server/AGENTS.md` (local ignored file)

**Interfaces:**
- Consumes: Final names from Task 5.
- Produces: Current executable docs and scripts that use relative links or the new absolute paths; historical plans remain unchanged.

- [ ] **Step 1: Apply the exact active-path mapping with apply_patch**

Use this mapping only in the files listed above:

```text
/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client -> /Users/Z1nk/Desktop/proj/leaseqa/client
/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-server -> /Users/Z1nk/Desktop/proj/leaseqa/server
/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-client-frontend -> /Users/Z1nk/Desktop/proj/leaseqa/client
https://github.com/leaseqa/UPL -> https://github.com/leaseqa/research
https://github.com/leaseqa/upl -> https://github.com/leaseqa/research
```

Within the client repository, replace absolute same-repository Markdown links
with relative links such as `[Architecture](docs/architecture.md)`. Within the
server README, use GitHub URLs for client-owned documents so links render both
locally and on GitHub.

- [ ] **Step 2: Verify no actionable old path remains**

Run:

```bash
rg -n '/Users/Z1nk/Desktop/proj/leaseqa/leaseqa-(client|server)|leaseqa-client-frontend|github.com/leaseqa/(UPL|upl)' /Users/Z1nk/Desktop/proj/leaseqa/client/README.md /Users/Z1nk/Desktop/proj/leaseqa/client/AGENTS.md /Users/Z1nk/Desktop/proj/leaseqa/client/docs/README.md /Users/Z1nk/Desktop/proj/leaseqa/client/docs/product-prd.md /Users/Z1nk/Desktop/proj/leaseqa/client/docs/architecture.md /Users/Z1nk/Desktop/proj/leaseqa/client/docs/api-design.md /Users/Z1nk/Desktop/proj/leaseqa/client/docs/release-checklist.md /Users/Z1nk/Desktop/proj/leaseqa/client/scripts /Users/Z1nk/Desktop/proj/leaseqa/server/README.md /Users/Z1nk/Desktop/proj/leaseqa/server/AGENTS.md /Users/Z1nk/Desktop/neu/7375/UPL/manuscript
```

Expected: no matches.

- [ ] **Step 3: Commit client documentation and script paths without staging user changes**

Run:

```bash
cd /Users/Z1nk/Desktop/proj/leaseqa/client
rtk git add README.md docs/README.md docs/product-prd.md docs/architecture.md docs/api-design.md docs/release-checklist.md scripts/check-home-hero-preview-structure.mjs
rtk git diff --cached --check
rtk git diff --cached --stat
rtk git commit -m 'docs: align client with unified workspace paths'
```

Expected: the commit contains only documentation and the path-check script;
the five pre-existing user working files remain unstaged.

- [ ] **Step 4: Commit server documentation paths without staging the environment file**

Run:

```bash
cd /Users/Z1nk/Desktop/proj/leaseqa/server
rtk git add README.md
rtk git diff --cached --check
rtk git diff --cached --stat
rtk git commit -m 'docs: align server with unified workspace paths'
```

Expected: `.env.xintao-study` remains untracked and is not part of the commit.

---

### Task 7: Organize remaining project-hub resources and disposable artifacts

**Files:**
- Move: `/Users/Z1nk/Desktop/proj/leaseqa/source/` -> `/Users/Z1nk/Desktop/proj/leaseqa/resources/rag-corpus/`
- Move: `/Users/Z1nk/Desktop/proj/leaseqa/docs/superpowers/` -> `/Users/Z1nk/Desktop/proj/leaseqa/docs/archive/superpowers/`
- Move: root logs, test results, temporary screenshots, caches, and obsolete environment into `/Users/Z1nk/Desktop/proj/leaseqa/.local/`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/README.md`
- Create: `/Users/Z1nk/Desktop/proj/leaseqa/docs/notes/`

**Interfaces:**
- Consumes: Final repository names and consolidated research materials.
- Produces: A readable hub with only code entries, the research link, resources, docs, hidden local state, and tool configuration.

- [ ] **Step 1: Create the target hub directories**

Run:

```bash
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/resources
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/docs/notes
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/docs/archive
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/logs
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/uploads
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/test-results
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/tmp
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/caches
mkdir -p /Users/Z1nk/Desktop/proj/leaseqa/.local/quarantine/orphaned-code
```

- [ ] **Step 2: Move the RAG corpus and useful hub notes**

Run:

```bash
mv /Users/Z1nk/Desktop/proj/leaseqa/source /Users/Z1nk/Desktop/proj/leaseqa/resources/rag-corpus
mv /Users/Z1nk/Desktop/proj/leaseqa/00_WORKSPACE_ROLE.md /Users/Z1nk/Desktop/proj/leaseqa/docs/notes/workspace-role.md
mv /Users/Z1nk/Desktop/proj/leaseqa/PRD.md /Users/Z1nk/Desktop/proj/leaseqa/docs/notes/product-docs-pointer.md
mv /Users/Z1nk/Desktop/proj/leaseqa/前端去AI味.md /Users/Z1nk/Desktop/proj/leaseqa/docs/notes/frontend-design-notes.md
mv /Users/Z1nk/Desktop/proj/leaseqa/docs/superpowers /Users/Z1nk/Desktop/proj/leaseqa/docs/archive/superpowers
```

Expected: the corpus and notes have one named home; `docs/qualtrics` is already
absent from Task 3.

- [ ] **Step 3: Preserve the empty Milvus environment fact, then quarantine the non-portable environment**

Run:

```bash
/Users/Z1nk/Desktop/proj/leaseqa/.venv-milvus/bin/python -m pip freeze
mv /Users/Z1nk/Desktop/proj/leaseqa/.venv-milvus /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine/milvus-venv
```

Expected: `pip freeze` prints no packages; the venv is removed from hub root.

- [ ] **Step 4: Move runtime artifacts and caches into `.local`**

Run:

```bash
mv /Users/Z1nk/Desktop/proj/leaseqa/client.out /Users/Z1nk/Desktop/proj/leaseqa/client.err /Users/Z1nk/Desktop/proj/leaseqa/server.out /Users/Z1nk/Desktop/proj/leaseqa/server.err /Users/Z1nk/Desktop/proj/leaseqa/.local/logs/
mv /Users/Z1nk/Desktop/proj/leaseqa/test-results /Users/Z1nk/Desktop/proj/leaseqa/.local/test-results/workspace
mv /Users/Z1nk/Desktop/proj/leaseqa/tmp /Users/Z1nk/Desktop/proj/leaseqa/.local/tmp/workspace
mv /Users/Z1nk/Desktop/proj/leaseqa/uploads /Users/Z1nk/Desktop/proj/leaseqa/.local/uploads/workspace
mv /Users/Z1nk/Desktop/proj/leaseqa/paper_db /Users/Z1nk/Desktop/proj/leaseqa/.local/caches/paper_db
mv /Users/Z1nk/Desktop/proj/leaseqa/.tmp-playwright /Users/Z1nk/Desktop/proj/leaseqa/.local/tmp/playwright
```

Expected: application-owned `client/node_modules`, `server/node_modules`,
`server/uploads`, and `server/server.log` remain in their repositories.

- [ ] **Step 5: Quarantine the orphan root code and package-lock file**

Run:

```bash
test -f /Users/Z1nk/Desktop/proj/leaseqa/apps/web/components/theme/ThemeProvider.tsx
test ! -f /Users/Z1nk/Desktop/proj/leaseqa/package.json
mv /Users/Z1nk/Desktop/proj/leaseqa/apps /Users/Z1nk/Desktop/proj/leaseqa/.local/quarantine/orphaned-code/apps
mv /Users/Z1nk/Desktop/proj/leaseqa/package-lock.json /Users/Z1nk/Desktop/proj/leaseqa/.local/quarantine/orphaned-code/package-lock.json
```

Expected: ambiguous orphan code is preserved but hidden from the main tree.

- [ ] **Step 6: Create the hub README with apply_patch**

Create `/Users/Z1nk/Desktop/proj/leaseqa/README.md` with exactly this ownership
summary:

```markdown
# LeaseQA Workspace

Local entry point for the LeaseQA product and research project.

- `client/`: frontend and study UI (`leaseqa/client`)
- `server/`: backend, RAG, and study services (`leaseqa/server`)
- `research/`: local link to `/Users/Z1nk/Desktop/neu/7375/UPL` (`leaseqa/research`)
- `resources/rag-corpus/`: local tenant-rights source corpus
- `docs/`: local workspace notes and archived plans
- `.local/`: logs, caches, temporary outputs, and migration recovery material

The project hub is not a Git repository. Commit changes from the owning child repository.
```

- [ ] **Step 7: Remove macOS metadata from the exact project and research scopes**

Run:

```bash
find /Users/Z1nk/Desktop/proj/leaseqa /Users/Z1nk/Desktop/neu/7375/UPL -type f -name .DS_Store -print -delete
```

Expected: only `.DS_Store` files are printed and removed.

---

### Task 8: Prune stale worktree metadata and run final verification

**Files:**
- Modify Git metadata only: `/Users/Z1nk/Desktop/proj/leaseqa/client/.git/worktrees/`
- Modify Git metadata only: `/Users/Z1nk/Desktop/proj/leaseqa/server/.git/worktrees/`
- Remove verified migration quarantine and snapshot after all checks pass

**Interfaces:**
- Consumes: Completed filesystem and repository layout.
- Produces: Verified clean structure, retained user changes, valid remotes, passing targeted tests, and no stale worktree registrations.

- [ ] **Step 1: Dry-run worktree pruning and verify every candidate path is absent**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client worktree prune --dry-run --verbose
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server worktree prune --dry-run --verbose
test ! -e /Users/Z1nk/Desktop/proj/leaseqa-main/leaseqa-client
test ! -e /Users/Z1nk/Desktop/proj/leaseqa-main/leaseqa-server
test ! -e /private/tmp/leaseqa-client-main-release
test ! -e /private/tmp/leaseqa-server-main-release
```

Expected: dry-runs list only those four missing worktrees; all existence checks
exit `0`.

- [ ] **Step 2: Prune stale records and confirm only the live checkout remains**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client worktree prune --verbose
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server worktree prune --verbose
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client worktree list
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server worktree list
```

Expected: each repository lists only its live `client` or `server` checkout;
the `main` branch remains present and unlocked.

- [ ] **Step 3: Run targeted client verification**

Run:

```bash
cd /Users/Z1nk/Desktop/proj/leaseqa/client
rtk test npm run test --workspace @leaseqa/web -- app/study/view-model.test.ts app/study/qualtrics.test.ts app/ai-review/view-model.test.ts
rtk test npm run lint
```

Expected: all selected Vitest tests pass and ESLint exits `0`.

- [ ] **Step 4: Run targeted server verification**

Run:

```bash
cd /Users/Z1nk/Desktop/proj/leaseqa/server
rtk test node --test LeaseQA/Study/*.test.js LeaseQA/RAG/*.test.js LeaseQA/shared/*.test.js
```

Expected: all Study, RAG, and shared tests pass.

- [ ] **Step 5: Verify final Git and symlink state**

Run:

```bash
test "$(readlink /Users/Z1nk/Desktop/proj/leaseqa/research)" = '/Users/Z1nk/Desktop/neu/7375/UPL'
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client status --short
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server status --short
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL status --short
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL remote -v
gh repo view leaseqa/research --json nameWithOwner,url,defaultBranchRef,isPrivate
```

Expected:

```text
client: only the original five user working files are uncommitted
server: only .env.xintao-study is untracked
research: clean
research origin: https://github.com/leaseqa/research.git
GitHub: private leaseqa/research, default branch main
```

- [ ] **Step 6: Re-run the six working-file hashes**

Run:

```bash
cd /Users/Z1nk/Desktop/proj/leaseqa/client
shasum apps/web/app/ai-review/page.tsx apps/web/app/page.tsx apps/web/app/refresh.css apps/web/next.config.mjs apps/web/.gitignore
cd /Users/Z1nk/Desktop/proj/leaseqa/server
shasum .env.xintao-study
```

Expected: all six hashes exactly match Task 1.

- [ ] **Step 7: Push the retained experiment-branch documentation commits**

Run:

```bash
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client push origin codex/upl-study-2x2-live
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server push origin codex/upl-study-2x2-live
```

Expected: both pushes succeed; uncommitted application and environment files
remain local and are not pushed.

- [ ] **Step 8: Remove migration-only duplicates after every verification passes**

Resolve and validate the exact targets first:

```bash
realpath /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/upl-snapshot
realpath /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine
```

Expected: both paths are descendants of
`/Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22`. Then remove
only those verified migration copies:

```bash
rm -r /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/upl-snapshot
rm -r /Users/Z1nk/Desktop/proj/leaseqa/.local/migration/2026-07-22/quarantine
```

Keep `manifest.md` as the non-sensitive migration record.

- [ ] **Step 9: Report final directory tree and commits**

Run:

```bash
rtk tree /Users/Z1nk/Desktop/proj/leaseqa -L 3
rtk tree /Users/Z1nk/Desktop/neu/7375/UPL -L 3
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/client log -3 --oneline
rtk git -C /Users/Z1nk/Desktop/proj/leaseqa/server log -2 --oneline
rtk git -C /Users/Z1nk/Desktop/neu/7375/UPL log -2 --oneline
```

Expected: tree matches the design, no temporary migration copies remain, and
the three commit histories show only their intended documentation/research
changes.
