/**
 * Seed script to generate TEXT_EXACT and TASK questions for testing
 * Run: npx tsx scripts/seed-text-task.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const TEXT_EXACT_QUESTIONS = [
  // Capital Cities (20)
  { text: "What is the capital of France?", correct: "Paris", acceptedAnswers: ["paris", "PARIS", "Paris"] },
  { text: "What is the capital of Japan?", correct: "Tokyo", acceptedAnswers: ["tokyo", "TOKYO", "Tokyo"] },
  { text: "What is the capital of Brazil?", correct: "Brasília", acceptedAnswers: ["brasilia", "Brasília"] },
  { text: "What is the capital of Australia?", correct: "Canberra", acceptedAnswers: ["canberra", "CANBERRA"] },
  { text: "What is the capital of Germany?", correct: "Berlin", acceptedAnswers: ["berlin", "BERLIN"] },
  { text: "What is the capital of Italy?", correct: "Rome", acceptedAnswers: ["rome", "ROME"] },
  { text: "What is the capital of Spain?", correct: "Madrid", acceptedAnswers: ["madrid", "MADRID"] },
  { text: "What is the capital of Mexico?", correct: "Mexico City", acceptedAnswers: ["mexico city", "Mexico City"] },
  { text: "What is the capital of Canada?", correct: "Ottawa", acceptedAnswers: ["ottawa", "OTTAWA"] },
  { text: "What is the capital of India?", correct: "New Delhi", acceptedAnswers: ["new delhi", "New Delhi"] },
  { text: "What is the capital of Russia?", correct: "Moscow", acceptedAnswers: ["moscow", "MOSCOW"] },
  { text: "What is the capital of China?", correct: "Beijing", acceptedAnswers: ["beijing", "BEIJING", "Peking"] },
  { text: "What is the capital of the United States?", correct: "Washington D.C.", acceptedAnswers: ["washington d.c.", "Washington DC"] },
  { text: "What is the capital of the United Kingdom?", correct: "London", acceptedAnswers: ["london", "LONDON"] },
  { text: "What is the capital of Thailand?", correct: "Bangkok", acceptedAnswers: ["bangkok", "BANGKOK"] },
  { text: "What is the capital of South Korea?", correct: "Seoul", acceptedAnswers: ["seoul", "SEOUL"] },
  { text: "What is the capital of Egypt?", correct: "Cairo", acceptedAnswers: ["cairo", "CAIRO"] },
  { text: "What is the capital of Nigeria?", correct: "Abuja", acceptedAnswers: ["abuja", "ABUJA"] },
  { text: "What is the capital of Argentina?", correct: "Buenos Aires", acceptedAnswers: ["buenos aires", "Buenos Aires"] },
  { text: "What is the capital of South Africa?", correct: "Pretoria", acceptedAnswers: ["pretoria", "PRETORIA"] },
  // Famous People (20)
  { text: "Who wrote the Harry Potter series?", correct: "J.K. Rowling", acceptedAnswers: ["j.k. rowling", "J.K. Rowling", "JK Rowling"] },
  { text: "Who directed the film 'Titanic'?", correct: "James Cameron", acceptedAnswers: ["james cameron", "James Cameron"] },
  { text: "Who painted the Mona Lisa?", correct: "Leonardo da Vinci", acceptedAnswers: ["leonardo da vinci", "Leonardo da Vinci"] },
  { text: "Who invented the telephone?", correct: "Alexander Graham Bell", acceptedAnswers: ["alexander graham bell", "Alexander Graham Bell"] },
  { text: "Who discovered penicillin?", correct: "Alexander Fleming", acceptedAnswers: ["alexander fleming", "Alexander Fleming"] },
  { text: "Who developed the theory of relativity?", correct: "Albert Einstein", acceptedAnswers: ["albert einstein", "Albert Einstein"] },
  { text: "Who wrote 'Pride and Prejudice'?", correct: "Jane Austen", acceptedAnswers: ["jane austen", "Jane Austen"] },
  { text: "Who was the first President of the United States?", correct: "George Washington", acceptedAnswers: ["george washington", "George Washington"] },
  { text: "Who composed 'Moonlight Sonata'?", correct: "Ludwig van Beethoven", acceptedAnswers: ["ludwig van beethoven", "Beethoven"] },
  { text: "Who painted 'Starry Night'?", correct: "Vincent van Gogh", acceptedAnswers: ["vincent van gogh", "Van Gogh"] },
  { text: "Who wrote '1984'?", correct: "George Orwell", acceptedAnswers: ["george orwell", "George Orwell"] },
  { text: "Who discovered gravity?", correct: "Isaac Newton", acceptedAnswers: ["isaac newton", "Isaac Newton"] },
  { text: "Who invented the internet?", correct: "Vint Cerf", acceptedAnswers: ["vint cerf", "Vint Cerf", "Tim Berners-Lee"] },
  { text: "Who wrote 'Romeo and Juliet'?", correct: "William Shakespeare", acceptedAnswers: ["william shakespeare", "Shakespeare"] },
  { text: "Who is the author of 'The Great Gatsby'?", correct: "F. Scott Fitzgerald", acceptedAnswers: ["f. scott fitzgerald", "F. Scott Fitzgerald"] },
  { text: "Who designed the Statue of Liberty?", correct: "Frédéric Auguste Bartholdi", acceptedAnswers: ["frederic auguste bartholdi", "Bartholdi"] },
  { text: "Who commanded the Apollo 11 mission?", correct: "Neil Armstrong", acceptedAnswers: ["neil armstrong", "Neil Armstrong"] },
  { text: "Who was the first woman to win a Nobel Prize?", correct: "Marie Curie", acceptedAnswers: ["marie curie", "Marie Curie"] },
  { text: "Who founded Microsoft?", correct: "Bill Gates", acceptedAnswers: ["bill gates", "Bill Gates"] },
  { text: "Who founded Apple?", correct: "Steve Jobs", acceptedAnswers: ["steve jobs", "Steve Jobs"] },
  // Food & Drink (10)
  { text: "What is the national dish of Greece?", correct: "Moussaka", acceptedAnswers: ["moussaka", "MOUSSAKA"] },
  { text: "What is the main ingredient in hummus?", correct: "Chickpeas", acceptedAnswers: ["chickpeas", "Chickpeas"] },
  { text: "What country is Sushi originally from?", correct: "Japan", acceptedAnswers: ["japan", "JAPAN"] },
  { text: "What is the main ingredient in guacamole?", correct: "Avocado", acceptedAnswers: ["avocado", "AVOCADO"] },
  { text: "What is the national drink of Japan?", correct: "Sake", acceptedAnswers: ["sake", "SAKE"] },
  { text: "What is the main ingredient in falafel?", correct: "Chickpeas", acceptedAnswers: ["chickpeas", "Chickpeas"] },
  { text: "What is the national dish of India?", correct: "Khichdi", acceptedAnswers: ["khichdi", "KHICHDI"] },
  { text: "What is the main ingredient in pesto?", correct: "Basil", acceptedAnswers: ["basil", "BASIL"] },
  { text: "What is the main ingredient in risotto?", correct: "Rice", acceptedAnswers: ["rice", "RICE"] },
  { text: "What is the national dish of Italy?", correct: "Pasta", acceptedAnswers: ["pasta", "PASTA"] },
];

const TASK_QUESTIONS = [
  // Physical Tasks (20)
  {
    text: "Do 10 jumping jacks and take a selfie",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Stand on one leg for 30 seconds",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Touch your toes without bending your knees",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Do a handstand for 10 seconds",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Do 20 push-ups in one minute",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Dance for 30 seconds without music",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Sing the chorus of a famous song",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Make an animal sound 5 times",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Do a cartwheel or summersault",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 90,
  },
  {
    text: "Skip rope for 30 seconds",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 90,
  },
  {
    text: "Speak in an accent for 20 seconds",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Do 30 seconds of yoga poses",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 90,
  },
  {
    text: "Show your best dance move",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Balance a spoon on your nose",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Do the splits",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 90,
  },
  {
    text: "Walk backward for 20 steps",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Stand on your head for 10 seconds",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 90,
  },
  {
    text: "Do 10 squats",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Balance on one foot while closing your eyes",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Run in place for 30 seconds",
    taskType: "physical",
    votingFormat: "top2",
    timeLimit: 60,
  },
  // Photo Tasks (20)
  {
    text: "Take a selfie making a silly face",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of something you love",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo with your feet",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of your breakfast",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of the sunset",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 600,
  },
  {
    text: "Take a group photo with everyone playing",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 180,
  },
  {
    text: "Take a photo with your pet",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of something blue",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo upside down",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a funny selfie with a friend",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of nature",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo in the mirror",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of your reflection",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of something red",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of the sky",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of your shoes",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a creative photo",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of your desk",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo of something shiny",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Take a photo with a peace sign",
    taskType: "photo",
    votingFormat: "top2",
    timeLimit: 120,
  },
  // Text Tasks (10)
  {
    text: "Write a haiku about the game",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Write a funny tweet",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Describe your pet in one sentence",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Write a joke",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Write a motivational quote",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Write a love letter to your favorite food",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Write a movie title in one word",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Write an acrostic poem about your name",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
  {
    text: "Describe yourself in 3 words",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 60,
  },
  {
    text: "Write the worst movie review ever",
    taskType: "text",
    votingFormat: "top2",
    timeLimit: 120,
  },
];

async function seedTextTaskQuestions() {
  try {
    console.log("🌱 Seeding TEXT_EXACT and TASK questions...");

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

    // Create rounds
    let knowledgeRound = await prisma.round.findFirst({
      where: {
        gameId: adminGame.id,
        category: "Knowledge",
      },
    });

    let chaosRound = await prisma.round.findFirst({
      where: {
        gameId: adminGame.id,
        category: "Chaos",
      },
    });

    if (!chaosRound) {
      const roundCount = await prisma.round.count({
        where: { gameId: adminGame.id },
      });

      chaosRound = await prisma.round.create({
        data: {
          gameId: adminGame.id,
          roundNumber: roundCount + 1,
          category: "Chaos",
          status: "ACTIVE",
        },
      });
    }

    // Seed TEXT_EXACT questions
    console.log("\n📝 Seeding TEXT_EXACT questions to Knowledge round...");
    let textCount = 0;
    const textExistingCount = await prisma.question.count({
      where: { roundId: knowledgeRound!.id },
    });

    for (const q of TEXT_EXACT_QUESTIONS) {
      const existing = await prisma.question.findFirst({
        where: {
          roundId: knowledgeRound!.id,
          text: q.text,
        },
      });

      if (existing) continue;

      await prisma.question.create({
        data: {
          roundId: knowledgeRound!.id,
          type: "TEXT_EXACT",
          text: q.text,
          correct: q.correct,
          metadata: {
            acceptedAnswers: q.acceptedAnswers,
          },
          pointsMax: [100, 200, 300, 400, 500][(textExistingCount + textCount) % 5],
          timeLimit: 30,
          questionIndex: textExistingCount + textCount,
        },
      });

      textCount++;
      if (textCount % 10 === 0) {
        console.log(`✓ Added ${textCount} TEXT_EXACT questions...`);
      }
    }

    // Seed TASK questions
    console.log("\n🎯 Seeding TASK questions to Chaos round...");
    let taskCount = 0;
    const taskExistingCount = await prisma.question.count({
      where: { roundId: chaosRound.id },
    });

    for (const q of TASK_QUESTIONS) {
      const text = q.text;
      const existing = await prisma.question.findFirst({
        where: {
          roundId: chaosRound.id,
          text,
        },
      });

      if (existing) continue;

      await prisma.question.create({
        data: {
          roundId: chaosRound.id,
          type: "TASK",
          text,
          correct: {},
          metadata: {
            taskType: q.taskType,
            votingFormat: q.votingFormat,
          },
          pointsMax: [100, 200, 300, 400, 500][(taskExistingCount + taskCount) % 5],
          timeLimit: q.timeLimit,
          questionIndex: taskExistingCount + taskCount,
        },
      });

      taskCount++;
      if (taskCount % 10 === 0) {
        console.log(`✓ Added ${taskCount} TASK questions...`);
      }
    }

    console.log(`\n✅ Successfully seeded ${textCount} TEXT_EXACT + ${taskCount} TASK questions!`);

    const textTotal = await prisma.question.count({
      where: { roundId: knowledgeRound!.id },
    });
    const taskTotal = await prisma.question.count({
      where: { roundId: chaosRound.id },
    });

    console.log(`📈 Knowledge round now has ${textTotal} questions`);
    console.log(`📈 Chaos round now has ${taskTotal} questions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTextTaskQuestions();
