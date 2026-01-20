import type { Express } from "express";

export function registerChatRoutes(app: Express) {
  // Placeholder for chat routes - can be extended later
  app.get("/api/chat/health", (_req, res) => {
    res.json({ status: "ok" });
  });
}
