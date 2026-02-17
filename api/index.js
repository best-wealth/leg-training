import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from dist directory
const distPath = join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not found. Please ensure the app has been built.');
  }
});

export default app;
