const http = require('http');
const fs = require('fs');
const path = require('path');

const SHIP_DIR = path.join(process.cwd(), '.ship');
const PID_FILE = path.join(SHIP_DIR, '.dashboard-pid');

// --- Stale Server Cleanup ---

function killStaleServer() {
  if (!fs.existsSync(PID_FILE)) return;
  try {
    const old = JSON.parse(fs.readFileSync(PID_FILE, 'utf-8'));
    if (old.pid && old.pid !== process.pid) {
      process.kill(old.pid, 'SIGTERM');
    }
  } catch (e) {
    // Process already dead or file corrupt — either way, fine
  }
}

function writePidFile(port) {
  if (!fs.existsSync(SHIP_DIR)) fs.mkdirSync(SHIP_DIR, { recursive: true });
  fs.writeFileSync(PID_FILE, JSON.stringify({ pid: process.pid, port }) + '\n', 'utf-8');
}

function removePidFile() {
  try { fs.unlinkSync(PID_FILE); } catch (e) { /* already gone */ }
}

killStaleServer();

// --- Project Name Detection ---

function detectProjectName() {
  const cwd = process.cwd();
  // Prefer package.json name if available
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.name) return pkg.name;
    } catch (e) { /* fall through */ }
  }
  // Fall back to directory basename
  return path.basename(cwd);
}

const PROJECT_NAME = detectProjectName();

// --- META.md Parser ---

function parseMeta(content) {
  const meta = {};
  const nameMatch = content.match(/^#\s+(.+)$/m);
  if (nameMatch) meta.name = nameMatch[1].trim();

  const fields = content.matchAll(/\*\*(\w+)\*\*:\s*(.+)/g);
  for (const match of fields) {
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === 'phases') {
      const phasesMatch = value.match(/(\d+)\/(\d+|\?)/);
      if (phasesMatch) {
        meta.phasesComplete = parseInt(phasesMatch[1], 10);
        meta.phasesTotal = phasesMatch[2] === '?' ? null : parseInt(phasesMatch[2], 10);
      }
    } else {
      meta[key] = value;
    }
  }
  return meta;
}

function readFeatures() {
  if (!fs.existsSync(SHIP_DIR)) return [];

  return fs.readdirSync(SHIP_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const metaPath = path.join(SHIP_DIR, d.name, 'META.md');
      if (!fs.existsSync(metaPath)) return null;
      const content = fs.readFileSync(metaPath, 'utf-8');
      return { dir: d.name, ...parseMeta(content) };
    })
    .filter(Boolean);
}

function readFeatureDetail(name) {
  const featureDir = path.join(SHIP_DIR, name);
  if (!fs.existsSync(featureDir)) return null;

  const metaPath = path.join(featureDir, 'META.md');
  if (!fs.existsSync(metaPath)) return null;

  const meta = parseMeta(fs.readFileSync(metaPath, 'utf-8'));
  const detail = { dir: name, ...meta, phases: [] };

  // Read PLAN.md if exists
  const planPath = path.join(featureDir, 'PLAN.md');
  if (fs.existsSync(planPath)) {
    detail.plan = fs.readFileSync(planPath, 'utf-8');
  }

  // Read phase directories
  const entries = fs.readdirSync(featureDir, { withFileTypes: true });
  for (const entry of entries) {
    const phaseMatch = entry.name.match(/^phase-(\d+)$/);
    if (entry.isDirectory() && phaseMatch) {
      const phaseNum = parseInt(phaseMatch[1], 10);
      const phase = { number: phaseNum };

      const contextPath = path.join(featureDir, entry.name, 'CONTEXT.md');
      if (fs.existsSync(contextPath)) {
        phase.context = fs.readFileSync(contextPath, 'utf-8');
      }

      const summaryPath = path.join(featureDir, entry.name, 'SUMMARY.md');
      if (fs.existsSync(summaryPath)) {
        phase.summary = fs.readFileSync(summaryPath, 'utf-8');
      }

      detail.phases.push(phase);
    }
  }

  detail.phases.sort((a, b) => a.number - b.number);
  return detail;
}

// --- Settings ---

const SETTINGS_PATH = path.join(SHIP_DIR, 'SETTINGS.json');
const DEFAULT_SETTINGS = { accentColor: '#3fb950' };

function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8')) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(updates) {
  if (!fs.existsSync(SHIP_DIR)) fs.mkdirSync(SHIP_DIR, { recursive: true });
  const current = readSettings();
  const merged = { ...current, ...updates };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  return merged;
}

// --- BACKLOG.md Parser ---

function readBacklog() {
  const backlogPath = path.join(SHIP_DIR, 'BACKLOG.md');
  if (!fs.existsSync(backlogPath)) return { sections: [] };

  const content = fs.readFileSync(backlogPath, 'utf-8');
  const sections = [];
  let current = null;

  for (const line of content.split('\n')) {
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
      current = { name: sectionMatch[1].trim(), items: [] };
      sections.push(current);
      continue;
    }

    const itemMatch = line.match(/^- \[([ x])\] (.+?)(?:\s*\((\d{4}-\d{2}-\d{2})\))?$/);
    if (itemMatch) {
      if (!current) {
        current = { name: 'General', items: [] };
        sections.push(current);
      }
      current.items.push({
        done: itemMatch[1] === 'x',
        text: itemMatch[2].trim(),
        added: itemMatch[3] || null,
      });
    }
  }

  return { sections };
}

function addBacklogItem(text, sectionName) {
  const backlogPath = path.join(SHIP_DIR, 'BACKLOG.md');

  if (!fs.existsSync(SHIP_DIR)) fs.mkdirSync(SHIP_DIR, { recursive: true });

  const today = new Date().toISOString().split('T')[0];
  const newLine = '- [ ] ' + text + ' (' + today + ')';

  if (!fs.existsSync(backlogPath)) {
    const section = sectionName || 'General';
    fs.writeFileSync(backlogPath, '# Backlog\n\n## ' + section + '\n' + newLine + '\n', 'utf-8');
    return;
  }

  const lines = fs.readFileSync(backlogPath, 'utf-8').split('\n');
  let inTarget = false;
  let lastItemIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      if (inTarget) break;
      if (sectionName && lines[i] === '## ' + sectionName) {
        inTarget = true;
        lastItemIdx = i;
      }
    }
    if (inTarget && /^- \[/.test(lines[i])) {
      lastItemIdx = i;
    }
  }

  if (inTarget && lastItemIdx >= 0) {
    lines.splice(lastItemIdx + 1, 0, newLine);
  } else if (sectionName) {
    lines.push('', '## ' + sectionName, newLine);
  } else {
    // No section specified — append to the last section's items
    let lastItem = lines.length - 1;
    while (lastItem > 0 && !lines[lastItem].trim()) lastItem--;
    lines.splice(lastItem + 1, 0, newLine);
  }

  fs.writeFileSync(backlogPath, lines.join('\n'), 'utf-8');
}

// --- SSE ---

const sseClients = new Set();

function broadcastSSE(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    res.write(msg);
  }
}

// Watch .ship/ for changes
let watchDebounce = null;
function startWatching() {
  if (!fs.existsSync(SHIP_DIR)) return;

  try {
    fs.watch(SHIP_DIR, { recursive: true }, (eventType, filename) => {
      // Debounce rapid changes (editors often write multiple times)
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        broadcastSSE({ type: 'update', features: readFeatures(), backlog: readBacklog(), settings: readSettings() });
      }, 300);
    });
  } catch (err) {
    console.error('Warning: fs.watch failed, live updates disabled:', err.message);
  }
}

// Watch dashboard HTML for live reload during development
let htmlDebounce = null;
function startHtmlWatching() {
  const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
  if (!fs.existsSync(htmlPath)) return;

  try {
    fs.watch(htmlPath, () => {
      clearTimeout(htmlDebounce);
      htmlDebounce = setTimeout(() => {
        broadcastSSE({ type: 'reload' });
      }, 200);
    });
  } catch (err) {
    // Non-critical — live reload just won't work
  }
}

// --- HTTP Server ---

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');

  // SSE endpoint
  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', project: PROJECT_NAME, features: readFeatures(), backlog: readBacklog(), settings: readSettings() })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // API: list all features
  if (url.pathname === '/api/features') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readFeatures()));
    return;
  }

  // API: backlog (GET = read, POST = add item)
  if (url.pathname === '/api/backlog') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { text, section } = JSON.parse(body);
          if (!text || !text.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Text is required' }));
            return;
          }
          addBacklogItem(text.trim(), section || null);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request' }));
        }
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readBacklog()));
    return;
  }

  // API: settings (GET = read, POST = update)
  if (url.pathname === '/api/settings') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          const merged = writeSettings(updates);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(merged));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request' }));
        }
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readSettings()));
    return;
  }

  // API: feature detail
  const detailMatch = url.pathname.match(/^\/api\/features\/([^/]+)$/);
  if (detailMatch) {
    const detail = readFeatureDetail(decodeURIComponent(detailMatch[1]));
    if (!detail) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Feature not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(detail));
    return;
  }

  // Serve dashboard HTML for all non-API routes (SPA routing)
  const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(htmlPath, 'utf-8'));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start on auto-assigned port
server.listen(0, () => {
  const { port } = server.address();
  writePidFile(port);
  console.log(`Dashboard (${PROJECT_NAME}): http://localhost:${port}`);
  startWatching();
  startHtmlWatching();
});

// Graceful shutdown
function shutdown() {
  removePidFile();
  for (const res of sseClients) res.end();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
