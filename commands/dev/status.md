---
name: dev:status
description: Show status of all shipped features and continue one
allowed-tools: Read, Bash, Glob, Grep, AskUserQuestion
---

# /dev:status — Feature Status & Continue

You are executing the `/dev:status` command. Show the user their feature status and let them continue one.

## Step 1: Scan for features

1. Check if `.ship/` directory exists. If not, tell the user: "No features found. Start one with `/dev:ship <feature-name>`." and stop.

2. Find all `META.md` files in `.ship/*/META.md`.

3. Read each META.md and extract:
   - Feature name (from directory name and heading)
   - Ticket (if set)
   - Step (current state)
   - Phases progress
   - Status (in-progress or complete)

## Step 2: Display status

Show a table like this:

```
Feature          Ticket      Step                  Progress     Status
───────────────────────────────────────────────────────────────────────
auth-system      PROJ-123    phase-2:implement     1/4          in-progress
dark-mode        none        complete              3/3          complete
user-profiles    #45         research              0/?          in-progress
```

## Step 3: Offer to continue

If there are any features with status `in-progress`:

Use AskUserQuestion to ask: "Which feature do you want to continue?" with options being the in-progress feature names, plus an option for "Start a new feature".

- If they pick an in-progress feature: tell the user to run `/dev:ship {feature-name}` to resume it. Include what step it will pick up at.
- If they pick "Start a new feature": tell them to run `/dev:ship <feature-name>`.

If all features are complete (or there are none in-progress):
Tell the user: "All features are complete. Start a new one with `/dev:ship <feature-name>`."
