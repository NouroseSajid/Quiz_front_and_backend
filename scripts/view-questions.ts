/**
 * View all questions in the database
 * Run: npx tsx scripts/view-questions.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function viewQuestions() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        round: {
          select: {
            roundNumber: true,
            category: true
          }
        }
      },
      orderBy: [
        { round: { roundNumber: "asc" } },
        { questionIndex: "asc" }
      ]
    });

    console.log(`\n📋 Total Questions: ${questions.length}\n`);
    console.log("=" .repeat(100));

    let currentRound = 0;
    for (const q of questions) {
      if (q.round.roundNumber !== currentRound) {
        currentRound = q.round.roundNumber;
        console.log(`\n🎮 ROUND ${currentRound}: ${q.round.category.toUpperCase()}`);
        console.log("=".repeat(100));
      }

      console.log(`\n  [Q${q.questionIndex + 1}] Type: ${q.type}`);
      console.log(`  Text: ${q.text}`);
      if (q.media) console.log(`  Media: ${q.media}`);
      console.log(`  Correct: ${JSON.stringify(q.correct)}`);
      console.log(`  Metadata: ${JSON.stringify(q.metadata)}`);
      console.log(`  Points: ${q.pointsMax} | Time: ${q.timeLimit}s`);
      console.log(`  ID: ${q.id}`);
    }

    console.log("\n" + "=".repeat(100));
    console.log(`✅ Displayed ${questions.length} questions\n`);

  } catch (error) {
    console.error("❌ Error querying questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

viewQuestions();
