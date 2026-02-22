const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const CACHE_DIR = path.join(os.homedir(), '.claude', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'dev-ship-update.json');
const GITHUB_URL = 'https://raw.githubusercontent.com/Sleachga/dev-ship/main/.claude-plugin/marketplace.json';
const TIMEOUT_MS = 10000;

function getInstalledVersion() {
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
  if (!pluginRoot) return null;

  const marketplacePath = path.join(pluginRoot, '.claude-plugin', 'marketplace.json');
  try {
    const data = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8'));
    return data.plugins?.[0]?.version || null;
  } catch {
    return null;
  }
}

function isNewer(latest, installed) {
  const l = latest.split('.').map(Number);
  const i = installed.split('.').map(Number);
  for (let n = 0; n < 3; n++) {
    if ((l[n] || 0) > (i[n] || 0)) return true;
    if ((l[n] || 0) < (i[n] || 0)) return false;
  }
  return false;
}

function fetchLatestVersion() {
  return new Promise((resolve, reject) => {
    const req = https.get(GITHUB_URL, { timeout: TIMEOUT_MS }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data.plugins?.[0]?.version || null);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function main() {
  const installed = getInstalledVersion();
  if (!installed) return;

  const latest = await fetchLatestVersion();
  if (!latest) return;

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({
    update_available: isNewer(latest, installed),
    installed,
    latest,
    checked: Date.now(),
  }));
}

main().catch(() => {
  // Silent failure — don't disrupt anything
});
