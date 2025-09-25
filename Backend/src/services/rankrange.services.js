// --- RANKS & RANGES ---
const RANK_RANGES = [
  { id: 1, minRank: "Bronze I", maxRank: "Silver III" },
  { id: 2, minRank: "Silver I", maxRank: "Gold III" },
  { id: 3, minRank: "Gold I", maxRank: "Platinum III" },
  { id: 4, minRank: "Platinum I", maxRank: "Diamond III" },
  { id: 5, minRank: "Diamond III", maxRank: "Master III" },
  { id: 6, minRank: "Master I", maxRank: "Grandmaster III" },
];

const ALL_RANKS = [
  "Bronze I",
  "Bronze II",
  "Bronze III",
  "Silver I",
  "Silver II",
  "Silver III",
  "Gold I",
  "Gold II",
  "Gold III",
  "Platinum I",
  "Platinum II",
  "Platinum III",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Master I",
  "Master II",
  "Master III",
  "Grandmaster I",
  "Grandmaster II",
  "Grandmaster III",
];

// Check if player rank is in a range
function isRankInRange(playerRank, range) {
  const playerIndex = ALL_RANKS.indexOf(playerRank);
  const minIndex = ALL_RANKS.indexOf(range.minRank);
  const maxIndex = ALL_RANKS.indexOf(range.maxRank);
  return playerIndex >= minIndex && playerIndex <= maxIndex;
}

// Get rank range object for a player
function getRankRangeForPlayer(playerRank) {
  return RANK_RANGES.find((RANK_RANGES) =>
    isRankInRange(playerRank, RANK_RANGES)
  );
}

module.exports = {
  RANK_RANGES,
  ALL_RANKS,
  isRankInRange,
  getRankRangeForPlayer,
};