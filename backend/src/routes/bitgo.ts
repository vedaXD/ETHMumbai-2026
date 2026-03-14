import { Router, Request, Response } from 'express';
import { BitGoServerService } from '../services/bitgo';

const router = Router();

// POST /api/bitgo/wallets
router.post('/wallets', async (req: Request, res: Response) => {
  try {
    const { agentId, agentName, maxSpendLimit } = req.body;
    if (!agentId || !agentName) {
      return res.status(400).json({ error: 'agentId and agentName are required' });
    }
    const wallet = await BitGoServerService.createAgentWallet(agentId, agentName, maxSpendLimit || 100);
    return res.json({ success: true, wallet });
  } catch (error: any) {
    console.error('Wallet creation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create wallet' });
  }
});

// GET /api/bitgo/wallets/:walletId
router.get('/wallets/:walletId', async (req: Request, res: Response) => {
  try {
    const details = await BitGoServerService.getWalletDetails(req.params.walletId);
    return res.json({ success: true, wallet: details });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to get wallet' });
  }
});

// GET /api/bitgo/wallets/:walletId/balance
router.get('/wallets/:walletId/balance', async (req: Request, res: Response) => {
  try {
    const balance = await BitGoServerService.getWalletBalance(req.params.walletId);
    return res.json({ success: true, balance });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to get balance' });
  }
});

// GET /api/bitgo/wallets/:walletId/transactions
router.get('/wallets/:walletId/transactions', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10');
    const history = await BitGoServerService.getTransactionHistory(req.params.walletId, limit);
    return res.json({ success: true, ...history });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to get transactions' });
  }
});

// POST /api/bitgo/transactions
router.post('/transactions', async (req: Request, res: Response) => {
  try {
    const { walletId, tradeIntent } = req.body;
    if (!walletId || !tradeIntent) {
      return res.status(400).json({ error: 'walletId and tradeIntent are required' });
    }
    const result = await BitGoServerService.signAndBroadcastTrade(walletId, tradeIntent);
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to execute transaction' });
  }
});

export default router;
