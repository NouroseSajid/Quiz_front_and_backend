import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding remaining question types (CONSENSUS, TEXT_CLOSE, HIDDEN_REVEAL, BUZZER)...");

  // Get or create ADMIN game
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

  // Get Knowledge round
  let knowledgeRound = await prisma.round.findFirst({
    where: { gameId: adminGame.id, category: "Knowledge" },
  });

  if (!knowledgeRound) {
    knowledgeRound = await prisma.round.create({
      data: {
        gameId: adminGame.id,
        roundNumber: 1,
        category: "Knowledge",
        status: "ACTIVE",
      },
    });
  }

  // Get Chaos round
  let chaosRound = await prisma.round.findFirst({
    where: { gameId: adminGame.id, category: "Chaos" },
  });

  if (!chaosRound) {
    chaosRound = await prisma.round.create({
      data: {
        gameId: adminGame.id,
        roundNumber: 4,
        category: "Chaos",
        status: "ACTIVE",
      },
    });
  }

  const textCloseQuestions = [
    { text: "What year did World War II end?", correct: 1945, tolerance: 1 },
    { text: "How many countries are in the European Union (as of 2024)?", correct: 27, tolerance: 0 },
    { text: "What is the atomic number of Gold?", correct: 79, tolerance: 0 },
    { text: "How many bones does an adult human have?", correct: 206, tolerance: 5 },
    { text: "In what year was the internet invented (TCP/IP)?", correct: 1983, tolerance: 2 },
  ];

  // Get max question index in Knowledge round
  const maxKnowledgeIndex = await prisma.question.findFirst({
    where: { roundId: knowledgeRound.id },
    orderBy: { questionIndex: "desc" },
  });
  let startIndex = maxKnowledgeIndex?.questionIndex ? maxKnowledgeIndex.questionIndex + 1 : 0;

  let textCloseCount = 0;
  for (const q of textCloseQuestions) {
    const existing = await prisma.question.findFirst({
      where: {
        roundId: knowledgeRound.id,
        type: "TEXT_CLOSE",
        text: q.text,
      },
    });

    if (existing) continue;

    await prisma.question.create({
      data: {
        roundId: knowledgeRound.id,
        type: "TEXT_CLOSE",
        text: q.text,
        correct: q.correct,
        metadata: {
          tolerance: q.tolerance,
        },
        pointsMax: [100, 200, 300, 400, 500][(startIndex + textCloseCount) % 5],
        timeLimit: 30,
        questionIndex: startIndex + textCloseCount,
      },
    });

    textCloseCount++;
  }

  console.log(`✅ Seeded ${textCloseCount} TEXT_CLOSE questions`);

  const consensusQuestions = [
    {
      text: "On a scale of 1-10, how difficult is this quiz?",
      label: "Very Easy ← → Very Hard",
      min: 1,
      max: 10,
    },
    {
      text: "Rate your confidence in your answers (0-100%)",
      label: "Not Confident ← → Very Confident",
      min: 0,
      max: 100,
    },
    {
      text: "On a scale of 1-5, how fun is this game?",
      label: "Boring ← → Amazing",
      min: 1,
      max: 5,
    },
  ];

  // Get max question index in Chaos round
  const maxChaosIndex = await prisma.question.findFirst({
    where: { roundId: chaosRound.id },
    orderBy: { questionIndex: "desc" },
  });
  let chaosStartIndex = maxChaosIndex?.questionIndex ? maxChaosIndex.questionIndex + 1 : 0;

  let consensusCount = 0;
  for (const q of consensusQuestions) {
    const existing = await prisma.question.findFirst({
      where: {
        roundId: chaosRound.id,
        type: "CONSENSUS",
        text: q.text,
      },
    });

    if (existing) continue;

    await prisma.question.create({
      data: {
        roundId: chaosRound.id,
        type: "CONSENSUS",
        text: q.text,
        correct: {},
        metadata: {
          min: q.min,
          max: q.max,
          label: q.label,
        },
        pointsMax: [100, 200, 300, 400, 500][(chaosStartIndex + consensusCount) % 5],
        timeLimit: 20,
        questionIndex: chaosStartIndex + consensusCount,
      },
    });

    consensusCount++;
  }

  console.log(`✅ Seeded ${consensusCount} CONSENSUS questions`);

  const hiddenRevealQuestions = [
    {
      text: "Which planet is the 5th from the Sun? (Hint: _ _ _ _ _)",
      correct: "Jupiter",
      revealSteps: 3,
    },
    {
      text: "What is the capital of France? (Hint: _ _ _ _ _)",
      correct: "Paris",
      revealSteps: 2,
    },
    {
      text: "Who painted the Mona Lisa? (Hint: _ _ _ _ _ _ _)",
      correct: "Leonardo da Vinci",
      revealSteps: 3,
    },
  ];

  let hiddenRevealCount = 0;
  for (const q of hiddenRevealQuestions) {
    const existing = await prisma.question.findFirst({
      where: {
        roundId: knowledgeRound.id,
        type: "HIDDEN_REVEAL",
        text: q.text,
      },
    });

    if (existing) continue;

    // Recalculate index in case previous seeding added questions
    const currentMaxIndex = await prisma.question.findFirst({
      where: { roundId: knowledgeRound.id },
      orderBy: { questionIndex: "desc" },
    });
    const currentStartIndex = currentMaxIndex?.questionIndex ? currentMaxIndex.questionIndex + 1 : startIndex + textCloseCount;

    await prisma.question.create({
      data: {
        roundId: knowledgeRound.id,
        type: "HIDDEN_REVEAL",
        text: q.text,
        correct: q.correct,
        metadata: {
          revealSteps: q.revealSteps,
          timePerStep: 5,
        },
        pointsMax: [100, 200, 300, 400, 500][(currentStartIndex + hiddenRevealCount) % 5],
        timeLimit: 45,
        questionIndex: currentStartIndex + hiddenRevealCount,
      },
    });

    hiddenRevealCount++;
  }

  console.log(`✅ Seeded ${hiddenRevealCount} HIDDEN_REVEAL questions`);

  const buzzerQuestions = [
    {
      text: 'First person to buzz in gets to answer: "What does AI stand for?"',
    },
    {
      text: 'Buzz in first: "How many strings does a violin have?"',
    },
    {
      text: 'Race to buzz: "What is the smallest country in the world by area?"',
    },
    {
      text: 'Who will buzz in first? "What is the fastest land animal?"',
    },
  ];

  let buzzerCount = 0;
  for (const q of buzzerQuestions) {
    const existing = await prisma.question.findFirst({
      where: {
        roundId: chaosRound.id,
        type: "BUZZER",
        text: q.text,
      },
    });

    if (existing) continue;

    // Recalculate index in case previous seeding added questions
    const currentMaxChaosIndex = await prisma.question.findFirst({
      where: { roundId: chaosRound.id },
      orderBy: { questionIndex: "desc" },
    });
    const currentChaosStartIndex = currentMaxChaosIndex?.questionIndex ? currentMaxChaosIndex.questionIndex + 1 : chaosStartIndex + consensusCount;

    await prisma.question.create({
      data: {
        roundId: chaosRound.id,
        type: "BUZZER",
        text: q.text,
        correct: {},
        metadata: {},
        pointsMax: [100, 200, 300, 400, 500][(currentChaosStartIndex + buzzerCount) % 5],
        timeLimit: 15,
        questionIndex: currentChaosStartIndex + buzzerCount,
      },
    });

    buzzerCount++;
  }

  console.log(`✅ Seeded ${buzzerCount} BUZZER questions`);
  console.log(
    `\n✨ Total seeded: ${textCloseCount} + ${consensusCount} + ${hiddenRevealCount} + ${buzzerCount} = ${textCloseCount + consensusCount + hiddenRevealCount + buzzerCount} questions`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
