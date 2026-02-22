const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const CACHE_FILE = path.join(os.homedir(), '.claude', 'cache', 'dev-ship-update.json');
const CACHE_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

// --- Phase 1: Read cache and notify ---

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

const cache = readCache();

if (cache && cache.update_available) {
  console.log(
    `[dev-ship] Update available: v${cache.installed} → v${cache.latest}. Run: /plugin install dev-ship`
  );
}

// --- Phase 2: Spawn detached background refresh ---

const needsRefresh = !cache || (Date.now() - (cache.checked || 0)) > CACHE_MAX_AGE_MS;

if (needsRefresh) {
  const child = spawn(process.execPath, [path.join(__dirname, 'check-update-bg.js')], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: process.env.CLAUDE_PLUGIN_ROOT },
  });
  child.unref();
}
