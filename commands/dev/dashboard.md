---
name: dev:dashboard
description: Open the live feature dashboard in your browser
allowed-tools: Bash, Read, Glob, AskUserQuestion
---

# /dev:dashboard — Live Dashboard

You are executing the `/dev:dashboard` command. Start the dashboard server and open it in the browser.

## Steps

1. Check if `.ship/` directory exists. If not, tell the user: "No `.ship/` directory found. Start a feature with `/dev:ship` first." and stop.

2. Start the dashboard server in the background:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/dashboard-server.js" &
   ```
   Capture the port from the server output (it prints `Dashboard: http://localhost:{PORT}`).

3. Open the dashboard in the default browser:
   - macOS: `open http://localhost:{PORT}`
   - Linux: `xdg-open http://localhost:{PORT}`
   - Windows: `start http://localhost:{PORT}`

4. Tell the user: "Dashboard is live at http://localhost:{PORT} — it updates in real-time as features progress. The server runs in the background. To stop it, close the terminal or kill the process."
