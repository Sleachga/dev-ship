---
name: dev:dashboard
description: Open the live feature dashboard in your browser
allowed-tools: Bash, Read, Glob, AskUserQuestion
---

# /dev:dashboard — Live Dashboard

You are executing the `/dev:dashboard` command. Start the dashboard server and open it in the browser.

## Steps

1. Check if `.ship/` directory exists. If not, tell the user: "No `.ship/` directory found. Start a feature with `/dev:sail` first." and stop.

2. Start the dashboard server in the background, writing output to a log file:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/dashboard-server.js" > /tmp/dev-ship-dashboard.log 2>&1 &
   ```

3. Wait briefly, then read the port from the log:
   ```bash
   sleep 1 && grep -o 'http://localhost:[0-9]*' /tmp/dev-ship-dashboard.log
   ```
   If no port is found, wait one more second and try again. If still not found, warn the user and stop.

4. Open the dashboard in the default browser:
   - macOS: `open http://localhost:{PORT}`
   - Linux: `xdg-open http://localhost:{PORT}`

5. Tell the user: "Dashboard is live at http://localhost:{PORT} — it updates in real-time as features progress. The server runs in the background. To stop it, close the terminal or kill the process."
