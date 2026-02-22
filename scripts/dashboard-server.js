const http = require('http');
const fs = require('fs');
const path = require('path');

const SHIP_DIR = path.join(process.cwd(), '.ship');

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
        broadcastSSE({ type: 'update', features: readFeatures() });
      }, 300);
    });
  } catch (err) {
    console.error('Warning: fs.watch failed, live updates disabled:', err.message);
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
    res.write(`data: ${JSON.stringify({ type: 'connected', features: readFeatures() })}\n\n`);
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

  // Serve dashboard HTML
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(htmlPath, 'utf-8'));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>Dashboard coming soon</h1><p>Phase 2 will build the frontend.</p></body></html>');
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start on auto-assigned port
server.listen(0, () => {
  const { port } = server.address();
  console.log(`Dashboard: http://localhost:${port}`);
  startWatching();
});

// Graceful shutdown
process.on('SIGINT', () => {
  for (const res of sseClients) res.end();
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  for (const res of sseClients) res.end();
  server.close(() => process.exit(0));
});
