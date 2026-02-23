// helper loader for Wasm module compiled from wasm/score

// WebAssembly Score Engine Wrapper with TypeScript fallbacks
// Automatically falls back to JavaScript if WASM fails to load

let wasm: any = null;

export async function loadScoreWasm(): Promise<void> {
  if (wasm) return;
  try {
    wasm = await import("../wasm/score/pkg/score_wasm.js");
    console.log("? WASM scoring engine loaded");
  } catch (err) {
    console.warn("?? WASM module failed to load, using JS fallback", err);
  }
}

// ========== ACCURACY ==========

export async function computeAccuracy(error: number, tolerance: number): Promise<number> {
  if (wasm?.compute_accuracy) {
    return wasm.compute_accuracy(error, tolerance);
  }
  const x = error / tolerance;
  return Math.exp(-x);
}

// ========== TIME MULTIPLIER ==========

export async function computeTimeMultiplier(timeTaken: number, timeLimit: number): Promise<number> {
  if (wasm?.compute_time_multiplier) {
    return wasm.compute_time_multiplier(timeTaken, timeLimit);
  }
  if (timeTaken >= timeLimit) return 1.0;
  const timeRemaining = timeLimit - timeTaken;
  const timeRatio = timeRemaining / timeLimit;
  return 1.0 + timeRatio;
}

// ========== FINAL SCORE ==========

export async function calculateFinalScore(
  basePoints: number,
  accuracy: number,
  timeMultiplier: number,
  confidenceMultiplier: number = 1.0
): Promise<number> {
  if (wasm?.calculate_final_score) {
    return wasm.calculate_final_score(basePoints, accuracy, timeMultiplier, confidenceMultiplier);
  }
  return basePoints * accuracy * timeMultiplier * confidenceMultiplier;
}

// ========== GEOGUESSR ==========

export async function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  if (wasm?.haversine_distance) {
    return wasm.haversine_distance(lat1, lon1, lat2, lon2);
  }
  
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function computeGeoAccuracy(distanceKm: number, scopeRadius: number): Promise<number> {
  if (wasm?.compute_geo_accuracy) {
    return wasm.compute_geo_accuracy(distanceKm, scopeRadius);
  }
  const error = distanceKm / scopeRadius;
  return Math.exp(-error / 0.3);
}

export async function calculateGeoScore(
  playerLat: number,
  playerLon: number,
  correctLat: number,
  correctLon: number,
  scopeRadiusKm: number,
  basePoints: number,
  timeTaken: number,
  timeLimit: number
): Promise<number> {
  if (wasm?.calculate_geo_score) {
    return wasm.calculate_geo_score(
      playerLat,
      playerLon,
      correctLat,
      correctLon,
      scopeRadiusKm,
      basePoints,
      timeTaken,
      timeLimit
    );
  }
  
  const distance = await haversineDistance(playerLat, playerLon, correctLat, correctLon);
  const accuracy = await computeGeoAccuracy(distance, scopeRadiusKm);
  const timeMult = await computeTimeMultiplier(timeTaken, timeLimit);
  return basePoints * accuracy * timeMult;
}

// ========== RANKING ==========

export async function rankingError(submitted: number[], correct: number[]): Promise<number> {
  if (wasm?.ranking_error) {
    return wasm.ranking_error(new Uint32Array(submitted), new Uint32Array(correct));
  }
  
  if (submitted.length !== correct.length || submitted.length === 0) return 1.0;
  
  let inversions = 0;
  const n = submitted.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const subI = submitted.indexOf(correct[i]);
      const subJ = submitted.indexOf(correct[j]);
      if (subI > subJ) inversions++;
    }
  }
  
  const maxInversions = (n * (n - 1)) / 2;
  return maxInversions === 0 ? 0 : inversions / maxInversions;
}

// ========== VOTING ==========

export async function computeVotingAccuracy(votesReceived: number, totalVoters: number): Promise<number> {
  if (wasm?.compute_voting_accuracy) {
    return wasm.compute_voting_accuracy(votesReceived, totalVoters);
  }
  return totalVoters === 0 ? 0 : votesReceived / totalVoters;
}

// ========== VALIDATION ==========

export async function validateAnswerSubmission(
  timeTakenMs: number,
  timeLimitMs: number,
  answerJson: string
): Promise<boolean> {
  if (wasm?.validate_answer_submission) {
    return wasm.validate_answer_submission(timeTakenMs, timeLimitMs, answerJson);
  }
  
  return timeTakenMs <= timeLimitMs + 500 && answerJson.length > 0 && answerJson.length < 10000;
}

export async function detectCheating(
  answerTimes: number[],
  avgExpectedTime: number
): Promise<boolean> {
  if (wasm?.detect_cheating_pattern) {
    return wasm.detect_cheating_pattern(new Uint32Array(answerTimes), avgExpectedTime);
  }
  
  if (answerTimes.length < 3) return false;
  
  const mean = answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length;
  const variance = answerTimes.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) / answerTimes.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev < 50 && mean < avgExpectedTime / 2;
}

export async function validateTimerSync(
  serverStartTs: number,
  clientSubmitTs: number,
  serverReceiveTs: number,
  timeLimitSeconds: number
): Promise<boolean> {
  if (wasm?.validate_timer_sync) {
    return wasm.validate_timer_sync(serverStartTs, clientSubmitTs, serverReceiveTs, timeLimitSeconds);
  }
  
  const elapsedServer = serverReceiveTs - serverStartTs;
  const elapsedClient = clientSubmitTs - serverStartTs;
  const timeDiff = Math.abs(elapsedServer - elapsedClient);
  
  if (timeDiff > 2000) return false;
  return elapsedServer <= timeLimitSeconds * 1000 + 500;
}

// ========== LEADERBOARD ==========

export interface LeaderboardEntry {
  playerId: string;
  score: number;
  rank: number;
}

export async function calculateLeaderboard(
  players: Array<{ id: string; score: number }>
): Promise<LeaderboardEntry[]> {
  if (wasm?.calculate_leaderboard) {
    const playerIds = players.map((p) => p.id);
    const scores = new Uint32Array(players.map((p) => p.score));
    
    const result = wasm.calculate_leaderboard(playerIds, scores);
    return result.map((entry: any) => ({
      playerId: entry.playerId,
      score: entry.score,
      rank: entry.rank,
    }));
  }
  
  const sorted = players
    .map((p, i) => ({ ...p, originalIndex: i }))
    .sort((a, b) => b.score - a.score);
  
  let rank = 1;
  let prevScore = sorted[0]?.score ?? 0;
  
  return sorted.map((p, idx) => {
    if (p.score !== prevScore) rank = idx + 1;
    prevScore = p.score;
    return { playerId: p.id, score: p.score, rank };
  });
}

// ========== VOTING AGGREGATION ==========

export interface VoteResult {
  playerId: string;
  votes: number;
}

export async function aggregateVotes(targetIds: string[]): Promise<VoteResult[]> {
  if (wasm?.aggregate_votes) {
    const result = wasm.aggregate_votes(targetIds);
    return result.map((entry: any) => ({
      playerId: entry.playerId,
      votes: entry.votes,
    }));
  }
  
  const voteCounts = new Map<string, number>();
  targetIds.forEach((id) => {
    voteCounts.set(id, (voteCounts.get(id) || 0) + 1);
  });
  
  return Array.from(voteCounts.entries())
    .map(([playerId, votes]) => ({ playerId, votes }))
    .sort((a, b) => b.votes - a.votes);
}

// ========== STATE COMPRESSION ==========

export async function compressGameState(jsonState: string): Promise<Uint8Array> {
  if (wasm?.compress_game_state) {
    return new Uint8Array(wasm.compress_game_state(jsonState));
  }
  
  return new TextEncoder().encode(jsonState);
}

export async function decompressGameState(compressed: Uint8Array): Promise<string> {
  if (wasm?.decompress_game_state) {
    return wasm.decompress_game_state(Array.from(compressed));
  }
  
  return new TextDecoder().decode(compressed);
}

