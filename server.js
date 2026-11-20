// Futsal scoreboard server. No npm install needed: run `node server.js`.
// Controller: http://localhost:3400/futsalcontrol.html
// OBS browser source (1920x1080): http://localhost:3400/futsaldisplay.html
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3400;
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css' };
let state = null;            // the current match, kept in memory
// The clock lives here, timed by this machine, so every page shows the same time
// whatever device is controlling. elapsed = base + (running ? now - since : 0)
let clock = { running: false, base: 0, since: 0 };
const clients = new Set();   // open display/controller pages (Server-Sent Events)

const elapsed = () => clock.base + (clock.running ? Date.now() - clock.since : 0);
const payload = () => JSON.stringify(state && { ...state, clock, now: Date.now() });
const broadcast = () => { const msg = `data: ${payload()}\n\n`; clients.forEach(c => c.write(msg)); };

function readJson(req, cb) {
  let body = '';
  req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on('end', () => { try { cb(null, JSON.parse(body)); } catch (e) { cb(e); } });
}
const ok = res => res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
const bad = (res, e) => res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: e.message }));

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(payload());
  }

  if (url === '/state' && req.method === 'POST') {
    return readJson(req, (err, m) => {
      if (err || !m || !Array.isArray(m.teams) || !Array.isArray(m.score)) return bad(res, err || new Error('not a futsal match'));
      delete m.clock; delete m.now;   // the clock is only changed through /clock
      state = m; broadcast(); ok(res);
    });
  }

  // { action: 'start' | 'pause' | 'set', ms }   set = put the clock at ms elapsed (keeps running/paused)
  if (url === '/clock' && req.method === 'POST') {
    return readJson(req, (err, c) => {
      if (err || !c) return bad(res, err || new Error('no body'));
      const now = Date.now();
      if (c.action === 'start' && !clock.running) clock = { running: true, base: clock.base, since: now };
      else if (c.action === 'pause' && clock.running) clock = { running: false, base: elapsed(), since: 0 };
      else if (c.action === 'set') clock = { running: clock.running, base: Math.max(0, +c.ms || 0), since: now };
      broadcast(); ok(res);
    });
  }

  if (url === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(`retry: 2000\ndata: ${payload()}\n\n`);
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 25000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  const file = path.join(__dirname, path.normalize(decodeURIComponent(url === '/' ? '/futsalcontrol.html' : url)).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(__dirname + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Futsal scoreboard running`);
  console.log(`  Controller:  http://localhost:${PORT}/futsalcontrol.html`);
  console.log(`  OBS source:  http://localhost:${PORT}/futsaldisplay.html  (1920x1080)`);
});
