/**
 * Check existing questions in the database
 * Run: npx tsx scripts/check-questions.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function checkQuestions() {
  try {
    // Check for ADMIN game
    const adminGame = await prisma.game.findFirst({
      where: { code: "ADMIN" },
      include: {
        rounds: {
          include: {
            _count: {
              select: { questions: true }
            }
          }
        }
      }
    });

    if (!adminGame) {
      console.log("❌ No ADMIN game found in database");
      console.log("Run seed scripts to populate questions:");
      console.log("  npx tsx scripts/seed-mcq.ts");
      console.log("  npx tsx scripts/seed-geo.ts");
      console.log("  npx tsx scripts/seed-range.ts");
      console.log("  etc.");
      return;
    }

    console.log("✅ Found ADMIN game (ID: " + adminGame.id + ")");
    console.log("\n📊 Rounds and Questions:\n");

    if (adminGame.rounds.length === 0) {
      console.log("❌ No rounds found in ADMIN game");
      console.log("Run seed scripts to populate questions.");
      return;
    }

    let totalQuestions = 0;
    for (const round of adminGame.rounds) {
      console.log(`  Round ${round.roundNumber}: ${round.category}`);
      console.log(`    → ${round._count.questions} questions`);
      totalQuestions += round._count.questions;
    }

    console.log(`\n📈 Total: ${adminGame.rounds.length} rounds, ${totalQuestions} questions`);
    
    if (totalQuestions > 0) {
      console.log("\n✅ These questions will be automatically copied to new lobbies when the host starts a game!");
    } else {
      console.log("\n⚠️  No questions found. Run seed scripts to add questions.");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestions();
