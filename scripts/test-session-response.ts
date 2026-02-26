/**
 * Test to verify what session data is returned to frontend
 * Run: npx tsx scripts/test-session-response.ts
 */

import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { randomUUID } from "crypto";

async function testSessionResponse() {
  try {
    console.log("\n🔍 Testing session data returned to frontend...\n");

    // Create a new game
    const gameCode = `TEST${Date.now()}`;
    console.log(`1️⃣ Creating game: ${gameCode}`);
    
    const game = await prisma.game.create({
      data: {
        code: gameCode,
        status: "LOBBY",
      },
    });
    const hostId = randomUUID();
    
    const session = await prisma.session.create({
      data: {
        gameId: game.id,
        hostId,
        status: "LOBBY",
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    GameStateManager.createSession(game.id, gameCode, hostId);

    // Copy questions from ADMIN
    console.log("\n2️⃣ Copying questions from ADMIN game...");
    const adminGame = await prisma.game.findFirst({
      where: { code: "ADMIN" },
      include: {
        rounds: {
          include: { questions: { orderBy: { questionIndex: "asc" } } },
        },
      },
    });

    if (!adminGame) {
      console.log("❌ No ADMIN game found!");
      return;
    }

    for (const srcRound of adminGame.rounds) {
      const newRound = await prisma.round.create({
        data: {
          gameId: game.id,
          roundNumber: srcRound.roundNumber,
          category: srcRound.category,
          status: "ACTIVE",
        },
      });

      console.log(`   Round ${srcRound.roundNumber} (${srcRound.category}): copying ${srcRound.questions.length} questions...`);

      for (const srcQ of srcRound.questions) {
        await prisma.question.create({
          data: {
            roundId: newRound.id,
            type: srcQ.type,
            text: srcQ.text,
            media: srcQ.media,
            correct: srcQ.correct,
            metadata: srcQ.metadata,
            pointsMax: srcQ.pointsMax,
            timeLimit: srcQ.timeLimit,
            questionIndex: srcQ.questionIndex,
          },
        });
      }
    }

    // Start the game
    console.log("\n3️⃣ Starting game (calling startRound in GameStateManager)...");
    
    const gameWithRounds = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        rounds: {
          include: { questions: { orderBy: { questionIndex: "asc" } } },
        },
      },
    });

    if (!gameWithRounds || gameWithRounds.rounds.length === 0) {
      console.log("❌ No rounds in game!");
      return;
    }

    const firstRound = gameWithRounds.rounds[0];
    console.log(`   First round has ${firstRound.questions.length} questions`);

    const questionData = firstRound.questions.map((q) => ({
      id: q.id,
      questionIndex: q.questionIndex ?? 0,
      text: q.text,
      type: q.type,
      timeLimit: q.timeLimit,
      pointsMax: q.pointsMax,
      metadata: q.metadata as Record<string, any> | undefined,
    }));

    const roundState = GameStateManager.startRound(
      game.id,
      firstRound.id,
      firstRound.roundNumber,
      firstRound.category,
      questionData
    );

    console.log(`   ✅ Round state created with ${roundState.questions.length} questions`);

    // Now fetch the session like the frontend would
    console.log("\n4️⃣ Fetching session from GameStateManager (like frontend does)...");
    const sessionFromMemory = GameStateManager.getSession(game.id);

    if (!sessionFromMemory) {
      console.log("❌ Session not found!");
      return;
    }

    console.log(`   ✅ Session found`);
    console.log(`   - Status: ${sessionFromMemory.status}`);
    console.log(`   - Checkpoint: ${sessionFromMemory.checkpoint}`);
    console.log(`   - Rounds: ${sessionFromMemory.rounds.length}`);
    
    if (sessionFromMemory.rounds.length > 0) {
      const currentRound = sessionFromMemory.rounds[sessionFromMemory.currentRoundIndex];
      console.log(`   - Current round index: ${sessionFromMemory.currentRoundIndex}`);
      console.log(`   - Current round number: ${currentRound.roundNumber}`);
      console.log(`   - Current round category: ${currentRound.category}`);
      console.log(`   - Questions in current round: ${currentRound.questions.length}`);
      console.log(`   - Current question index: ${currentRound.currentQuestionIndex}`);
      
      if (currentRound.questions.length > 0) {
        const currentQuestion = currentRound.questions[currentRound.currentQuestionIndex];
        console.log(`   - Current question text: "${currentQuestion.text}"`);
        
        console.log(`\n   📝 All question indices in this round:`);
        currentRound.questions.forEach((q, idx) => {
          const marker = idx === currentRound.currentQuestionIndex ? " 👈 CURRENT" : "";
          console.log(`      [${idx}] Q${q.questionIndex}: "${q.text.substring(0, 50)}...${marker}"`);
        });
      }
    }

    console.log("\n✅ Session response test completed!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSessionResponse();
