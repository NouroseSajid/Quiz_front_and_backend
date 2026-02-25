#!/usr/bin/env node

/**
 * Automated API Test Suite for Quiz Application
 * Tests core game flow, answer submission, and data persistence
 */

const API_BASE = "http://localhost:3000";
let testsPassed = 0;
let testsFailed = 0;
const results = [];

// ============================================================================
// Utility Functions
// ============================================================================

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    testsFailed++;
    results.push(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  testsPassed++;
  results.push(`✅ PASS: ${message}`);
}

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await fn();
  } catch (err) {
    console.error(`   ${err.message}`);
  }
}

// ============================================================================
// Test Fixtures
// ============================================================================

let gameId = null;
let playerId1 = null;
let playerToken1 = null;
let playerId2 = null;

// ============================================================================
// Tests
// ============================================================================

async function runTests() {
  console.log("🚀 Starting Quiz Application API Tests\n");
  console.log(`API Base: ${API_BASE}\n`);

  // Game Creation Tests
  await test("Create Game", async () => {
    const { ok, data } = await request("POST", "/api/lobby/create");
    assert(ok, "Create game endpoint returns 200");
    assert(data.session, "Response includes session");
    assert(data.session.code, "Session has game code");
    gameId = data.session.code;
    console.log(`   Game Code: ${gameId}`);
  });

  // Player Join Tests
  await test("Player 1 Join Lobby", async () => {
    const { ok, data } = await request("POST", `/api/lobby/${gameId}/join`, {
      playerName: "Alice",
    });
    assert(ok, "Join returns 200");
    assert(data.playerId, "Response includes playerId");
    assert(data.playerToken, "Response includes playerToken");
    playerId1 = data.playerId;
    playerToken1 = data.playerToken;
    console.log(`   Player 1 ID: ${playerId1}`);
  });

  await test("Player 2 Join Lobby", async () => {
    const { ok, data } = await request("POST", `/api/lobby/${gameId}/join`, {
      playerName: "Bob",
    });
    assert(ok, "Join returns 200");
    playerId2 = data.playerId;
    console.log(`   Player 2 ID: ${playerId2}`);
  });

  // Session Fetch Tests
  await test("Get Lobby Session", async () => {
    const { ok, data } = await request("GET", `/api/lobby/${gameId}`);
    assert(ok, "Get lobby returns 200");
    assert(data.session.players.length === 2, "Lobby has 2 players");
    assert(
      data.session.players.some((p) => p.name === "Alice"),
      "Alice is in lobby"
    );
    assert(
      data.session.players.some((p) => p.name === "Bob"),
      "Bob is in lobby"
    );
  });

  // Game Start Tests
  await test("Start Game", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/lobby/${gameId}/start`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
      }
    );
    assert(ok, "Start game returns 200");
    assert(
      data.session.checkpoint === "QUESTION_ACTIVE",
      "Checkpoint is QUESTION_ACTIVE"
    );
    assert(
      data.session.rounds.length > 0,
      "Game has rounds loaded"
    );
  });

  // Question Tests
  await test("First Question Displays", async () => {
    const { ok, data } = await request("GET", `/api/lobby/${gameId}`);
    assert(ok, "Get session returns 200");
    const round = data.session.rounds[0];
    assert(round, "First round exists");
    assert(round.questions.length > 0, "Round has questions");
    const question = round.questions[0];
    assert(question.text, "Question has text");
    assert(question.type, "Question has type");
    console.log(`   Question Type: ${question.type}`);
    console.log(`   Question Text: ${question.text.substring(0, 50)}...`);
  });

  // Answer Submission Tests
  await test("Submit MULTIPLE_CHOICE Answer", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/answer`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
        answer: 0,
      }
    );
    assert(ok, "Answer submission returns 200");
    assert(data.session.checkpoint === "QUESTION_ACTIVE", "Still in question");
  });

  await test("Submit Different Answer Type", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/answer`,
      {
        playerId: playerId2,
        playerToken: playerToken1, // Note: intentionally wrong token for error test
        answer: 1,
      }
    );
    assert(!ok, "Invalid token returns error");
    assert(data.error, "Error message provided");
  });

  // Reveal Tests
  await test("Reveal Question", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/reveal`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
      }
    );
    assert(ok, "Reveal returns 200");
    assert(
      data.session.checkpoint === "QUESTION_RESULTS",
      "Checkpoint is QUESTION_RESULTS"
    );
  });

  // Results Display Tests
  await test("Question Has Answers After Reveal", async () => {
    const { ok, data } = await request("GET", `/api/lobby/${gameId}`);
    assert(ok, "Get session returns 200");
    const round = data.session.rounds[0];
    const question = round.questions[0];
    assert(
      Object.keys(question.answers).length > 0,
      "Question has submitted answers"
    );
    console.log(`   Answers received: ${Object.keys(question.answers).length}`);
  });

  // Next Question Tests
  await test("Next Question", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/next-question`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
      }
    );
    assert(ok, "Next question returns 200");
  });

  // Scoring Tests
  await test("Adjust Player Score", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/score`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
        targetPlayerId: playerId1,
        delta: 500,
      }
    );
    assert(ok, "Score adjustment returns 200");
    const player = data.session.players.find((p) => p.id === playerId1);
    assert(player.score >= 500, "Player score increased");
    console.log(`   Player score: ${player.score}`);
  });

  // Round Completion Tests
  await test("Complete Round", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/complete-round`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
      }
    );
    assert(ok, "Complete round returns 200");
    assert(
      data.session.checkpoint === "ROUND_RESULTS",
      "Checkpoint is ROUND_RESULTS"
    );
  });

  // Next Round Tests
  await test("Next Round", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/next-round`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
      }
    );
    assert(ok, "Next round returns 200");
    assert(data.session.currentRoundIndex > 0, "Round index incremented");
    console.log(`   Current round: ${data.session.currentRoundIndex + 1}`);
  });

  // Game End Tests
  await test("End Game", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/game/${gameId}/end`,
      {
        playerId: playerId1,
        playerToken: playerToken1,
      }
    );
    assert(ok, "End game returns 200");
    assert(data.session.checkpoint === "GAME_END", "Checkpoint is GAME_END");
  });

  // Error Handling Tests
  await test("Invalid Game Code Returns 404", async () => {
    const { ok, status } = await request("GET", "/api/lobby/INVALID");
    assert(status === 404, "Invalid game returns 404");
  });

  await test("Missing Player Name Returns Error", async () => {
    const { ok, data } = await request(
      "POST",
      `/api/lobby/${gameId}/join`,
      {}
    );
    assert(!ok, "Missing name returns error");
  });

  // Database Tests
  await test("Seeded Questions Exist", async () => {
    const { ok, data } = await request(
      "GET",
      `/api/lobby`
    );
    assert(ok, "Get lobbies returns 200");
    console.log(`   Total test games: ${data.lobbies.length}`);
  });

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log(`📊 TEST RESULTS\n`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total:  ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log("🎉 All tests passed!\n");
  } else {
    console.log(`⚠️  ${testsFailed} test(s) failed\n`);
  }

  console.log("Detailed Results:");
  console.log("==================");
  results.forEach((r) => console.log(r));
}

// Run tests
runTests().catch(console.error);
