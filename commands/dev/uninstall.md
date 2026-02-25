---
name: dev:uninstall
description: Clean up .ship/ data or fully uninstall the dev-ship plugin
allowed-tools: Read, Bash, AskUserQuestion, Glob
---

# /dev:uninstall — Cleanup & Uninstall

You are executing the `/dev:uninstall` command.

## Step 1: Ask what to remove

Use AskUserQuestion to ask: "What do you want to clean up?" with these options:

- **"Project cleanup"** — description: "Remove the `.ship/` directory from this project. The plugin stays installed."
- **"Full uninstall"** — description: "Remove `.ship/`, uninstall the plugin from settings, and clear the cache. Complete removal."

## Step 2a: Project Cleanup

If the user chose "Project cleanup":

1. Check if `.ship/` exists in the current directory.
   - If it doesn't exist, tell the user: "No `.ship/` directory found in this project. Nothing to clean up."
   - If it exists, list the features inside it (each subdirectory).

2. Use AskUserQuestion to confirm: "This will delete `.ship/` and all feature tracking data ({N} features). Are you sure?" with options:
   - "Yes, delete it"
   - "No, cancel"

3. If confirmed, run: `rm -rf .ship/`

4. Check if `.gitignore` has a `.ship/` entry. If so, ask: "Remove `.ship/` from `.gitignore` too?" with options "Yes" and "No". If yes, remove the line.

5. Tell the user: "Project cleaned up. The dev-ship plugin is still installed — you can start fresh with `/dev:sail` anytime."

## Step 2b: Full Uninstall

If the user chose "Full uninstall":

1. Use AskUserQuestion to confirm: "This will completely remove dev-ship: delete `.ship/` from this project, remove the plugin from your settings, and clear the cache. Are you sure?" with options:
   - "Yes, fully uninstall"
   - "No, cancel"

2. If confirmed, do the following in order:

   a. Remove `.ship/` from the current project if it exists:
      ```bash
      rm -rf .ship/
      ```

   b. Remove the `.ship/` entry from `.gitignore` if present.

   c. Remove the plugin cache:
      ```bash
      rm -rf ~/.claude/plugins/cache/dev-ship/
      ```

   d. Remove the marketplace clone:
      ```bash
      rm -rf ~/.claude/plugins/marketplaces/dev-ship/
      ```

   e. Read `~/.claude/plugins/installed_plugins.json`, remove the `"dev-ship@dev-ship"` entry, and write the file back.

   f. Read `~/.claude/plugins/known_marketplaces.json`, remove the `"dev-ship"` entry, and write the file back.

   g. Read `~/.claude/settings.json`, remove `"dev-ship@dev-ship"` from `enabledPlugins`, and write the file back.

3. Tell the user: "dev-ship has been fully uninstalled. To reinstall later: `/plugin marketplace add Sleachga/dev-ship` then `/plugin install dev-ship`."

Done.
