import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

// Start Expo Metro bundler
console.log('Starting Expo Metro bundler...');
const metro = spawn('npx', ['expo', 'start', '--web', '--no-clear'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, EXPO_PORT: '3000' }
});

// Wait for Metro to start, then create proxy server
setTimeout(() => {
  const server = http.createServer((req, res) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    });

    req.pipe(proxyReq);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('exit', () => {
    metro.kill();
  });
}, 3000);
