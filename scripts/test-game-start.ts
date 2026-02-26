/**
 * Test game creation and question loading
 * Run: npx tsx scripts/test-game-start.ts
 */

import { prisma } from "@/lib/prisma";
import { GameStateManager } from "@/lib/gameState";
import { GameStatePersistence } from "@/lib/gameStatePersistence";
import { randomUUID } from "crypto";

async function testGameStart() {
  try {
    console.log("\n🔍 Testing game creation and question loading...\n");

    // Step 1: Create a new game
    console.log("1️⃣ Creating game...");
    const game = await prisma.game.create({
      data: {
        code: `TEST${Date.now()}`,
        status: "LOBBY",
      },
    });
    console.log(`   ✅ Game created: ${game.id} (${game.code})`);

    // Step 2: Create session
    console.log("\n2️⃣ Creating session...");
    const session = await prisma.session.create({
      data: {
        gameId: game.id,
        hostId: randomUUID(),
        status: "LOBBY",
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log(`   ✅ Session created: ${session.id}`);

    // Step 3: Initialize in-memory session
    console.log("\n3️⃣ Initializing in-memory session...");
    GameStateManager.createSession(game.id, game.code, session.hostId);
    console.log(`   ✅ In-memory session created`);

    // Step 4: Verify game has no rounds initially
    console.log("\n4️⃣ Checking initial game state...");
    let gameWithRounds = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        rounds: {
          include: { questions: true },
        },
      },
    });
    console.log(`   Game rounds: ${gameWithRounds?.rounds.length}`);
    console.log(`   Total questions: ${gameWithRounds?.rounds.reduce((sum, r) => sum + r.questions.length, 0)}`);

    // Step 5: Simulate game start (copy from ADMIN)
    console.log("\n5️⃣ Starting game (copying questions from ADMIN)...");
    const adminGame = await prisma.game.findFirst({
      where: { code: "ADMIN" },
      include: {
        rounds: {
          include: { questions: { orderBy: { questionIndex: "asc" } } },
        },
      },
    });

    if (!adminGame || adminGame.rounds.length === 0) {
      console.log("   ❌ No ADMIN game or questions found!");
      return;
    }

    console.log(`   Found ADMIN game with ${adminGame.rounds.length} rounds`);

    // Copy rounds
    for (const srcRound of adminGame.rounds) {
      const newRound = await prisma.round.create({
        data: {
          gameId: game.id,
          roundNumber: srcRound.roundNumber,
          category: srcRound.category,
          status: "ACTIVE",
        },
      });

      console.log(`   Copying round ${srcRound.roundNumber} (${srcRound.category})...`);
      console.log(`   - Original has ${srcRound.questions.length} questions`);

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

      // Verify copy
      const copiedCount = await prisma.question.count({
        where: { roundId: newRound.id },
      });
      console.log(`   ✅ Copied ${copiedCount} questions to new round`);
    }

    // Step 6: Verify game after copy
    console.log("\n6️⃣ Verifying game after copy...");
    gameWithRounds = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        rounds: {
          include: { questions: { orderBy: { questionIndex: "asc" } } },
        },
      },
    });

    console.log(`   Game has ${gameWithRounds?.rounds.length} rounds`);
    for (const round of gameWithRounds?.rounds || []) {
      console.log(`   Round ${round.roundNumber} (${round.category}): ${round.questions.length} questions`);
    }

    const totalQuestions = gameWithRounds?.rounds.reduce((sum, r) => sum + r.questions.length, 0) || 0;
    console.log(`   ✅ Total questions copied: ${totalQuestions}`);

    // Step 7: Load into game state
    console.log("\n7️⃣ Loading first round into game state...");
    if (gameWithRounds && gameWithRounds.rounds.length > 0) {
      const firstRound = gameWithRounds.rounds[0];
      console.log(`   Loading round ${firstRound.roundNumber}: ${firstRound.questions.length} questions`);

      const questionData = firstRound.questions.map((q) => ({
        id: q.id,
        questionIndex: q.questionIndex ?? 0,
        text: q.text,
        type: q.type,
        timeLimit: q.timeLimit,
        pointsMax: q.pointsMax,
        metadata: q.metadata as Record<string, any> | undefined,
      }));

      console.log(`   Creating round state with ${questionData.length} questions`);
      const roundState = GameStateManager.startRound(
        game.id,
        firstRound.id,
        firstRound.roundNumber,
        firstRound.category,
        questionData
      );

      console.log(`   ✅ Round state created`);
      console.log(`   Round has ${roundState.questions.length} questions`);
      console.log(`   Current question index: ${roundState.currentQuestionIndex}`);
      console.log(`   First question: "${roundState.questions[0]?.text.substring(0, 60)}..."`);
      console.log(`   Last question: "${roundState.questions[roundState.questions.length - 1]?.text.substring(0, 60)}..."`);
    }

    console.log("\n✅ Test completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testGameStart();
