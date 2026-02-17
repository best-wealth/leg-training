import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Start Metro bundler in the background
const metro = spawn('npx', ['expo', 'start', '--web', '--no-clear'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, EXPO_PORT: '3000' }
});

// Wait for Metro to start, then proxy requests
setTimeout(() => {
  app.use((req, res, next) => {
    const url = `http://localhost:3000${req.url}`;
    fetch(url)
      .then(response => {
        res.status(response.status);
        response.headers.forEach((value, name) => {
          res.setHeader(name, value);
        });
        response.body.pipe(res);
      })
      .catch(err => {
        console.error('Proxy error:', err);
        res.status(500).send('Error');
      });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}, 5000);

process.on('exit', () => {
  metro.kill();
});
