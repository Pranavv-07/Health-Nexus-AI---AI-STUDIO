import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Mount backend API router
  app.use('/api', apiRouter);

  // Simulated PHC raw connector endpoints
  app.get('/api/integrations/patient', (req, res) => {
    res.json({ status: 'OK', connector: 'Patient EMR Gateway', timestamp: new Date().toISOString() });
  });
  app.get('/api/integrations/inventory', (req, res) => {
    res.json({ status: 'OK', connector: 'DVDMS Drug Stock Feed', timestamp: new Date().toISOString() });
  });
  app.get('/api/integrations/beds', (req, res) => {
    res.json({ status: 'OK', connector: 'Live Bed Occupancy Registry', timestamp: new Date().toISOString() });
  });
  app.get('/api/integrations/staff', (req, res) => {
    res.json({ status: 'OK', connector: 'HRMS Biometric Attendance', timestamp: new Date().toISOString() });
  });
  app.get('/api/integrations/diagnostics', (req, res) => {
    res.json({ status: 'OK', connector: 'Viral/Enteric LIMS Diagnostic Feed', timestamp: new Date().toISOString() });
  });
  app.get('/api/integrations/supply', (req, res) => {
    res.json({ status: 'OK', connector: 'State Logistics Depot ERP', timestamp: new Date().toISOString() });
  });

  // Resolve dist directory reliably
  const baseDir = import.meta.dirname || process.cwd();
  const distDir = path.resolve(baseDir, 'dist');
  const indexHtml = path.resolve(distDir, 'index.html');
  const hasDist = fs.existsSync(indexHtml);
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (isProduction && hasDist) {
    console.log(`[Health-Nexus AI] Serving static production build from ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(indexHtml);
    });
  } else {
    console.log('[Health-Nexus AI] Starting Vite in development middleware mode');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Health-Nexus AI] Operational server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Health-Nexus AI] Fatal startup error:', err);
  process.exit(1);
});
