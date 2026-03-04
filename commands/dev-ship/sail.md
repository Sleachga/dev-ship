---
name: dev-ship:sail
description: Sail through features — check status, or continue where you left off
argument-hint: "[feature-name] [--ticket <ID>]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, Task, WebSearch, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__find, mcp__claude-in-chrome__screenshot, mcp__claude-in-chrome__javascript_tool
---

# /dev-ship:sail — Feature Shipping Workflow

You are executing the `/dev-ship:sail` workflow. Follow each step precisely.

## Frontmatter Standard

**Every `.md` file you create MUST begin with a YAML frontmatter block** containing three fields:

- **`toc`**: List of top-level sections in the document (for fast scanning)
- **`dependencies`**: Relative paths to related `.ship/` files this document relies on
- **`version`**: Metadata about when the file was created and what it tracks

Use this shape:
```yaml
---
toc:
  - Section Name
dependencies:
  - ../META.md
version:
  created: YYYY-MM-DD
  feature: {FEATURE}
---
```

Omit `dependencies` entries that don't exist yet at creation time. Use `[]` if there are no dependencies.

## Frontmatter Migration

When **resuming** a feature (META.md already exists), check every existing `.ship/` file for missing frontmatter before jumping to the saved step. For each file that lacks a `---` block at the top:

1. Read the file contents.
2. Determine the correct frontmatter based on the file type (use the templates below as reference).
3. Prepend the frontmatter block to the file using the Edit tool.
4. Do this silently — no need to announce each migration to the user.

**File-type reference for migration:**

| File | toc entries | dependencies |
|------|-------------|--------------|
| `META.md` | `Status Overview` | `[]` |
| `RESEARCH.md` | `Relevant Code`, `Architecture & Conventions`, `Testing Patterns` | `META.md` |
| `PLAN.md` | `Overview`, `Research Summary`, `Phases`, `Testing Strategy` | `META.md`, `RESEARCH.md` |
| `phase-N/CONTEXT.md` | `Decisions`, `Approach` | `../../META.md`, `../../PLAN.md` |
| `phase-N/SUMMARY.md` | `What was done`, `Files changed`, `Commit` | `../../META.md`, `CONTEXT.md` |
| `DEMO-NOTES.md` | `Walkthrough` | `META.md`, `TEST-PLAN.md` |
| `TEST-PLAN.md` | `Setup`, `Test Cases`, `Edge Cases` | `META.md`, `PLAN.md` |
| `BACKLOG.md` | `General` (or actual section names) | `[]` |

For `version`, use the earliest date you can infer (commit date, file mtime via `stat`, or today's date as fallback).

## Parse Arguments

Parse `$ARGUMENTS`:
- First positional arg = feature name (optional). Slugify it (lowercase, hyphens, no special chars).
- `--ticket <ID>` = optional ticket/issue reference (e.g. `PROJ-123`, `#45`, a URL). Store for later reference in docs.

**If a feature name IS provided**: Set `FEATURE` to the slugified name and skip to "State Tracking" below.

**If NO feature name is provided**: Run the Smart Routing flow:

### Smart Routing (no arguments)

1. Check if `.ship/` directory exists. Find all `META.md` files in `.ship/*/META.md`.

2. Read each META.md and extract:
   - Feature name (from directory name and heading)
   - Ticket (if set)
   - Step (current state)
   - Phases progress
   - Status (`in-progress`, `active`, or `complete`)

3. **If no features exist at all**: Use AskUserQuestion to ask: "What feature do you want to ship?" with options: "Type a feature name" and "Show me an example". Set `FEATURE` to the slugified answer and proceed to Step 1: Init.

4. **If any non-complete features exist** (status `in-progress` or `active`): Use AskUserQuestion to ask: "What do you want to do?" with options:
   - One option per non-complete feature: "Continue {feature-name}" with description showing its current step and status (e.g. "Currently at phase-2:implement, 1/3 phases done — active")
   - "See full status" with description "View status of all features"
   - "Start something new" with description "Begin a new feature"

   Handle responses:
   - **If they pick an in-progress feature**: Set `FEATURE` to that feature name and proceed to Step 1: Init (which will detect META.md and enter resume mode).
   - **If they pick "See full status"**: Display the status table (see format below), then use AskUserQuestion again to ask "What next?" with the same options as above (minus "See full status"). Handle their response the same way.
   - **If they pick "Start something new"**: Use AskUserQuestion to ask for the feature name. Set `FEATURE` to the slugified answer and proceed to Step 1: Init.

5. **If all features are complete** (none `in-progress` or `active`): Display the status table, then use AskUserQuestion to ask: "All features are complete. What's next?" with options: "Start something new" (ask for feature name) and "I'm done for now" (stop).

**Status table format:**
```
Feature          Ticket      Step                  Progress     Status
───────────────────────────────────────────────────────────────────────
auth-system      PROJ-123    phase-2:implement     1/4          in-progress
dark-mode        none        complete              3/3          complete
```

After Smart Routing resolves, set these variables for the rest of the workflow:
- `FEATURE` = slugified feature name
- `TICKET` = ticket ID if provided, empty string otherwise
- `SHIP_DIR` = `.ship/{FEATURE}`

## State Tracking

All progress is tracked in `.ship/{FEATURE}/META.md`. The `step` field records exactly where we are. Valid states:

- `research` — Running parallel research agents
- `plan` — Writing the plan
- `phase-N:context` — Gathering context for phase N
- `phase-N:implement` — Implementing phase N (TDD)
- `phase-N:summarize` — Writing phase N summary
- `demo` — Browser demo step
- `test-plan` — Writing manual test plan
- `complete` — All done

**Update META.md's `step` field at the START of each sub-step, BEFORE doing the work.** This way, if we crash or the user clears context, we know exactly where to resume.

## Step 1: Init

1. Check if `.ship/{FEATURE}/META.md` exists:
   - **If yes**: Resume mode. Read META.md, extract the `step` field. Run the **Frontmatter Migration** procedure (see above) on all existing files in `.ship/{FEATURE}/`. **Demote other in-progress features** (see below). Then jump directly to the saved step. Announce: "Resuming **{FEATURE}** at: {step description}."
   - **If no**: **Demote other in-progress features** (see below). Continue with fresh init below.

**Demote other in-progress features**: Before setting `{FEATURE}` to `in-progress`, scan all `.ship/*/META.md` files (excluding `.ship/{FEATURE}/META.md`). For any file that contains `**Status**: in-progress`, use the Edit tool to change that line to `**Status**: active`. Only one feature should be `in-progress` at a time.

2. Create the directory: `.ship/{FEATURE}/`

3. Add `.ship/` to `.gitignore` if not already there (check first, append if missing).

4. Write `.ship/{FEATURE}/META.md`:
   ```
   ---
   toc:
     - Status Overview
   dependencies: []
   version:
     created: {current date}
     last_modified: {current date}
   ---
   # {FEATURE}
   - **Started**: {current date}
   - **Ticket**: {TICKET or "none"}
   - **Step**: research
   - **Phases**: 0/? complete
   - **Status**: in-progress
   ```

5. **Launch the live dashboard**: Start the dashboard server in the background and open it in the browser so the user can watch progress in real-time. Use this exact sequence:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/dashboard-server.js" > /tmp/dev-ship-dashboard.log 2>&1 &
   ```
   Then wait briefly and read the port from the log:
   ```bash
   sleep 1 && grep -o 'http://localhost:[0-9]*' /tmp/dev-ship-dashboard.log
   ```
   Finally, open the URL in the default browser:
   - macOS: `open http://localhost:{PORT}`
   - Linux: `xdg-open http://localhost:{PORT}`

   If the port isn't found in the log after 2 seconds, warn the user and continue without the dashboard.

6. Tell the user: "Initialized `.ship/{FEATURE}/`. Dashboard is live. Next up: researching the codebase with parallel agents."

## Step 2: Research (Parallel, Cheap Model)

**Update META.md step to `research`** (if not already).

Spawn 2-3 Explore agents **in parallel** using `model: "haiku"` to research the codebase:

- **Agent 1 — Relevant Code**: "Find all files, functions, types, and patterns directly relevant to implementing '{FEATURE}'. List file paths with brief descriptions of what's relevant."
- **Agent 2 — Architecture & Conventions**: "Understand the architecture, coding conventions, and patterns in the areas of the codebase that '{FEATURE}' would touch. Note file organization, naming conventions, state management, event patterns, and any CLAUDE.md or project rules."
- **Agent 3 — Tests & Patterns**: "Find existing tests related to the areas '{FEATURE}' would affect. Document testing patterns used (frameworks, assertion styles, mocking approaches, file naming). Include example test structures."

Give each agent enough context about the feature from the user's description.

After all agents complete, combine their findings into `.ship/{FEATURE}/RESEARCH.md`:
```
---
toc:
  - Relevant Code
  - Architecture & Conventions
  - Testing Patterns
dependencies:
  - META.md
version:
  created: {current date}
  feature: {FEATURE}
---
# Research: {FEATURE}
{ticket line if TICKET is set}

## Relevant Code
{Agent 1 findings}

## Architecture & Conventions
{Agent 2 findings}

## Testing Patterns
{Agent 3 findings}
```

**Update META.md step to `plan`.**

Tell the user: "Research complete — findings written to RESEARCH.md. Next up: I'll ask some clarifying questions and then draft a plan.

> Your context is safe. You can `/clear` now and run `/dev-ship:sail {FEATURE}` — I'll resume right where we left off."

## Step 3: Plan

**Update META.md step to `plan`** (if not already).

1. Read `.ship/{FEATURE}/RESEARCH.md`
2. Use AskUserQuestion to ask clarifying questions about:
   - Scope boundaries (what's in, what's out)
   - User preferences for approach
   - Any constraints or requirements not yet captured
3. Break the work into **2-5 phases**, each independently committable
4. Write `.ship/{FEATURE}/PLAN.md`:

```
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
  created: {current date}
  feature: {FEATURE}
  phase_count: {total number of phases}
---
# Plan: {FEATURE}
{ticket line if TICKET is set}

## Overview
{What and why, 2-3 sentences}

## Research Summary
{Key findings that inform the approach}

## Phases

### Phase 1: {name}
- **Objective**: {what this phase achieves}
- **Key files**: {files to create/modify}
- **Success criteria**: {how we know it's done}

### Phase 2: {name}
...

## Testing Strategy
{Overall approach to testing this feature}
```

5. Present the plan to the user. Use AskUserQuestion: "Does this plan look good? Any changes before I start Phase 1?"
6. Wait for approval before proceeding.

**Update META.md: step to `phase-1:context`, phases to `0/{total} complete`** (now that we know the total from the plan).

Tell the user: "Plan approved. Starting Phase 1 next.

> Good time to `/clear`. Run `/dev-ship:sail {FEATURE}` to continue — the plan is saved and I'll pick up at Phase 1."

## Step 4: Phase Loop

For each phase in PLAN.md:

### 4a. Context Gathering

**Update META.md step to `phase-{N}:context`.**

1. Announce: "**Phase {N}: {phase name}** — gathering context."
2. Use AskUserQuestion to ask 2-5 clarifying questions specific to this phase's implementation details
3. Create `.ship/{FEATURE}/phase-{N}/` directory
4. Write `.ship/{FEATURE}/phase-{N}/CONTEXT.md`:
   ```
   ---
   toc:
     - Decisions
     - Approach
   dependencies:
     - ../../META.md
     - ../../PLAN.md
   version:
     created: {current date}
     feature: {FEATURE}
     phase: {N}
   ---
   # Phase {N}: {name}
   {ticket line if TICKET is set}

   ## Decisions
   {Q&A from clarifying questions}

   ## Approach
   {Brief description of implementation approach based on answers}
   ```

**Update META.md step to `phase-{N}:implement`.**

Tell the user: "Context saved to `phase-{N}/CONTEXT.md`. Next up: writing tests and implementing.

> You can `/clear` now. Run `/dev-ship:sail {FEATURE}` — I'll resume at phase {N} implementation with a fresh context window."

### 4b. Implement (TDD)

**Update META.md step to `phase-{N}:implement`** (if not already).

1. If resuming after a clear, read `.ship/{FEATURE}/PLAN.md` and `.ship/{FEATURE}/phase-{N}/CONTEXT.md` to restore context
2. **Write failing tests first** based on the phase's success criteria
3. Run tests to confirm they fail (red)
4. Implement the feature code until tests pass (green)
5. Refactor if needed
6. Run the full test suite and typecheck to ensure nothing is broken
7. Commit with a descriptive message: `feat({FEATURE}): {phase description}`
   - If TICKET is set, include it: `feat({FEATURE}): {phase description} [{TICKET}]`

**Update META.md step to `phase-{N}:summarize`.**

### 4c. Summarize

**Update META.md step to `phase-{N}:summarize`** (if not already).

Write `.ship/{FEATURE}/phase-{N}/SUMMARY.md`:
```
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
  created: {current date}
  feature: {FEATURE}
  phase: {N}
  commit: {commit hash}
---
# Phase {N} Summary: {name}

## What was done
{1-2 sentences}

## Files changed
{list of files with brief change descriptions}

## Tests
{tests added or modified}

## Commit
{commit hash and message}
```

If there are more phases:
- **Update META.md: step to `phase-{N+1}:context`, phases to `{N}/{total} complete`.**
- Tell the user: "Phase {N} complete! {N}/{total} phases done. Next up: Phase {N+1} — {next phase name}.

> `/clear` recommended. Run `/dev-ship:sail {FEATURE}` to start Phase {N+1} with a fresh context."
- Wait for acknowledgment, then go back to 4a.

If all phases are done:
- **Update META.md: step to `demo`, phases to `{total}/{total} complete`.**
- Tell the user: "All {total} phases complete! Next up: browser demo (optional).

> `/clear` recommended before the demo. Run `/dev-ship:sail {FEATURE}` to continue."

## Step 5: Browser Demo

**Update META.md step to `demo`.**

1. Ask: "Ready for a browser demo? I'll start the dev server and walk through the feature. Or we can skip to the manual test plan."
2. If user agrees:
   - Start the dev server if not running (`npm run dev` or equivalent — check package.json)
   - Use Chrome automation MCP tools to open the app
   - Walk through the feature, narrating each step
   - Take screenshots of key states
   - Write `.ship/{FEATURE}/DEMO-NOTES.md` with the walkthrough, using this template:
     ```
     ---
     toc:
       - Walkthrough
     dependencies:
       - META.md
       - TEST-PLAN.md
     version:
       created: {current date}
       feature: {FEATURE}
     ---
     # Demo Notes: {FEATURE}
     ## Walkthrough
     {narrated steps and screenshots}
     ```
3. If user declines, skip to Step 6.

**Update META.md step to `test-plan`.**

Tell the user: "Demo done. Last step: writing the manual test plan.

> `/clear` recommended. Run `/dev-ship:sail {FEATURE}` to finish up with the test plan."

## Step 6: Manual Test Plan

**Update META.md step to `test-plan`.**

Write `.ship/{FEATURE}/TEST-PLAN.md`:
```
---
toc:
  - Setup
  - Test Cases
  - Edge Cases
dependencies:
  - META.md
  - PLAN.md
version:
  created: {current date}
  feature: {FEATURE}
---
# Manual Test Plan: {FEATURE}
{ticket line if TICKET is set}

## Setup
{Any setup steps needed}

## Test Cases

### 1. {test case name}
- **Steps**: {numbered steps}
- **Expected**: {expected outcome}

### 2. {test case name}
...

## Edge Cases
{edge cases to verify}
```

**Update META.md step to `complete` and status to `complete`.**

Tell the user: "Feature **{FEATURE}** is shipped! Here's what was created:
- `RESEARCH.md` — codebase research findings
- `PLAN.md` — phase breakdown
- `phase-*/CONTEXT.md` — decisions per phase
- `phase-*/SUMMARY.md` — what was built per phase
- `TEST-PLAN.md` — manual testing checklist
{- `DEMO-NOTES.md` — browser demo walkthrough (if demo was done)}

Run through `TEST-PLAN.md` to verify everything works."

Done.
