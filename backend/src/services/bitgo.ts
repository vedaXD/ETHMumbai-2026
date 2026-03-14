import { BitGoAPI } from '@bitgo/sdk-api';
import { Eth } from '@bitgo/sdk-coin-eth';

// Tbaseeth: Base testnet (Base Sepolia) - same EVM structure as Eth
class Tbaseeth extends Eth {
  static createInstance(bitgo: any, staticsCoin?: any) {
    return new Tbaseeth(bitgo, staticsCoin);
  }
}

/**
 * BitGo Service - SERVER-SIDE ONLY
 */
export class BitGoServerService {
  private static bitgo: BitGoAPI | null = null;

  static initialize() {
    if (this.bitgo) return this.bitgo;

    const accessToken = process.env.BITGO_ACCESS_TOKEN;
    const env = process.env.BITGO_ENV || 'test';

    if (!accessToken) {
      throw new Error('BITGO_ACCESS_TOKEN not configured');
    }

    this.bitgo = new BitGoAPI({
      accessToken,
      env: env as 'test' | 'prod',
    });

    this.bitgo.register('tbaseeth', Tbaseeth.createInstance);
    console.log('✅ BitGo SDK initialized (Base Sepolia testnet)');
    return this.bitgo;
  }

  static async createAgentWallet(agentId: string, agentName: string, maxSpendLimit = 100) {
    const bitgo = this.initialize();
    const coin = 'tbaseeth';

    const enterpriseId = process.env.BITGO_ENTERPRISE_ID?.trim();
    if (!enterpriseId) throw new Error('BITGO_ENTERPRISE_ID is required in .env');

    const walletResult = await bitgo.coin(coin).wallets().generateWallet({
      label: `Agent_${agentName}_${agentId}`,
      passphrase: process.env.BITGO_WALLET_PASSPHRASE || 'default-passphrase',
      enterprise: enterpriseId,
      walletVersion: 3,
      newFeeAddress: true,
    });

    const wallet = walletResult.wallet;
    const receiveAddress = walletResult.wallet.coinSpecific()?.baseAddress
      || (await wallet.createAddress()).address;

    return {
      walletId: wallet.id(),
      address: receiveAddress,
      coin,
      policies: [`MAX_SPEND_${maxSpendLimit}_USDC`, 'MULTI_SIG_REQUIRED', 'WHITELIST_ONLY'],
      agentId,
      agentName,
    };
  }

  static async getWalletBalance(walletId: string) {
    const bitgo = this.initialize();
    const wallet = await bitgo.coin('tbaseeth').wallets().get({ id: walletId });
    return {
      balance: wallet.balance().toString(),
      confirmedBalance: wallet.confirmedBalance().toString(),
      spendableBalance: wallet.spendableBalance().toString(),
    };
  }

  static async signAndBroadcastTrade(
    walletId: string,
    tradeIntent: {
      to: string;
      amount: string;
      data?: string;
      gasLimit?: string;
    }
  ) {
    const bitgo = this.initialize();
    const wallet = await bitgo.coin('tbaseeth').wallets().get({ id: walletId });

    const txParams: any = {
      recipients: [{ address: tradeIntent.to, amount: tradeIntent.amount }],
      walletPassphrase: process.env.BITGO_WALLET_PASSPHRASE || 'default-passphrase',
      ...(tradeIntent.data && { data: tradeIntent.data }),
      ...(tradeIntent.gasLimit && { gasLimit: parseInt(tradeIntent.gasLimit) }),
    };

    try {
      const txResult = await wallet.sendMany(txParams);
      return { status: 'success', txHash: txResult.txid, txid: txResult.txid };
    } catch (error: any) {
      if (error.message?.includes('policy')) {
        return { status: 'policy_violation', error: error.message, txHash: null };
      }
      throw error;
    }
  }

  static async getTransactionHistory(walletId: string, limit = 10) {
    const bitgo = this.initialize();
    const wallet = await bitgo.coin('tbaseeth').wallets().get({ id: walletId });
    const transfers = await wallet.transfers({ limit });
    return { transactions: transfers.transfers, count: transfers.count };
  }

  static async getWalletDetails(walletId: string) {
    const bitgo = this.initialize();
    const wallet = await bitgo.coin('tbaseeth').wallets().get({ id: walletId });
    return {
      id: wallet.id(),
      label: wallet.label(),
      coin: wallet.coin(),
      balance: wallet.balance().toString(),
      confirmedBalance: wallet.confirmedBalance().toString(),
      spendableBalance: wallet.spendableBalance().toString(),
      receiveAddress: wallet.coinSpecific()?.baseAddress || (await wallet.createAddress()).address,
    };
  }
}
