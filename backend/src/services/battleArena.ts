import { Agent, BattleResult, MarketData } from '../types/agent';
import { fetchMarketData } from './marketData';
import { runAIReasoning } from './aiReasoning';
import { AgentStore } from '../database/agentStore';

export async function runBattle(agent1: Agent, agent2: Agent): Promise<BattleResult> {
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

  // Update battle scores
  AgentStore.update(winner.id, { battleScore: winner.battleScore + 1 });

  const reasoning =
    `${winner.name} [${winner.personality}] outperformed with action=${winnerReasoning.action} ` +
    `(confidence ${winnerReasoning.confidence}%) vs ${loser.name} [${loser.personality}] ` +
    `action=${loserReasoning.action} (confidence ${loserReasoning.confidence}%). ` +
    `Winner reasoning: "${winnerReasoning.reasoning}"`;

  const result: BattleResult = {
    winnerAgentId: winner.id,
    loserAgentId: loser.id,
    winnerName: winner.name,
    loserName: loser.name,
    reasoning,
    timestamp: new Date().toISOString(),
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
