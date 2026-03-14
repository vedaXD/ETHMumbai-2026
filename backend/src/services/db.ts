/**
 * Simple JSON file database — no external deps, persists between restarts.
 * Stores user vaults and agents keyed by MetaMask address.
 */
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../db.json');

interface UserVault {
  address: string;       // MetaMask address (lowercase)
  walletId: string;      // BitGo wallet ID
  vaultAddress: string;  // On-chain Base Sepolia address
  createdAt: string;
}

interface Agent {
  agentId: string;
  name: string;
  personality: string;
  walletId: string;
  walletAddress: string;
  ensName: string | null;
  ownerAddress: string;  // MetaMask address of owner (lowercase)
  coin: string;
  createdAt: string;
}

interface DB {
  users: Record<string, UserVault>;   // keyed by lowercased MetaMask address
  agents: Record<string, Agent>;      // keyed by agentId
}

function load(): DB {
  if (!fs.existsSync(DB_PATH)) {
    return { users: {}, agents: {} };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(db: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
  getUser(address: string): UserVault | null {
    return load().users[address.toLowerCase()] || null;
  },

  saveUser(vault: UserVault): void {
    const data = load();
    data.users[vault.address.toLowerCase()] = vault;
    save(data);
  },

  saveAgent(agent: Agent): void {
    const data = load();
    data.agents[agent.agentId] = { ...agent, ownerAddress: agent.ownerAddress.toLowerCase() };
    save(data);
  },

  getAgentsByOwner(ownerAddress: string): Agent[] {
    const data = load();
    return Object.values(data.agents).filter(
      a => a.ownerAddress === ownerAddress.toLowerCase()
    );
  },

  getAgent(agentId: string): Agent | null {
    return load().agents[agentId] || null;
  },
};
