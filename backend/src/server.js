
import dotenv from "dotenv";
import dns from "node:dns";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the backend .env file for local development.
// Render uses its configured environment variables.
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Keep the Windows DNS workaround local only.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

// Load the application after the environment is configured.
const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/db.js");

const PORT = Number(process.env.PORT) || 5000;

// Compiled React + Vite application.
const frontendDist = path.resolve(
  __dirname,
  "../../frontend/dist"
);

const frontendIndex = path.join(
  frontendDist,
  "index.html"
);

// Serve compiled JavaScript, CSS, images, and other files.
app.use(
  express.static(frontendDist, {
    index: false,
  })
);

// React Router fallback for client-side routes.
// API routes are already handled by backend/src/app.js.
app.get(/.*/, (req, res, next) => {
  if (!existsSync(frontendIndex)) {
    return res.status(404).json({
      success: false,
      message:
        "Frontend build not found. Run npm run build from the project root.",
    });
  }

  return res.sendFile(frontendIndex, (error) => {
    if (error && !res.headersSent) {
      next(error);
    }
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Configure it before starting the server."
      );
    }

    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `FlexiSole server running on port ${PORT}`
      );
      console.log(
        `Frontend directory: ${frontendDist}`
      );
    });
  } catch (error) {
    console.error("Failed to start FlexiSole:", error);
    process.exit(1);
  }
}

startServer();
