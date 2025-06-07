import { Router, Request, Response } from 'express';
import IntegrationService from '../services/integration/IntegrationService';
import { IntegrationConfig } from '../types/integration';

const router = Router();

// Get all integrations
router.get('/integrations', async (req: Request, res: Response) => {
  try {
    const integrations = IntegrationService.getIntegrations();
    res.json({ success: true, data: integrations });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get integration status
router.get('/integrations/:id/status', async (req: Request, res: Response) => {
  try {
    const status = await IntegrationService.getStatus(req.params.id);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Register new integration
router.post('/integrations', async (req: Request, res: Response) => {
  try {
    const config: IntegrationConfig = req.body;
    await IntegrationService.registerIntegration(config);
    res.status(201).json({ 
      success: true, 
      message: 'Integration registered successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Sync data from integration
router.post('/integrations/:id/sync', async (req: Request, res: Response) => {
  try {
    const { entityType } = req.body;
    const result = await IntegrationService.syncData(req.params.id, entityType);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Handle webhook
router.post('/integrations/:id/webhook', async (req: Request, res: Response) => {
  try {
    await IntegrationService.handleWebhook(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Remove integration
router.delete('/integrations/:id', async (req: Request, res: Response) => {
  try {
    await IntegrationService.removeIntegration(req.params.id);
    res.json({ 
      success: true, 
      message: 'Integration removed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// OAuth callback endpoint
router.get('/integrations/oauth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    // Handle OAuth callback
    // The state parameter should contain the integration type and user info
    res.redirect(`/integrations/setup/complete?code=${code}&state=${state}`);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;