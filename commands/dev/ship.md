---
name: dev:ship
description: Plan, implement, demo, and test a feature in phases
argument-hint: "<feature-name> [--ticket <ID>]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, Task, WebSearch, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__find, mcp__claude-in-chrome__screenshot, mcp__claude-in-chrome__javascript_tool
---

# /dev:ship — Feature Shipping Workflow

You are executing the `/dev:ship` workflow. Follow each step precisely.

## Parse Arguments

Parse `$ARGUMENTS`:
- First positional arg = feature name (required). Slugify it (lowercase, hyphens, no special chars).
- `--ticket <ID>` = optional ticket/issue reference (e.g. `PROJ-123`, `#45`, a URL). Store for later reference in docs.
- If no feature name provided, use AskUserQuestion to ask for one.

Set these variables for the rest of the workflow:
- `FEATURE` = slugified feature name
- `TICKET` = ticket ID if provided, empty string otherwise
- `SHIP_DIR` = `.ship/{FEATURE}`

## Step 1: Init

1. Check if `.ship/{FEATURE}/PLAN.md` exists:
   - **If yes**: Resume mode. Find the first phase directory without a `SUMMARY.md`. Announce "Resuming {FEATURE} at phase N" and skip to Step 4 for that phase.
   - **If no**: Continue with fresh init.

2. Create the directory: `.ship/{FEATURE}/`

3. Add `.ship/` to `.gitignore` if not already there (check first, append if missing).

4. Write `.ship/{FEATURE}/META.md`:
   ```
   # {FEATURE}
   - **Started**: {current date}
   - **Ticket**: {TICKET or "none"}
   - **Status**: in-progress
   ```

## Step 2: Research (Parallel, Cheap Model)

Spawn 2-3 Explore agents **in parallel** using `model: "haiku"` to research the codebase:

- **Agent 1 — Relevant Code**: "Find all files, functions, types, and patterns directly relevant to implementing '{FEATURE}'. List file paths with brief descriptions of what's relevant."
- **Agent 2 — Architecture & Conventions**: "Understand the architecture, coding conventions, and patterns in the areas of the codebase that '{FEATURE}' would touch. Note file organization, naming conventions, state management, event patterns, and any CLAUDE.md or project rules."
- **Agent 3 — Tests & Patterns**: "Find existing tests related to the areas '{FEATURE}' would affect. Document testing patterns used (frameworks, assertion styles, mocking approaches, file naming). Include example test structures."

Give each agent enough context about the feature from the user's description.

After all agents complete, combine their findings into `.ship/{FEATURE}/RESEARCH.md`:
```
# Research: {FEATURE}
{ticket line if TICKET is set}

## Relevant Code
{Agent 1 findings}

## Architecture & Conventions
{Agent 2 findings}

## Testing Patterns
{Agent 3 findings}
```

## Step 3: Plan

1. Read `.ship/{FEATURE}/RESEARCH.md`
2. Use AskUserQuestion to ask clarifying questions about:
   - Scope boundaries (what's in, what's out)
   - User preferences for approach
   - Any constraints or requirements not yet captured
3. Break the work into **2-5 phases**, each independently committable
4. Write `.ship/{FEATURE}/PLAN.md`:

```
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

## Step 4: Phase Loop

For each phase in PLAN.md:

### 4a. Context Gathering

1. Announce: "Starting Phase {N}: {phase name}"
2. Use AskUserQuestion to ask 2-5 clarifying questions specific to this phase's implementation details
3. Create `.ship/{FEATURE}/phase-{N}/` directory
4. Write `.ship/{FEATURE}/phase-{N}/CONTEXT.md`:
   ```
   # Phase {N}: {name}
   {ticket line if TICKET is set}

   ## Decisions
   {Q&A from clarifying questions}

   ## Approach
   {Brief description of implementation approach based on answers}
   ```
5. Suggest: "Context is saved. If your context window is getting large, you can `/clear` and run `/dev:ship {FEATURE}` to resume — I'll pick up from this phase."

### 4b. Implement (TDD)

1. If resuming after a clear, read `.ship/{FEATURE}/PLAN.md` and `.ship/{FEATURE}/phase-{N}/CONTEXT.md` to restore context
2. **Write failing tests first** based on the phase's success criteria
3. Run tests to confirm they fail (red)
4. Implement the feature code until tests pass (green)
5. Refactor if needed
6. Run the full test suite and typecheck to ensure nothing is broken
7. Commit with a descriptive message: `feat({FEATURE}): {phase description}`
   - If TICKET is set, include it: `feat({FEATURE}): {phase description} [{TICKET}]`

### 4c. Summarize

Write `.ship/{FEATURE}/phase-{N}/SUMMARY.md`:
```
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

Then proceed to the next phase (back to 4a), or if all phases are done, continue to Step 5.

## Step 5: Browser Demo

1. Ask: "Ready for a browser demo? I'll start the dev server and walk through the feature."
2. If user agrees:
   - Start the dev server if not running (`npm run dev` or equivalent — check package.json)
   - Use Chrome automation MCP tools to open the app
   - Walk through the feature, narrating each step
   - Take screenshots of key states
   - Write `.ship/{FEATURE}/DEMO-NOTES.md` with the walkthrough
3. If user declines, skip to Step 6.

## Step 6: Manual Test Plan

Write `.ship/{FEATURE}/TEST-PLAN.md`:
```
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

Announce: "Feature '{FEATURE}' is shipped! TEST-PLAN.md is ready for manual verification."

Update `.ship/{FEATURE}/META.md` status to "complete".

Done.
