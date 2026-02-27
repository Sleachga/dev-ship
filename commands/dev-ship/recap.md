---
name: dev-ship:recap
description: Recap untracked work — analyze git history and create .ship/ entries for the dashboard
argument-hint: "[--since <date>] [--range <commit>..<commit>]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# /dev-ship:recap — Retroactive Feature Tracking

You are executing the `/dev-ship:recap` command. This command analyzes git history, identifies work not yet tracked by dev-ship, groups it into logical features, and (with user confirmation) creates `.ship/` entries so the dashboard reflects everything.

## Step 1: Parse Arguments

Parse `$ARGUMENTS`:

- **`--since <date>`**: Git log since date. Accepts any git-compatible date string (e.g. `"2 weeks ago"`, `"2026-02-01"`). Default: `"2 weeks ago"`.
- **`--range <commit>..<commit>`**: Explicit commit range. Overrides `--since` if both provided.

## Step 2: Collect Already-Tracked Commits

Scan all existing `.ship/` feature entries to build a set of commits that are already tracked:

1. Use Glob to find all files matching `.ship/*/phase-*/SUMMARY.md`
2. Read each SUMMARY.md and extract commit hashes from `## Commit` sections
   - Look for lines like `{7-char-hash} {message}` under `## Commit` headings
   - Extract the short hash (first 7 characters)
3. Store all extracted hashes in a Set called `trackedCommits`
4. Also note existing feature directory names in `.ship/` (to avoid name collisions later)

## Step 3: Gather Recent Git Commits

Run a git log command to get recent commits:

If `--range` was provided:
```bash
git log --format='%h|%H|%s|%ai|%an' <range>
```

Otherwise:
```bash
git log --format='%h|%H|%s|%ai|%an' --since="<since-value>"
```

Parse each line into: `shortHash`, `fullHash`, `subject`, `date`, `author`.

## Step 4: Filter to Untracked

Remove any commits whose `shortHash` appears in `trackedCommits`.

- **If none remain**: Tell the user "All recent commits are already tracked by dev-ship. Nothing to recap." and stop.
- **If 50+ untracked commits remain**: Warn the user — "Found {N} untracked commits. Consider narrowing the range with `--since` or `--range` for better grouping." Use AskUserQuestion to ask whether to continue or narrow the range. If they want to narrow, stop and let them re-run with different args.

## Step 5: Get File Changes Per Commit

For each untracked commit, get the files it changed:

```bash
git diff-tree --no-commit-id --name-status -r <fullHash>
```

Parse into a list of `{status, path}` per commit (status is A/M/D/R for added/modified/deleted/renamed).

## Step 6: Read Auto-Memory (supplementary context)

Check if the project's auto-memory file exists:

1. Determine the project memory path. It follows this pattern: `~/.claude/projects/{project-path-with-dashes}/memory/MEMORY.md` where the project path replaces `/` with `-` (e.g. `/Users/foo/dev/myapp` → `-Users-foo-dev-myapp`).
2. If the file exists, read it. Use any feature descriptions, architecture notes, or completed work references as hints for grouping commits.
3. This is supplementary — git data is the primary signal.

## Step 7: Group Commits into Features

Group the untracked commits into logical features using these signals (in priority order):

1. **Commit scope prefixes**: Conventional commit scopes like `feat(auth):`, `fix(dashboard):` — commits with the same scope likely belong together.
2. **File path overlap**: Commits that touch overlapping files or directories are likely related.
3. **Temporal proximity**: Commits close in time (within a few hours) on the same topic.
4. **Memory hints**: If auto-memory mentions completed features or work areas, use those names.

For each group, determine:
- **Feature name**: kebab-case slug. Derive from commit scope, common file paths, or commit message themes. Examples: `auth-system`, `dashboard-polish`, `api-refactor`.
- **Commits**: List of commits in this group (shortHash, subject, date).
- **Files changed**: Aggregated unique files across all commits in the group.
- **Date range**: Earliest to latest commit date.

If commits don't fit neatly into groups (no conventional scopes, unrelated files), fall back to grouping by top-level directory or create a single "misc-updates" group.

## Step 8: Present to User

Display the grouped findings clearly:

```
## Recap: {N} untracked commits → {M} features

### 1. {feature-name}
   Commits: {count} ({date-range})
   {shortHash} {subject}
   {shortHash} {subject}
   Files: {file1}, {file2}, ...

### 2. {feature-name}
   ...
```

Then use AskUserQuestion with these options:
- **"Create all as shown" (Recommended)**: Create `.ship/` entries for all groups.
- **"Let me review each one"**: Step through each group individually. For each, ask: "Create this feature?", "Rename it", "Skip it", or "Merge with another group".
- **"Cancel"**: Stop without creating anything.

## Step 9: Create `.ship/` Entries

Before creating any entries:
1. If `.ship/` doesn't exist, create it.
2. Check `.gitignore` for `.ship/` — add it if missing (append `\n.ship/\n` to `.gitignore`, or create `.gitignore` if it doesn't exist).

For each confirmed feature group:

### Handle Name Collisions
If a feature directory already exists in `.ship/`:
- Append `-recap` to the name (e.g. `dashboard-polish-recap`)
- If that also exists, append a number: `dashboard-polish-recap-2`

### Create META.md

Write `.ship/{feature-name}/META.md`:
```
# {feature-name}
- **Started**: {earliest commit date, YYYY-MM-DD format}
- **Ticket**: none
- **Step**: complete
- **Phases**: 1/1 complete
- **Status**: complete
```

This format is critical — it must match the dashboard's `parseMeta()` regex:
- Heading: `# {name}`
- Fields: `**{Word}**: {value}` (bold key, colon, space, value)
- Phases: `{N}/{N} complete` format

### Create phase-1/SUMMARY.md

Write `.ship/{feature-name}/phase-1/SUMMARY.md`:
```
# Phase 1 Summary: {feature-name}

## What was done
{Synthesize 1-3 sentences from the commit messages describing what this group of work accomplished}

## Files changed
{For each unique file across all commits in the group:}
- `{path}` — {brief description based on commit messages and change status (added/modified/deleted)}

## Commit
{For each commit in the group, one per line:}
{shortHash} {subject}
```

The SUMMARY.md must live inside `phase-1/` (not the feature root) because `readFeatureDetail()` only scans `phase-N/` directories.

## Step 10: Summary Output

After creating all entries, summarize:

```
Recap complete! Created {N} feature entries:

  {feature-name-1} — {commit-count} commits ({date-range})
  {feature-name-2} — {commit-count} commits ({date-range})
  ...

These features now appear on your dashboard.
Run /dev-ship:dashboard to see them.
```

Done.
