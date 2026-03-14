import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/bots/orders/:botAddress
router.get('/orders/:botAddress', (req: Request, res: Response) => {
  const { botAddress } = req.params;
  if (!botAddress) {
    return res.status(400).json({ error: 'botAddress is required' });
  }
  return res.json({
    orders: [
      {
        id: 'order-1',
        type: 'buy limit',
        asset: 'WBTC',
        amount: '0.1',
        priceUSD: '65000',
        status: 'open',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'order-2',
        type: 'sell stop',
        asset: 'ETH',
        amount: '2.5',
        priceUSD: '3000',
        status: 'filled',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  });
});

// GET /api/bots/deals/:botAddress
router.get('/deals/:botAddress', (req: Request, res: Response) => {
  const { botAddress } = req.params;
  if (!botAddress) {
    return res.status(400).json({ error: 'botAddress is required' });
  }
  return res.json({
    deals: [
      {
        id: 'deal-1',
        type: 'buy',
        asset: 'WETH',
        amount: '0.5',
        priceUSD: '3200',
        totalUSD: '1600',
        timestamp: new Date().toISOString(),
        counterparty: '0x1A2b...3C4D',
      },
      {
        id: 'deal-2',
        type: 'sell',
        asset: 'USDC',
        amount: '1000',
        priceUSD: '1.00',
        totalUSD: '1000',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        counterparty: '0xDeF1...aBc2',
      },
    ],
  });
});

// POST /api/bots/ens/resolve
router.post('/ens/resolve', (req: Request, res: Response) => {
  const { ensName } = req.body;
  if (!ensName) {
    return res.status(400).json({ error: 'ensName is required' });
  }
  const address = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return res.json({
    success: true,
    address,
    name: ensName,
    textRecords: {
      strategy: 'Aggressive APY farming',
      risk: 'High',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${ensName}`,
    },
  });
});

// POST /api/bots/ens/reverse
router.post('/ens/reverse', (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }
  const randomName = `bot-${address.substring(2, 6)}.claw2claw.eth`;
  return res.json({ success: true, name: randomName });
});

export default router;
