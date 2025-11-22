import express from 'express';
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const host = '0.0.0.0';

// Doimiy xotiradagi db.json yo'lini ko'rsatish
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'db.json') : 'db.json';

// 1. JSON Server API'ni sozlash
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

app.use('/api', middlewares, router);

// 2. React ilovasining statik fayllarini ulash
app.use(express.static(path.join(__dirname, 'dist')));

// 3. API'ga tegishli bo'lmagan har qanday so'rovni React ilovasiga yuborish
app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).send('API endpoint not found');
  }
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`Database is being read from: ${dbPath}`);
});
