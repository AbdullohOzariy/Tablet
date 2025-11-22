import express from 'express';
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// 1. JSON Server API'ni sozlash
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use('/api', middlewares, router); // Barcha API so'rovlarini /api yo'lida ishga tushirish

// 2. React ilovasining statik fayllarini ulash
// 'dist' papkasi 'npm run build' dan keyin paydo bo'ladi
app.use(express.static(path.join(__dirname, 'dist')));

// 3. API'ga tegishli bo'lmagan har qanday so'rovni React ilovasiga yuborish
// Bu React Router'ning to'g'ri ishlashi uchun kerak
app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).send('API endpoint not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
