/**
 * Delete all existing questions to allow re-seeding with new point values
 * Run: npx tsx scripts/reset-questions.ts
 */

import { prisma } from "@/lib/prisma";

async function resetQuestions() {
  try {
    console.log("🗑️  Deleting all questions from ADMIN game...\n");

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
      console.log("❌ No ADMIN game found");
      return;
    }

    for (const round of adminGame.rounds) {
      console.log(`Deleting ${round._count.questions} questions from Round ${round.roundNumber} (${round.category})...`);
      
      await prisma.question.deleteMany({
        where: { roundId: round.id }
      });
    }

    console.log("\n✅ All questions deleted!");
    console.log("📝 You can now re-run the seed scripts to regenerate with new point values.\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetQuestions();
