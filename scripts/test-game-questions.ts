/**
 * Test if questions are properly copied to games
 * Run: npx tsx scripts/test-game-questions.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function testGameQuestions() {
  try {
    console.log("\n🔍 Checking ADMIN game questions...\n");

    // Check ADMIN game
    const adminGame = await prisma.game.findFirst({
      where: { code: "ADMIN" },
      include: {
        rounds: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!adminGame) {
      console.log("❌ No ADMIN game found");
      return;
    }

    const adminQuestionCount = adminGame.rounds.reduce(
      (sum, round) => sum + round.questions.length,
      0
    );

    console.log(`✅ ADMIN game has ${adminQuestionCount} questions across ${adminGame.rounds.length} rounds\n`);

    // Check regular games
    const regularGames = await prisma.game.findMany({
      where: {
        code: { not: "ADMIN" },
      },
      include: {
        rounds: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (regularGames.length === 0) {
      console.log("ℹ️  No regular games found yet");
      console.log("   Questions will be copied when a game is started\n");
      return;
    }

    console.log(`\n🎮 Regular Games:\n`);
    for (const game of regularGames) {
      const questionCount = game.rounds.reduce(
        (sum, round) => sum + round.questions.length,
        0
      );
      console.log(`  Game ${game.code} (${game.status}):`);
      console.log(`    → ${game.rounds.length} rounds`);
      console.log(`    → ${questionCount} questions`);

      if (questionCount > 0) {
        console.log(`    ✅ Questions successfully copied!`);
      } else if (game.status === "LOBBY") {
        console.log(`    ℹ️  Questions will be copied when game starts`);
      } else {
        console.log(`    ⚠️  Warning: Active game with no questions`);
      }
    }

    console.log("");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testGameQuestions();
