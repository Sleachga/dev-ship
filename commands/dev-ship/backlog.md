---
name: dev-ship:backlog
description: Add items to your project backlog — quick capture, always accessible
argument-hint: "[item text] [--section <name>] [--done <number>] [--drop <number>]"
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
---

# /dev-ship:backlog — Quick Backlog Capture

You are executing the `/dev-ship:backlog` command. Follow these instructions precisely.

## Backlog File

The backlog lives at `.ship/BACKLOG.md` in the project root. Create `.ship/` if it doesn't exist.

### File Format

```markdown
# Backlog

## Frontend
- [ ] Add dark mode toggle (2026-02-25)
- [ ] Fix header alignment (2026-02-25)

## Backend
- [ ] Refactor auth middleware (2026-02-24)
- [x] Add rate limiting (2026-02-23)
```

Items are grouped under `## Section` headers. Each item is a markdown checkbox with the date added in parentheses. Items without a section go under `## General`. Completed items stay in place with `[x]`.

## Parse Arguments

Parse `$ARGUMENTS`:

- **`--section <name>`**: Target section for adding items. If the section doesn't exist, create it. If omitted and the file has only one section, add to that section. If multiple sections exist, ask which one.
- **`--done <number>`**: Mark item number N as done (1-indexed, counted globally across all sections).
- **`--drop <number>`**: Remove item number N entirely.
- **Any other text** (after flags): Add it as a new backlog item.
- **No arguments**: Show the current backlog interactively.

## Behavior

### Adding an Item (arguments provided, no flags)

1. Read `.ship/BACKLOG.md` if it exists, or start with `# Backlog\n\n## General\n`.
2. Determine target section:
   - If `--section <name>` provided, find or create that `## Section`.
   - If file has one section, use it.
   - If multiple sections exist, ask the user which section to add to.
3. Append under that section: `- [ ] {item text} ({today's date YYYY-MM-DD})`
4. Write the file.
5. Confirm with a brief message showing the item added, its section, and total open count.

### Marking Done (`--done N`)

1. Read `.ship/BACKLOG.md`. If it doesn't exist or item N doesn't exist, say so.
2. Number all items globally across sections (1-indexed, top to bottom). Change the Nth item's `- [ ]` to `- [x]`.
3. Write the file.
4. Confirm which item was marked done.

### Dropping (`--drop N`)

1. Read `.ship/BACKLOG.md`. If it doesn't exist or item N doesn't exist, say so.
2. Number all items globally. Remove the Nth item line entirely.
3. Write the file.
4. Confirm which item was removed.

### Interactive (no arguments)

1. Read `.ship/BACKLOG.md`. If it doesn't exist, tell the user the backlog is empty and ask what they'd like to add.
2. Display the backlog as a numbered list grouped by section with status indicators.
3. Ask the user what they'd like to do: add a new item, mark one done, drop one, or create a new section.

## Output Style

Keep output brief and terminal-friendly. Example:

```
Added to backlog [Frontend]: "Add dark mode toggle"
Backlog: 5 open, 2 done
```

When showing the list:

```
# Backlog (4 open, 1 done)

## Frontend
1. [ ] Add dark mode toggle (2026-02-25)
2. [ ] Fix header alignment (2026-02-25)

## Backend
3. [ ] Refactor auth middleware (2026-02-24)
4. [x] Add rate limiting (2026-02-23)
5. [ ] Write API docs (2026-02-25)
```
