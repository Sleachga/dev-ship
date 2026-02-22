# dev-ship

A lean feature-shipping workflow for [Claude Code](https://claude.ai/claude-code). Plan, implement, demo, and test features in phases.

## What it does

`/dev-ship:ship` gives you a structured workflow for shipping features:

1. **Research** — Parallel agents explore your codebase (using cheap models to save context)
2. **Plan** — Break work into 2-5 committable phases with clarifying questions
3. **Implement** — TDD phase loop: context gathering, failing tests, implementation, commit
4. **Demo** — Browser walkthrough with screenshots via Chrome automation
5. **Test** — Manual test plan with numbered checklists

Each step writes docs to `.ship/` in your project so you can resume across context windows.

## Install

Add the marketplace and install the plugin:

```
/plugin marketplace add Sleachga/dev-ship
/plugin install dev-ship
```

## Usage

In Claude Code:

```
/dev-ship:ship                                # Smart routing: see status, continue, or start new
/dev-ship:ship auth-system                    # Start or resume a specific feature
/dev-ship:ship auth-system --ticket PROJ-123  # Start with a ticket reference
```

When called with no arguments, `/dev-ship:ship` checks for existing features and offers to continue in-progress work, show status, or start something new.

## What's included

| Component | Purpose |
|-----------|---------|
| `/dev-ship:ship` command | Ship features, check status, or continue where you left off |
| Stop hook | Notification sound when Claude needs your input |
| Cross-platform notify | Windows, macOS, and Linux system sounds |

## Project docs

Each feature creates a `.ship/` directory in your project:

```
.ship/
  auth-system/
    META.md              # Feature metadata, ticket ref, status
    RESEARCH.md          # Parallel research findings
    PLAN.md              # Phases, objectives, success criteria
    phase-1/
      CONTEXT.md         # Clarifying Q&A, decisions
      SUMMARY.md         # What was done, files changed, commit
    phase-2/
      ...
    TEST-PLAN.md         # Manual testing checklist
    DEMO-NOTES.md        # Browser demo walkthrough
```

`.ship/` is automatically added to `.gitignore`.

## Uninstall

```
/plugin uninstall dev-ship
```

## License

MIT
