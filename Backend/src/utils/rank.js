// utils/rank.js
export const rankTiers = [
  { name: "Bronze I", minMMR: 100 },
  { name: "Bronze II", minMMR: 200 },
  { name: "Bronze III", minMMR: 300 },
  { name: "Silver I", minMMR: 400 },
  { name: "Silver II", minMMR: 500 },
  { name: "Silver III", minMMR: 600 },
  { name: "Gold I", minMMR: 700 },
  { name: "Gold II", minMMR: 800 },
  { name: "Gold III", minMMR: 900 },
  { name: "Platinum I", minMMR: 1000 },
  { name: "Platinum II", minMMR: 1100 },
  { name: "Platinum III", minMMR: 1200 },
  { name: "Diamond I", minMMR: 1300 },
  { name: "Diamond II", minMMR: 1400 },
  { name: "Diamond III", minMMR: 1500 },
  { name: "Master I", minMMR: 1600 },
  { name: "Master II", minMMR: 1700 },
  { name: "Master III", minMMR: 1800 },  
  { name: "Grandmaster I", minMMR: 1900 },
  { name: "Grandmaster I", minMMR: 2000 },
  { name: "Grandmaster I", minMMR: 2100 },
];

// Get rank based on MMR
export function getRankByMMR(mmr) {
  let rank = rankTiers[0].name;
  for (const tier of rankTiers) {
    if (mmr >= tier.minMMR) rank = tier.name;
    else break;
  }
  return rank;
}
