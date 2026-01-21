import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat";
import express from "express";
import path from "path";

const LOGIC_APP_URL = 'https://prod-23.israelcentral.logic.azure.com:443/workflows/39fabd0c7a1b418286fe5ec53a720f61/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=JSq3DkhLej1JC18oCJ3CtV7hjUdX_vu1E2j94LLsw_g';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerChatRoutes(app);
  
  app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));
  app.use(express.static(path.resolve(process.cwd(), 'public')));
  app.use(express.static(process.cwd()));
  
  app.post("/api/auth", async (req, res) => {
    try {
      const response = await fetch(LOGIC_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, reason: 'connection_error' });
    }
  });

  app.post("/api/submit", async (req, res) => {
    try {
      const response = await fetch(LOGIC_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, reason: 'connection_error' });
    }
  });

  app.post("/api/sync", async (req, res) => {
    try {
      const response = await fetch(LOGIC_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          employeeId: req.body.employeeId
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, reason: 'connection_error', records: [] });
    }
  });

  return httpServer;
}
