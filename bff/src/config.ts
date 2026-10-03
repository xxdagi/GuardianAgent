import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load from multiple locations so user can have a single .env at root or in backend
const envCandidates = [
  path.resolve(".env"),
  path.resolve("../.env"),
  path.resolve("../backend/.env"),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8000",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
  elevenLabsAgentId: process.env.ELEVENLABS_AGENT_ID ?? "",
};

