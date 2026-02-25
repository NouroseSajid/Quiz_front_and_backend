import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check for ADMIN game
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
      return NextResponse.json({
        error: "No ADMIN game found",
        allGames: await prisma.game.findMany({
          select: { id: true, code: true, status: true },
        }),
      });
    }

    const questionCount = adminGame.rounds.reduce(
      (sum, round) => sum + round.questions.length,
      0
    );

    return NextResponse.json({
      adminGameId: adminGame.id,
      adminGameCode: adminGame.code,
      roundCount: adminGame.rounds.length,
      questionCount,
      rounds: adminGame.rounds.map((r) => ({
        id: r.id,
        roundNumber: r.roundNumber,
        category: r.category,
        questionCount: r.questions.length,
        questions: r.questions.map((q) => ({
          id: q.id,
          type: q.type,
          text: q.text.substring(0, 50),
          questionIndex: q.questionIndex,
        })),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    });
  }
}
