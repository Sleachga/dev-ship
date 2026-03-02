---
name: dev-ship:add-frontmatter
description: Audit .ship/ files and add missing YAML frontmatter for backwards compatibility
argument-hint: "[--dry-run] [--feature <name>]"
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
---

# /dev-ship:add-frontmatter — Frontmatter Audit & Migration

You are executing the `/dev-ship:add-frontmatter` command. This command scans all `.ship/` markdown files, identifies those missing YAML frontmatter, and adds the correct frontmatter to each one.

## Parse Arguments

- **`--dry-run`**: Report what would change without writing any files.
- **`--feature <name>`**: Limit the audit to a single feature directory (e.g. `--feature auth-system`).

## Step 1: Check Prerequisites

1. Check that `.ship/` directory exists. If not, tell the user: "No `.ship/` directory found. Nothing to migrate." and stop.
2. If `--feature` was provided, verify `.ship/{name}/` exists. If not, tell the user the feature wasn't found and stop.

## Step 2: Collect Files to Audit

Use Glob to find all `.md` files under the target scope:

- **All features**: `.ship/**/*.md`
- **Single feature**: `.ship/{name}/**/*.md`

Exclude `.ship/BACKLOG.md` from the list — handle it separately in Step 4.

Build a list of candidate files.

## Step 3: Identify Files Missing Frontmatter

For each candidate file:
1. Read the first line.
2. If it starts with `---`, the file already has frontmatter — skip it.
3. Otherwise, add it to the **needs-migration** list.

## Step 4: Audit BACKLOG.md Separately

Check if `.ship/BACKLOG.md` exists. Read its first line. If it doesn't start with `---`, add it to the **needs-migration** list with type `backlog`.

## Step 5: Report Findings

Display a summary:

```
Frontmatter audit — {N} file(s) need migration:

  .ship/auth-system/META.md              [meta]
  .ship/auth-system/RESEARCH.md          [research]
  .ship/auth-system/phase-1/CONTEXT.md   [context]
  .ship/BACKLOG.md                       [backlog]

{M} file(s) already have frontmatter — no changes needed.
```

If **all files already have frontmatter**, tell the user and stop.

If `--dry-run` was passed, stop here without writing anything.

## Step 6: Confirm Before Writing

Use AskUserQuestion: "Add frontmatter to {N} file(s)?" with options:
- **"Add to all"** (Recommended): Migrate every file in the list.
- **"Let me pick"**: Step through each file and confirm individually.
- **"Cancel"**: Stop without changes.

## Step 7: Determine Correct Frontmatter Per File

For each file in the migration list, derive the appropriate frontmatter using the rules below. Use the file path to determine the type.

### META.md — path matches `.ship/{feature}/META.md`

```yaml
---
toc:
  - Status Overview
dependencies: []
version:
  created: {infer from file mtime: run `stat -f "%Sm" -t "%Y-%m-%d" {path}` on macOS or `stat -c "%y" {path}` on Linux, fall back to today}
  last_modified: {same as created}
---
```

### RESEARCH.md — path matches `.ship/{feature}/RESEARCH.md`

```yaml
---
toc:
  - Relevant Code
  - Architecture & Conventions
  - Testing Patterns
dependencies:
  - META.md
version:
  created: {infer from mtime or today}
  feature: {feature directory name}
---
```

### PLAN.md — path matches `.ship/{feature}/PLAN.md`

Read the file and count `### Phase` headings to get `phase_count`.

```yaml
---
toc:
  - Overview
  - Research Summary
  - Phases
  - Testing Strategy
dependencies:
  - META.md
  - RESEARCH.md
version:
  created: {infer from mtime or today}
  feature: {feature directory name}
  phase_count: {count of ### Phase headings}
---
```

### CONTEXT.md — path matches `.ship/{feature}/phase-{N}/CONTEXT.md`

```yaml
---
toc:
  - Decisions
  - Approach
dependencies:
  - ../../META.md
  - ../../PLAN.md
version:
  created: {infer from mtime or today}
  feature: {feature directory name}
  phase: {N}
---
```

### SUMMARY.md — path matches `.ship/{feature}/phase-{N}/SUMMARY.md`

Read the file and extract the commit hash from the `## Commit` section (first token on the line after the heading).

```yaml
---
toc:
  - What was done
  - Files changed
  - Tests
  - Commit
dependencies:
  - ../../META.md
  - CONTEXT.md
version:
  created: {infer from mtime or today}
  feature: {feature directory name}
  phase: {N}
  commit: {extracted hash or "unknown"}
---
```

### DEMO-NOTES.md — path matches `.ship/{feature}/DEMO-NOTES.md`

```yaml
---
toc:
  - Walkthrough
dependencies:
  - META.md
  - TEST-PLAN.md
version:
  created: {infer from mtime or today}
  feature: {feature directory name}
---
```

### TEST-PLAN.md — path matches `.ship/{feature}/TEST-PLAN.md`

```yaml
---
toc:
  - Setup
  - Test Cases
  - Edge Cases
dependencies:
  - META.md
  - PLAN.md
version:
  created: {infer from mtime or today}
  feature: {feature directory name}
---
```

### BACKLOG.md — `.ship/BACKLOG.md`

Read the file and extract the `## Section` names to populate `toc`.

```yaml
---
toc:
  - {section name 1}
  - {section name 2}
dependencies: []
version:
  created: {infer from mtime or today}
  last_modified: {infer from mtime or today}
---
```

### Unknown file type

If a file doesn't match any pattern above, use a generic frontmatter:

```yaml
---
toc: []
dependencies: []
version:
  created: {infer from mtime or today}
---
```

## Step 8: Write Frontmatter

For each file being migrated, prepend the determined frontmatter block using the Edit tool:
- `old_string`: the first line of the file (or the very first character if the file starts with `#`)
- `new_string`: the frontmatter block followed by a blank line, then the original first line

After writing, verify the file now starts with `---`.

## Step 9: Summary

After all migrations are complete:

```
Migration complete! Added frontmatter to {N} file(s):

  .ship/auth-system/META.md
  .ship/auth-system/RESEARCH.md
  ...

All .ship/ markdown files now have frontmatter.
```

Done.
