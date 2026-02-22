---
name: dev:ship
description: Ship features, check status, or continue where you left off
argument-hint: "[feature-name] [--ticket <ID>]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, Task, WebSearch, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__find, mcp__claude-in-chrome__screenshot, mcp__claude-in-chrome__javascript_tool
---

# /dev:ship — Feature Shipping Workflow

You are executing the `/dev:ship` workflow. Follow each step precisely.

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
   - Status (in-progress or complete)

3. **If no features exist at all**: Use AskUserQuestion to ask: "What feature do you want to ship?" with options: "Type a feature name" and "Show me an example". Set `FEATURE` to the slugified answer and proceed to Step 1: Init.

4. **If in-progress features exist**: Use AskUserQuestion to ask: "What do you want to do?" with options:
   - One option per in-progress feature: "Continue {feature-name}" with description showing its current step (e.g. "Currently at phase-2:implement, 1/3 phases done")
   - "See full status" with description "View status of all features"
   - "Start something new" with description "Begin a new feature"

   Handle responses:
   - **If they pick an in-progress feature**: Set `FEATURE` to that feature name and proceed to Step 1: Init (which will detect META.md and enter resume mode).
   - **If they pick "See full status"**: Display the status table (see format below), then use AskUserQuestion again to ask "What next?" with the same options as above (minus "See full status"). Handle their response the same way.
   - **If they pick "Start something new"**: Use AskUserQuestion to ask for the feature name. Set `FEATURE` to the slugified answer and proceed to Step 1: Init.

5. **If all features are complete** (none in-progress): Display the status table, then use AskUserQuestion to ask: "All features are complete. What's next?" with options: "Start something new" (ask for feature name) and "I'm done for now" (stop).

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
   - **If yes**: Resume mode. Read META.md, extract the `step` field, and jump directly to that step. Announce: "Resuming **{FEATURE}** at: {step description}."
   - **If no**: Continue with fresh init below.

2. Create the directory: `.ship/{FEATURE}/`

3. Add `.ship/` to `.gitignore` if not already there (check first, append if missing).

4. Write `.ship/{FEATURE}/META.md`:
   ```
   # {FEATURE}
   - **Started**: {current date}
   - **Ticket**: {TICKET or "none"}
   - **Step**: research
   - **Phases**: 0/? complete
   - **Status**: in-progress
   ```

5. Tell the user: "Initialized `.ship/{FEATURE}/`. Next up: researching the codebase with parallel agents."

## Step 2: Research (Parallel, Cheap Model)

**Update META.md step to `research`** (if not already).

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

**Update META.md step to `plan`.**

Tell the user: "Research complete — findings written to RESEARCH.md. Next up: I'll ask some clarifying questions and then draft a plan."

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

Tell the user: "Plan approved. Next up: I'll ask a few implementation questions for Phase 1, then start coding."

## Step 4: Phase Loop

For each phase in PLAN.md:

### 4a. Context Gathering

**Update META.md step to `phase-{N}:context`.**

1. Announce: "**Phase {N}: {phase name}** — gathering context."
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

**Update META.md step to `phase-{N}:implement`.**

Tell the user: "Context saved to `phase-{N}/CONTEXT.md`. Next up: writing tests and implementing. If your context window is getting large, you can `/clear` and run `/dev:ship {FEATURE}` to resume — I'll pick up right here."

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
- Tell the user: "Phase {N} complete! {N}/{total} phases done. Next up: Phase {N+1} — {next phase name}. Ready to continue?"
- Wait for acknowledgment, then go back to 4a.

If all phases are done:
- **Update META.md: step to `demo`, phases to `{total}/{total} complete`.**
- Tell the user: "All {total} phases complete! Next up: browser demo (optional)."

## Step 5: Browser Demo

**Update META.md step to `demo`.**

1. Ask: "Ready for a browser demo? I'll start the dev server and walk through the feature. Or we can skip to the manual test plan."
2. If user agrees:
   - Start the dev server if not running (`npm run dev` or equivalent — check package.json)
   - Use Chrome automation MCP tools to open the app
   - Walk through the feature, narrating each step
   - Take screenshots of key states
   - Write `.ship/{FEATURE}/DEMO-NOTES.md` with the walkthrough
3. If user declines, skip to Step 6.

**Update META.md step to `test-plan`.**

Tell the user: "Demo done. Last step: writing the manual test plan."

## Step 6: Manual Test Plan

**Update META.md step to `test-plan`.**

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
