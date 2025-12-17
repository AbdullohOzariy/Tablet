import express from 'express';
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const host = '0.0.0.0';

// Database setup
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'db.json')
  : path.join(__dirname, 'db.json');

// Default data if db.json is missing or empty
const defaultData = {
    branding: {
        restaurantName: "Lazzat Milliy Taomlar",
        slogan: "Restoran biznesingiz uchun zamonaviy raqamli menyu.",
        logoUrl: "https://picsum.photos/id/1060/200/200",
        backgroundImageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop",
        headerImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop",
        welcomeMessage: "Xush kelibsiz! Iltimos, filialni tanlang",
        menuHeroTitle: "Ta'm va Lazzzat",
        menuHeroSubtitle: "Bizning maxsus taomlarimizdan bahramand bo'ling.",
        primaryColor: "#F97316",
        backgroundColor: "#F8F9FC",
        cardColor: "#FFFFFF",
        textColor: "#111827",
        mutedColor: "#6B7280"
    },
    branches: [],
    categories: [],
    dishes: []
};

// Ensure db.json exists and is valid
try {
    if (!fs.existsSync(dbPath)) {
        console.log(`Database file not found at ${dbPath}, creating a new one...`);
        fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    } else {
        // Check if file is empty or invalid JSON
        const content = fs.readFileSync(dbPath, 'utf-8');
        try {
            JSON.parse(content);
        } catch (e) {
            console.error("db.json is corrupted, resetting to default data.");
            fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
        }
    }
} catch (err) {
    console.error("Error initializing database:", err);
}

// 1. JSON Server API
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

app.use('/api', middlewares, router);

// 2. Serve Static Files (Frontend)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
} else {
    console.warn("WARNING: 'dist' folder not found. Frontend will not be served.");
}

// 3. Handle SPA Routing (Catch-all)
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
     return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
  } else {
      res.status(404).send('Frontend build not found. Please run "npm run build" locally or check your deployment logs.');
  }
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`Database path: ${dbPath}`);
});
