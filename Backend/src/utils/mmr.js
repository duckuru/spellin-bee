
export const calculateMMRChange = (score, rank) => {
  const rankBase = rank.split(" ")[0]; // e.g., "Silver III" → "Silver"
  const multipliers = {
    Bronze: 2.0,
    Silver: 1.8,
    Gold: 1.6,
    Platinum: 1.4,
    Diamond: 1.3,
    Master: 1.2,
    Grandmaster: 1.1,
  };

  const multiplier = multipliers[rankBase] || 1.0;
  const baseMMR = 5;       // baseline gain if correct
  const baseMMRLoss = 10;   // baseline loss if score = 0

  if (score <= 0) {
    return -baseMMRLoss; // flat penalty for failing to score
  }

  const mmrGiven = (score * multiplier)/10;
  return Math.floor(baseMMR + mmrGiven);
}