import { Router, Request, Response } from 'express';
import { BitGoServerService } from '../services/bitgo';
import { db } from '../services/db';

const router = Router();

/**
 * POST /api/users/vault
 * Get existing vault or create a new one for a MetaMask address.
 * Called automatically when user connects wallet.
 */
router.post('/vault', async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Valid MetaMask address required' });
  }

  // Return existing vault if already created
  const existing = db.getUser(address);
  if (existing) {
    return res.json({ success: true, vault: existing, isNew: false });
  }

  // Create new BitGo vault
  try {
    const wallet = await BitGoServerService.createAgentWallet(
      `user_${address.slice(2, 10).toLowerCase()}`,
      `UserVault_${address.slice(0, 8)}`,
      10000
    );

    const vault = {
      address: address.toLowerCase(),
      walletId: wallet.walletId,
      vaultAddress: wallet.address,
      createdAt: new Date().toISOString(),
    };

    db.saveUser(vault);
    return res.json({ success: true, vault, isNew: true });
  } catch (err: any) {
    console.error('User vault creation error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create vault' });
  }
});

/**
 * GET /api/users/:address/vault
 * Get vault info for a user.
 */
router.get('/:address/vault', (req: Request, res: Response) => {
  const vault = db.getUser(req.params.address);
  if (!vault) return res.status(404).json({ error: 'No vault found for this address' });
  return res.json({ success: true, vault });
});

/**
 * GET /api/users/:address/agents
 * Get all agents belonging to a user.
 */
router.get('/:address/agents', (req: Request, res: Response) => {
  const agents = db.getAgentsByOwner(req.params.address);
  return res.json({ success: true, agents });
});

/**
 * PATCH /api/users/:address/agents/:agentId/ens
 * Update ENS name for an agent after on-chain registration.
 */
router.patch('/:address/agents/:agentId/ens', (req: Request, res: Response) => {
  const { ensName } = req.body;
  const agent = db.getAgent(req.params.agentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  db.saveAgent({ ...agent, ensName });
  return res.json({ success: true });
});

export default router;
