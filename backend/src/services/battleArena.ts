import { Agent, BattleResult, MarketData } from '../types/agent';
import { fetchMarketData } from './marketData';
import { runAIReasoning } from './aiReasoning';
import { AgentStore } from '../database/agentStore';

// ... (imports)
export async function runBattle(agent1: Agent, agent2: Agent, stakeAmount: number = 0): Promise<BattleResult> {
  console.log(`[BattleArena] ⚔️  ${agent1.name} vs ${agent2.name}`);

  // Both agents see the same market scenario
  const market: MarketData = await fetchMarketData();

  const [r1, r2] = await Promise.all([
    runAIReasoning(agent1.personality, agent1.remainingBudget, market),
    runAIReasoning(agent2.personality, agent2.remainingBudget, market),
  ]);

  console.log(
    `[BattleArena] ${agent1.name}: ${r1.action} @ ${r1.confidence}% | ${agent2.name}: ${r2.action} @ ${r2.confidence}%`
  );

  // Score = base confidence + market-fit bonus
  const score1 = calcBattleScore(r1.confidence, agent1.personality, market);
  const score2 = calcBattleScore(r2.confidence, agent2.personality, market);

  const winner = score1 >= score2 ? agent1 : agent2;
  const loser = score1 >= score2 ? agent2 : agent1;
  const winnerReasoning = score1 >= score2 ? r1 : r2;
  const loserReasoning = score1 >= score2 ? r2 : r1;

  // Handle Stake logic
  if (stakeAmount > 0) {
    AgentStore.update(agent1.id, {
      remainingBudget: agent1.remainingBudget - stakeAmount,
    });
    AgentStore.update(agent2.id, {
      remainingBudget: agent2.remainingBudget - stakeAmount,
    });
    
    // Pot
    const pot = stakeAmount * 2;
    AgentStore.update(winner.id, {
      remainingBudget: winner.remainingBudget + pot,
      battleScore: winner.battleScore + 1 
    });
  } else {
    // Update battle scores only
    AgentStore.update(winner.id, { battleScore: winner.battleScore + 1 });
  }

  const reasoning =
    `${winner.name} made a higher confidence read (${winnerReasoning.confidence}%) than ${loser.name} (${loserReasoning.confidence}%). ` +
    `Insight: "${winnerReasoning.reasoning}"`;

  const result: BattleResult = {
    winnerAgentId: winner.id,
    loserAgentId: loser.id,
    winnerName: winner.name,
    loserName: loser.name,
    reasoning,
    timestamp: new Date().toISOString(),
    marketData: market,
    agent1Details: {
      action: r1.action,
      confidence: r1.confidence,
      score: score1,
      reasoning: r1.reasoning,
      swapStrategy: r1.swapStrategy
    },
    agent2Details: {
      action: r2.action,
      confidence: r2.confidence,
      score: score2,
      reasoning: r2.reasoning,
      swapStrategy: r2.swapStrategy
    }
  };

  const logEntry = `${winner.name} defeated ${loser.name} | ${winnerReasoning.action} vs ${loserReasoning.action}`;
  AgentStore.addBattleLog(logEntry);
  console.log(`[BattleArena] 🏆 Winner: ${winner.name}`);

  return result;
}

// Reward agents whose personality is aligned with market conditions
function calcBattleScore(
  confidence: number,
  personality: Agent['personality'],
  market: MarketData
): number {
  let bonus = 0;

  if (personality === 'momentum_hunter' && market.trend !== 'sideways') bonus += 15;
  if (personality === 'contrarian' && (market.rsi < 25 || market.rsi > 75)) bonus += 15;
  if (personality === 'safe_player' && market.trend === 'sideways') bonus += 10;
  if (personality === 'risk_taker' && market.trend === 'up') bonus += 12;
  if (personality === 'balanced') bonus += 5; // Consistent small bonus

  return confidence + bonus;
}

export async function runCollaboration(
  consultingAgent: Agent,
  consultedAgent: Agent,
  market: MarketData
): Promise<{ advice: string; suggestedAction: string; confidence: number }> {
  console.log(`[Collaboration] ${consultingAgent.name} consulting ${consultedAgent.name}`);

  const response = await runAIReasoning(
    consultedAgent.personality,
    consultedAgent.remainingBudget,
    market
  );

  const advice =
    `${consultedAgent.name} [${consultedAgent.personality}] advises: ` +
    `${response.action} with ${response.confidence}% confidence. "${response.reasoning}"`;

  return {
    advice,
    suggestedAction: response.action,
    confidence: response.confidence,
  };
}
