import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import loadEnv from "./middleware/loadEnv.js";
import { getAiSuggestions } from "./routes/ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientDistPath = join(__dirname, "../client/dist");

const app = express();

// Basic middleware
app.use(loadEnv());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "*",
    })
  );
}

// Serve static files from the Vite build output directory
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));
} else {
  // In development, proxy requests to the Vite dev server
  app.use((req, res, next) => {
    // Forward API requests to our Express routes
    if (req.url.startsWith("/api")) {
      return next();
    }
    // Proxy all other requests to Vite dev server
    const target = "http://localhost:5173";
    const proxyUrl = `${target}${req.url}`;
    res.redirect(proxyUrl);
  });
}

app.post("/api/ai-suggestions", getAiSuggestions);

// API routes
app.get("/api", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Delivery API is running" });
});

// Users route
// app.get("/api/users", getUser);
// app.post("/api/register", registerUser);
// app.post("/api/login", loginUser);

// Handle SPA routing - serve index.html for all non-API routes
app.use("*", (req, res) => {
  res.sendFile(join(clientDistPath, "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Export the Express app for Vercel
export default app;
