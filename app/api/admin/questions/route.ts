import { NextRequest, NextResponse } from "next/server";
import type { QuestionInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = (await request.json()) as QuestionInput;

    // Validate required fields
    if (!body.text || !body.type || !body.difficulty || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For now, create a default game if one doesn't exist
    let adminGame = await prisma.game.findFirst({
      where: { code: "ADMIN" },
    });

    if (!adminGame) {
      adminGame = await prisma.game.create({
        data: {
          code: "ADMIN",
          status: "LOBBY",
        },
      });
    }

    // Get or create a round for this category
    let adminRound = await prisma.round.findFirst({
      where: {
        gameId: adminGame.id,
        category: body.category,
      },
    });

    if (!adminRound) {
      // Count existing rounds in this game to set roundNumber
      const roundCount = await prisma.round.count({
        where: { gameId: adminGame.id },
      });

      adminRound = await prisma.round.create({
        data: {
          gameId: adminGame.id,
          roundNumber: roundCount + 1,
          category: body.category,
          status: "ACTIVE",
        },
      });
    }

    // Get the next question index
    const questionCount = await prisma.question.count({
      where: { roundId: adminRound.id },
    });

    // Create the question
    const question = await prisma.question.create({
      data: {
        roundId: adminRound.id,
        type: body.type,
        text: body.text,
        correct: body.correct,
        metadata: body.metadata,
        pointsMax: body.pointsMax || 1000,
        timeLimit: body.timeLimit || 30,
        questionIndex: questionCount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        question,
        message: `Question created in ${body.category} category`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create question",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
 
    // Get all questions from the ADMIN game
    const questions = await prisma.question.findMany({
      where: {
        round: {
          game: {
            code: "ADMIN",
          },
        },
      },
      include: {
        round: true,
      },
      orderBy: [
        { round: { category: "asc" } },
        { questionIndex: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      questions,
      totalCount: questions.length,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch questions",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const { id, text, type, correct, metadata, pointsMax, timeLimit } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    // Update the question
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(type !== undefined && { type }),
        ...(correct !== undefined && { correct }),
        ...(metadata !== undefined && { metadata }),
        ...(pointsMax !== undefined && { pointsMax }),
        ...(timeLimit !== undefined && { timeLimit }),
      },
    });

    return NextResponse.json({
      success: true,
      question,
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update question",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    // Delete the question
    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete question",
      },
      { status: 500 }
    );
  }
}
