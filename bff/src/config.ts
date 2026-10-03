import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8000",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
