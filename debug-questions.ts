import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function debug() {
  const adminGame = await prisma.game.findFirst({
    where: { code: "ADMIN" },
    include: {
      rounds: {
        include: {
          questions: {
            select: {
              id: true,
              questionIndex: true,
              text: true,
              roundId: true
            },
            orderBy: { questionIndex: "asc" }
          }
        },
        orderBy: { roundNumber: "asc" }
      }
    }
  });

  if (!adminGame) {
    console.log("No ADMIN game found");
    process.exit(0);
  }

  console.log(`ADMIN Game: ${adminGame.id}`);
  console.log(`Total Rounds: ${adminGame.rounds.length}`);
  
  for (const round of adminGame.rounds) {
    console.log(`\nRound ${round.roundNumber} (${round.category}): ${round.questions.length} questions`);
    console.log("  questionIndex values:");
    const indices = round.questions.map(q => q.questionIndex).sort((a, b) => a - b);
    console.log(`    Min: ${Math.min(...indices)}, Max: ${Math.max(...indices)}`);
    console.log("  First 5 questions:");
    round.questions.slice(0, 5).forEach(q => {
      console.log(`    [${q.questionIndex}] ${q.text.substring(0, 50)}`);
    });
  }
}

debug().then(() => process.exit(0));
