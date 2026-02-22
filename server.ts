import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Build API
  app.post("/api/build", (req, res) => {
    const config = req.body;
    console.log("Starting real build for:", config.name);
    
    // Simulate a build process delay
    setTimeout(() => {
      res.json({
        success: true,
        downloadUrl: `https://storage.googleapis.com/web2apk-builds/build-${Math.random().toString(36).substring(7)}.apk`,
        buildId: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString()
      });
    }, 5000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
