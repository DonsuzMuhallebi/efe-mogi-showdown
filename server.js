// Minimal static file server (preview only)
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3737;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.startsWith('/save')) {
    const name = (new URL(req.url, 'http://x')).searchParams.get('name') || 'out.png';
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const b64 = body.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(path.join(__dirname, name.replace(/[^a-zA-Z0-9._-]/g, '')), Buffer.from(b64, 'base64'));
        res.writeHead(200); res.end('ok');
      } catch (e) { res.writeHead(500); res.end('err'); }
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  const file = path.join(__dirname, path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('serving on http://localhost:' + PORT));
