// Example usage of the WASM scoring engine in your quiz game
// Import these functions wherever you need scoring calculations

import {
  loadScoreWasm,
  calculateFinalScore,
  computeAccuracy,
  computeTimeMultiplier,
  calculateGeoScore,
  haversineDistance,
  rankingError,
  computeVotingAccuracy,
  validateAnswerSubmission,
  detectCheating,
  validateTimerSync,
  calculateLeaderboard,
  aggregateVotes,
  type LeaderboardEntry,
  type VoteResult,
} from "@/lib/scoreWasm";

// ========== INITIALIZE AT APP STARTUP ==========

export async function initializeGameEngine() {
  await loadScoreWasm();
  console.log("Game engine ready!");
}

// ========== EXAMPLE 1: MULTIPLE CHOICE QUESTION ==========

export async function scoreMCQAnswer(
  isCorrect: boolean,
  basePoints: number,
  timeTaken: number,
  timeLimit: number
) {
  const accuracy = isCorrect ? 1.0 : 0.0;
  const timeMultiplier = await computeTimeMultiplier(timeTaken, timeLimit);
  const finalScore = await calculateFinalScore(basePoints, accuracy, timeMultiplier, 1.0);
  
  return {
    points: Math.round(finalScore),
    accuracy,
    timeMultiplier,
  };
}

// ========== EXAMPLE 2: RANGE SLIDER QUESTION ==========

export async function scoreRangeAnswer(
  submittedValue: number,
  correctValue: number,
  min: number,
  max: number,
  basePoints: number,
  timeTaken: number,
  timeLimit: number,
  tolerance: number = 0.2
) {
  const range = max - min;
  const error = Math.abs(submittedValue - correctValue) / range;
  
  const accuracy = await computeAccuracy(error, tolerance);
  const timeMultiplier = await computeTimeMultiplier(timeTaken, timeLimit);
  const finalScore = await calculateFinalScore(basePoints, accuracy, timeMultiplier, 1.0);
  
  return {
    points: Math.round(finalScore),
    accuracy,
    timeMultiplier,
    error,
  };
}

// ========== EXAMPLE 3: GEOGUESSR QUESTION ==========

export async function scoreGeoAnswer(
  playerLat: number,
  playerLng: number,
  correctLat: number,
  correctLng: number,
  scope: "city" | "region" | "country" | "continent" | "world",
  basePoints: number,
  timeTaken: number,
  timeLimit: number
) {
  const scopeRadii = {
    city: 5,
    region: 50,
    country: 200,
    continent: 1000,
    world: 5000,
  };
  
  const scopeRadius = scopeRadii[scope];
  
  const finalScore = await calculateGeoScore(
    playerLat,
    playerLng,
    correctLat,
    correctLng,
    scopeRadius,
    basePoints,
    timeTaken,
    timeLimit
  );
  
  const distance = await haversineDistance(playerLat, playerLng, correctLat, correctLng);
  
  return {
    points: Math.round(finalScore),
    distanceKm: Math.round(distance * 10) / 10,
  };
}

// ========== EXAMPLE 4: RANKING QUESTION ==========

export async function scoreRankingAnswer(
  submittedOrder: number[],
  correctOrder: number[],
  basePoints: number,
  timeTaken: number,
  timeLimit: number,
  tolerance: number = 0.25
) {
  const error = await rankingError(submittedOrder, correctOrder);
  const accuracy = await computeAccuracy(error, tolerance);
  const timeMultiplier = await computeTimeMultiplier(timeTaken, timeLimit);
  const finalScore = await calculateFinalScore(basePoints, accuracy, timeMultiplier, 1.0);
  
  return {
    points: Math.round(finalScore),
    accuracy,
    error,
  };
}

// ========== EXAMPLE 5: TASKMASTER VOTING ==========

export async function scoreTaskmasterAnswer(
  playerId: string,
  allVotes: string[], // Array of player IDs who received votes
  basePoints: number
) {
  const votesReceived = allVotes.filter((id) => id === playerId).length;
  const totalVoters = allVotes.length;
  
  const accuracy = await computeVotingAccuracy(votesReceived, totalVoters);
  const finalScore = await calculateFinalScore(basePoints, accuracy, 1.0, 1.0);
  
  return {
    points: Math.round(finalScore),
    votesReceived,
    totalVoters,
  };
}

// ========== EXAMPLE 6: SERVER-SIDE VALIDATION ==========

export async function validatePlayerAnswer(
  answer: any,
  timeTakenMs: number,
  timeLimitMs: number,
  serverStartTimestamp: number,
  clientSubmitTimestamp: number,
  serverReceiveTimestamp: number
) {
  const answerJson = JSON.stringify(answer);
  
  // Validate submission timing
  const isValidSubmission = await validateAnswerSubmission(
    timeTakenMs,
    timeLimitMs,
    answerJson
  );
  
  if (!isValidSubmission) {
    return { valid: false, reason: "Invalid submission timing or format" };
  }
  
  // Validate timer synchronization
  const isTimerValid = await validateTimerSync(
    serverStartTimestamp,
    clientSubmitTimestamp,
    serverReceiveTimestamp,
    Math.floor(timeLimitMs / 1000)
  );
  
  if (!isTimerValid) {
    return { valid: false, reason: "Timer manipulation detected" };
  }
  
  return { valid: true };
}

// ========== EXAMPLE 7: DETECT CHEATING PATTERNS ==========

export async function checkForCheating(
  playerAnswerTimes: number[], // Array of times in milliseconds
  questionAvgTime: number
) {
  const isCheating = await detectCheating(playerAnswerTimes, questionAvgTime);
  
  if (isCheating) {
    console.warn("?? Suspicious answer pattern detected");
    return true;
  }
  
  return false;
}

// ========== EXAMPLE 8: CALCULATE LEADERBOARD ==========

export async function updateGameLeaderboard(
  players: Array<{ id: string; name: string; score: number }>
): Promise<Array<LeaderboardEntry & { name: string }>> {
  const leaderboard = await calculateLeaderboard(
    players.map((p) => ({ id: p.id, score: p.score }))
  );
  
  // Merge with player names
  return leaderboard.map((entry) => {
    const player = players.find((p) => p.id === entry.playerId);
    return {
      ...entry,
      name: player?.name || "Unknown",
    };
  });
}

// ========== EXAMPLE 9: AGGREGATE VOTING RESULTS ==========

export async function calculateVotingResults(
  votes: Array<{ voterId: string; targetId: string }>
): Promise<VoteResult[]> {
  const targetIds = votes.map((v) => v.targetId);
  const results = await aggregateVotes(targetIds);
  
  return results.sort((a, b) => b.votes - a.votes);
}

// ========== EXAMPLE 10: COMPLETE ROUND SCORING ==========

export async function scoreCompleteRound(
  players: Array<{
    id: string;
    answer: any;
    timeTaken: number;
  }>,
  question: {
    type: string;
    correct: any;
    pointsMax: number;
    timeLimit: number;
    metadata: any;
  }
) {
  const results = [];
  
  for (const player of players) {
    let score = 0;
    let accuracy = 0;
    
    switch (question.type) {
      case "MULTIPLE_CHOICE":
      case "TEXT_EXACT":
        const isCorrect = player.answer === question.correct;
        const mcqResult = await scoreMCQAnswer(
          isCorrect,
          question.pointsMax,
          player.timeTaken,
          question.timeLimit
        );
        score = mcqResult.points;
        accuracy = mcqResult.accuracy;
        break;
        
      case "RANGE":
        const rangeResult = await scoreRangeAnswer(
          player.answer.value,
          question.correct.value,
          question.metadata.min,
          question.metadata.max,
          question.pointsMax,
          player.timeTaken,
          question.timeLimit,
          question.metadata.tolerance
        );
        score = rangeResult.points;
        accuracy = rangeResult.accuracy;
        break;
        
      case "GEO":
        const geoResult = await scoreGeoAnswer(
          player.answer.lat,
          player.answer.lng,
          question.correct.lat,
          question.correct.lng,
          question.metadata.scope,
          question.pointsMax,
          player.timeTaken,
          question.timeLimit
        );
        score = geoResult.points;
        break;
        
      case "RANKING":
        const rankResult = await scoreRankingAnswer(
          player.answer,
          question.correct,
          question.pointsMax,
          player.timeTaken,
          question.timeLimit,
          question.metadata.tolerance
        );
        score = rankResult.points;
        accuracy = rankResult.accuracy;
        break;
    }
    
    results.push({
      playerId: player.id,
      score,
      accuracy,
      timeTaken: player.timeTaken,
    });
  }
  
  return results;
}
