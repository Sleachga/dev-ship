<p align="center">
  <img src="logo.png" alt="dev-ship logo" width="300">
</p>

# dev-ship

**All Aboard the Dev Ship**

A structured, resumable, zero-dependency feature-shipping workflow for [Claude Code](https://claude.ai/claude-code). Plan, implement, demo, and test features in phases.

## Highlights

- **Phased workflow** — Research, plan, implement, demo, and test in structured steps
- **Resume anywhere** — All state saved to `.ship/` so you can `/clear` and pick up where you left off
- **Parallel research** — Multiple agents explore your codebase simultaneously using cheap Haiku models
- **Live dashboard** — Real-time web UI with dark terminal aesthetic, auto-detects your project name
- **Zero dependencies** — Native Node.js only, nothing to install beyond the plugin
- **Cross-platform** — Windows, macOS, and Linux support (notifications, file paths)
- **Auto-update** — Notifies you at session start when a newer version is available

## Install

Add the marketplace and install the plugin:

```
/plugin marketplace add Sleachga/dev-ship
/plugin install dev-ship
```

## Usage

In Claude Code:

```
/dev:sail                                # Smart routing: see status, continue, or start new
/dev:sail auth-system                    # Start or resume a specific feature
/dev:sail auth-system --ticket PROJ-123  # Start with a ticket reference
/dev:dashboard                           # Open the live dashboard in your browser
/dev:uninstall                           # Clean up project data or fully remove the plugin
```

When called with no arguments, `/dev:sail` checks for existing features and offers to continue in-progress work, show status, or start something new.

## How it works

1. **Research** — Parallel agents explore your codebase using cheap Haiku models to save context
2. **Plan** — Break work into 2-5 committable phases with clarifying questions
3. **Implement** — TDD phase loop: context gathering, failing tests, implementation, commit
4. **Demo** — Browser walkthrough with screenshots via Chrome automation
5. **Test** — Manual test plan with numbered checklists

Each step writes docs to `.ship/` in your project. If you hit a context limit, just `/clear` and run `/dev:sail` — it reads the saved state and resumes from where you left off.

## Live dashboard

The dashboard auto-opens when you start a feature with `/dev:sail`. It shows real-time feature progress with a dark terminal aesthetic — chevron-style phase tracker, step indicators, decision logs, and files changed. The phase tracker auto-scrolls to keep the active phase in view. Your project name is auto-detected and shown in the header and browser tab.

You can also open it manually anytime with `/dev:dashboard`.

## What's included

| Component | Purpose |
|-----------|---------|
| `/dev:sail` command | Sail through features — check status, or continue where you left off |
| `/dev:dashboard` command | Open the live feature dashboard in your browser |
| `/dev:uninstall` command | Clean up `.ship/` project data or fully remove the plugin |
| Live dashboard | Dark terminal-aesthetic web UI with real-time updates via SSE |
| SessionStart hook | Checks for newer plugin versions and notifies you |
| Stop hook | Notification sound when Claude needs your input |
| Cross-platform notify | Windows, macOS, and Linux system sounds |

## Project files

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
/dev:uninstall
```

This gives you two options: remove just the `.ship/` project data, or fully uninstall the plugin from Claude Code.

## License

MIT
