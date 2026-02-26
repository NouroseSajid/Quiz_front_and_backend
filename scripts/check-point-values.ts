/**
 * Check if all questions have same points value
 * Run: npx tsx scripts/check-point-values.ts
 */

import { prisma } from "@/lib/prisma";

async function checkPoints() {
  try {
    const adminGame = await prisma.game.findFirst({
      where: { code: "ADMIN" },
      include: {
        rounds: {
          include: {
            questions: {
              select: {
                pointsMax: true,
              }
            }
          }
        }
      }
    });

    if (!adminGame) {
      console.log("No ADMIN game found");
      return;
    }

    console.log("\n🔍 Checking point values distribution:\n");

    for (const round of adminGame.rounds) {
      const pointMaps = new Map<number, number>();
      
      round.questions.forEach(q => {
        pointMaps.set(q.pointsMax, (pointMaps.get(q.pointsMax) || 0) + 1);
      });

      const uniquePoints = Array.from(pointMaps.keys()).sort((a, b) => a - b);
      
      console.log(`Round ${round.roundNumber} (${round.category}):`);
      console.log(`  Total questions: ${round.questions.length}`);
      console.log(`  Unique point values: ${uniquePoints.length}`);
      console.log(`  Point values: ${uniquePoints.join(", ")}`);
      
      for (const [points, count] of pointMaps) {
        console.log(`    ${points} points: ${count} questions`);
      }
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPoints();
