import { AgentStore } from '../database/agentStore';
import { runTradingCycle } from '../services/tradingEngine';
import { runBattle } from '../services/battleArena';

const INTERVAL_MS = Number(process.env.AGENT_LOOP_INTERVAL_MS) || 30_000;
// Run a battle round roughly every 5 trading cycles
const BATTLE_EVERY_N_CYCLES = 5;
let cycleCount = 0;

async function tick(): Promise<void> {
  const activeAgents = AgentStore.listActive();

  if (activeAgents.length === 0) {
    console.log('[Worker] No active agents — sleeping');
    return;
  }

  console.log(`[Worker] ⚙️  Tick #${++cycleCount} — running ${activeAgents.length} agent(s)`);

  // Run all active agents concurrently (up to MAX_CONCURRENT_AGENTS)
  const maxConcurrent = Number(process.env.MAX_CONCURRENT_AGENTS) || 10;
  const batch = activeAgents.slice(0, maxConcurrent);

  await Promise.allSettled(
    batch.map(async (agent) => {
      try {
        const result = await runTradingCycle(agent);
        if (!result.skipped && result.trade) {
          console.log(
            `[Worker] ✅ ${agent.name} | ${result.trade.action} $${result.trade.amount} ` +
              `@ $${result.trade.price} | conf=${result.trade.confidence}%`
          );
        }
      } catch (err) {
        console.error(`[Worker] ❌ ${agent.name} cycle error:`, err);
      }
    })
  );

  // Occasionally run a battle round between two random active agents
  if (cycleCount % BATTLE_EVERY_N_CYCLES === 0 && activeAgents.length >= 2) {
    const shuffled = [...activeAgents].sort(() => Math.random() - 0.5);
    const [a, b] = shuffled;
    try {
      console.log(`[Worker] ⚔️  Triggering battle: ${a.name} vs ${b.name}`);
      const result = await runBattle(a, b);
      console.log(`[Worker] 🏆 Battle winner: ${result.winnerName}`);
    } catch (err) {
      console.error('[Worker] Battle error:', err);
    }
  }
}

export function startAgentWorker(): void {
  console.log(`[Worker] 🚀 Starting — interval=${INTERVAL_MS}ms`);
  // First tick runs after initial delay so server can finish starting
  setTimeout(() => {
    tick();
    setInterval(tick, INTERVAL_MS);
  }, 5_000);
}
