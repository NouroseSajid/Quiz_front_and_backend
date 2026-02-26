/**
 * Seed script to generate 100 RANGE questions for testing
 * Run: npx tsx scripts/seed-range.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const RANGE_QUESTIONS = [
  // Population & Demographics (25)
  {
    text: "What is the population of China (in billions)?",
    min: 1.0,
    max: 2.0,
    tolerance: 0.1,
    correct: 1.42,
  },
  {
    text: "What is the population of India (in billions)?",
    min: 1.0,
    max: 2.0,
    tolerance: 0.1,
    correct: 1.41,
  },
  {
    text: "What is the population of the United States (in hundreds of millions)?",
    min: 3.0,
    max: 3.5,
    tolerance: 0.1,
    correct: 3.31,
  },
  {
    text: "What is the population of Brazil (in hundreds of millions)?",
    min: 2.0,
    max: 2.3,
    tolerance: 0.1,
    correct: 2.17,
  },
  {
    text: "What is the population of Indonesia (in hundreds of millions)?",
    min: 2.5,
    max: 2.8,
    tolerance: 0.1,
    correct: 2.75,
  },
  {
    text: "What is the population of Russia (in hundreds of millions)?",
    min: 1.4,
    max: 1.8,
    tolerance: 0.1,
    correct: 1.46,
  },
  {
    text: "What is the population of Nigeria (in hundreds of millions)?",
    min: 2.0,
    max: 2.3,
    tolerance: 0.1,
    correct: 2.23,
  },
  {
    text: "What is the population of Pakistan (in hundreds of millions)?",
    min: 2.2,
    max: 2.5,
    tolerance: 0.1,
    correct: 2.34,
  },
  {
    text: "What is the population of Japan (in hundreds of millions)?",
    min: 1.2,
    max: 1.3,
    tolerance: 0.05,
    correct: 1.25,
  },
  {
    text: "What is the population of Mexico (in hundreds of millions)?",
    min: 1.2,
    max: 1.3,
    tolerance: 0.05,
    correct: 1.28,
  },
  {
    text: "What is the population of the UK (in tens of millions)?",
    min: 6.5,
    max: 6.8,
    tolerance: 0.1,
    correct: 6.71,
  },
  {
    text: "What is the population of France (in tens of millions)?",
    min: 6.5,
    max: 7.0,
    tolerance: 0.1,
    correct: 6.71,
  },
  {
    text: "What is the population of Germany (in tens of millions)?",
    min: 8.0,
    max: 8.5,
    tolerance: 0.1,
    correct: 8.36,
  },
  {
    text: "What is the population of Italy (in tens of millions)?",
    min: 5.8,
    max: 6.2,
    tolerance: 0.1,
    correct: 5.99,
  },
  {
    text: "What is the population of Spain (in tens of millions)?",
    min: 4.5,
    max: 4.9,
    tolerance: 0.1,
    correct: 4.77,
  },
  {
    text: "What is the population of Canada (in tens of millions)?",
    min: 3.8,
    max: 4.2,
    tolerance: 0.1,
    correct: 4.01,
  },
  {
    text: "What is the population of Australia (in tens of millions)?",
    min: 2.5,
    max: 2.7,
    tolerance: 0.05,
    correct: 2.63,
  },
  {
    text: "What is the population of South Korea (in tens of millions)?",
    min: 5.0,
    max: 5.3,
    tolerance: 0.1,
    correct: 5.14,
  },
  {
    text: "What is the population of Thailand (in tens of millions)?",
    min: 6.9,
    max: 7.2,
    tolerance: 0.1,
    correct: 7.05,
  },
  {
    text: "What is the population of Turkey (in tens of millions)?",
    min: 8.0,
    max: 8.5,
    tolerance: 0.1,
    correct: 8.38,
  },
  {
    text: "What is the population of Greece (in millions)?",
    min: 10.5,
    max: 10.9,
    tolerance: 0.1,
    correct: 10.72,
  },
  {
    text: "What is the population of Portugal (in millions)?",
    min: 10.3,
    max: 10.6,
    tolerance: 0.1,
    correct: 10.41,
  },
  {
    text: "What is the population of New Zealand (in millions)?",
    min: 5.0,
    max: 5.2,
    tolerance: 0.1,
    correct: 5.12,
  },
  {
    text: "What is the population of Singapore (in millions)?",
    min: 5.6,
    max: 5.9,
    tolerance: 0.1,
    correct: 5.74,
  },
  {
    text: "What is the population of Norway (in millions)?",
    min: 5.3,
    max: 5.6,
    tolerance: 0.1,
    correct: 5.45,
  },
  // Geography & Distance (25)
  {
    text: "What is the height of Mount Everest (in kilometers)?",
    min: 8.8,
    max: 8.9,
    tolerance: 0.05,
    correct: 8.849,
  },
  {
    text: "What is the distance from Earth to the Moon (in thousand kilometers)?",
    min: 380,
    max: 390,
    tolerance: 5,
    correct: 384.4,
  },
  {
    text: "What is the circumference of the Earth at the equator (in thousand kilometers)?",
    min: 40,
    max: 41,
    tolerance: 0.1,
    correct: 40.075,
  },
  {
    text: "What is the height of the Great Wall of China (in meters, on average)?",
    min: 6.0,
    max: 8.0,
    tolerance: 0.5,
    correct: 7.0,
  },
  {
    text: "What is the length of the Nile River (in thousand kilometers)?",
    min: 6.6,
    max: 6.8,
    tolerance: 0.1,
    correct: 6.65,
  },
  {
    text: "What is the length of the Amazon River (in thousand kilometers)?",
    min: 6.2,
    max: 6.5,
    tolerance: 0.1,
    correct: 6.4,
  },
  {
    text: "What is the area of the Sahara Desert (in million square kilometers)?",
    min: 8.5,
    max: 9.5,
    tolerance: 0.2,
    correct: 9.0,
  },
  {
    text: "What is the depth of the Mariana Trench (in kilometers)?",
    min: 10.9,
    max: 11.0,
    tolerance: 0.1,
    correct: 10.96,
  },
  {
    text: "What is the area of the Mediterranean Sea (in million square kilometers)?",
    min: 2.4,
    max: 2.6,
    tolerance: 0.1,
    correct: 2.5,
  },
  {
    text: "What is the area of the Great Lakes (in thousand square kilometers)?",
    min: 244,
    max: 246,
    tolerance: 1,
    correct: 245.3,
  },
  {
    text: "What is the height of the Statue of Liberty (including pedestal, in meters)?",
    min: 92,
    max: 94,
    tolerance: 0.5,
    correct: 93,
  },
  {
    text: "What is the width of the Grand Canyon (in kilometers, on average)?",
    min: 15,
    max: 25,
    tolerance: 2,
    correct: 20,
  },
  {
    text: "What is the length of the English Channel (in kilometers)?",
    min: 33,
    max: 34,
    tolerance: 0.5,
    correct: 33.3,
  },
  {
    text: "What is the area of Lake Baikal (in thousand square kilometers)?",
    min: 23,
    max: 24,
    tolerance: 0.2,
    correct: 23.6,
  },
  {
    text: "What is the height of Kilimanjaro (in kilometers)?",
    min: 5.8,
    max: 5.9,
    tolerance: 0.05,
    correct: 5.89,
  },
  {
    text: "What is the height of Mont Blanc (in kilometers)?",
    min: 4.8,
    max: 4.9,
    tolerance: 0.05,
    correct: 4.81,
  },
  {
    text: "What is the area of the Dead Sea (in square kilometers)?",
    min: 560,
    max: 600,
    tolerance: 10,
    correct: 580,
  },
  {
    text: "What is the average elevation of Australia (in meters)?",
    min: 300,
    max: 400,
    tolerance: 20,
    correct: 330,
  },
  {
    text: "What is the distance from London to New York (in thousand kilometers)?",
    min: 5.5,
    max: 5.6,
    tolerance: 0.05,
    correct: 5.57,
  },
  {
    text: "What is the distance from New York to Los Angeles (in thousand kilometers)?",
    min: 4.1,
    max: 4.2,
    tolerance: 0.05,
    correct: 4.13,
  },
  {
    text: "What is the length of the Panama Canal (in kilometers)?",
    min: 50,
    max: 52,
    tolerance: 0.5,
    correct: 51.4,
  },
  {
    text: "What is the area of Vatican City (in square kilometers)?",
    min: 0.4,
    max: 0.6,
    tolerance: 0.05,
    correct: 0.44,
  },
  // Science & Physics (25)
  {
    text: "What is the speed of sound in air (in meters per second)?",
    min: 340,
    max: 350,
    tolerance: 2,
    correct: 343,
  },
  {
    text: "What is the boiling point of water at sea level (in Celsius)?",
    min: 99,
    max: 101,
    tolerance: 0.5,
    correct: 100,
  },
  {
    text: "What is the freezing point of water in Celsius?",
    min: -1,
    max: 1,
    tolerance: 0.5,
    correct: 0,
  },
  {
    text: "What is the speed of light (in million km/s)?",
    min: 299,
    max: 301,
    tolerance: 0.5,
    correct: 299.8,
  },
  {
    text: "What is the mass of the Earth (in septillion kg)?",
    min: 5.9,
    max: 6.0,
    tolerance: 0.1,
    correct: 5.97,
  },
  {
    text: "What is the distance from Earth to the Sun (in million km)?",
    min: 149,
    max: 151,
    tolerance: 0.5,
    correct: 149.6,
  },
  {
    text: "What is the average temperature at the Earth's core (in thousand Celsius)?",
    min: 5.0,
    max: 7.0,
    tolerance: 0.5,
    correct: 6.0,
  },
  {
    text: "What is the atomic mass of Carbon-12 (in atomic mass units)?",
    min: 11.9,
    max: 12.1,
    tolerance: 0.05,
    correct: 12.0,
  },
  {
    text: "What is the density of water (in g/cm³)?",
    min: 0.99,
    max: 1.01,
    tolerance: 0.01,
    correct: 1.0,
  },
  {
    text: "What is the absolute zero temperature (in Celsius)?",
    min: -273.2,
    max: -273.1,
    tolerance: 0.05,
    correct: -273.15,
  },
  {
    text: "What is the gravitational constant G (in 10^-11 m³/kg/s²)?",
    min: 6.6,
    max: 6.7,
    tolerance: 0.05,
    correct: 6.67,
  },
  {
    text: "What is the charge of an electron (in 10^-19 Coulombs)?",
    min: 1.5,
    max: 1.7,
    tolerance: 0.05,
    correct: 1.6,
  },
  {
    text: "What is the mass of a proton (in 10^-27 kg)?",
    min: 1.6,
    max: 1.7,
    tolerance: 0.05,
    correct: 1.67,
  },
  {
    text: "What is the mass of an electron (in 10^-30 kg)?",
    min: 9.1,
    max: 9.2,
    tolerance: 0.05,
    correct: 9.11,
  },
  {
    text: "What is Planck's constant (in 10^-34 Joule seconds)?",
    min: 6.6,
    max: 6.7,
    tolerance: 0.05,
    correct: 6.63,
  },
  {
    text: "What is the Avogadro number (in 10^23 molecules/mol)?",
    min: 6.0,
    max: 6.1,
    tolerance: 0.05,
    correct: 6.02,
  },
  {
    text: "What is the speed of sound in water (in meters per second)?",
    min: 1480,
    max: 1490,
    tolerance: 5,
    correct: 1484,
  },
  {
    text: "What is the melting point of iron (in Celsius)?",
    min: 1535,
    max: 1540,
    tolerance: 2,
    correct: 1538,
  },
  {
    text: "What is the melting point of gold (in Celsius)?",
    min: 1063,
    max: 1065,
    tolerance: 1,
    correct: 1064,
  },
  {
    text: "What is the half-life of Carbon-14 (in years)?",
    min: 5700,
    max: 5800,
    tolerance: 50,
    correct: 5730,
  },
  {
    text: "What is the surface temperature of the Sun (in Celsius)?",
    min: 5750,
    max: 5850,
    tolerance: 50,
    correct: 5778,
  },
  {
    text: "What is the mass of the Sun (in septillion kg)?",
    min: 1980,
    max: 2020,
    tolerance: 20,
    correct: 1989,
  },
  {
    text: "What is the radius of the Earth (in kilometers)?",
    min: 6370,
    max: 6380,
    tolerance: 5,
    correct: 6371,
  },
  {
    text: "What is the escape velocity from Earth (in km/s)?",
    min: 11.1,
    max: 11.3,
    tolerance: 0.1,
    correct: 11.2,
  },
  // Economics & Finance (25)
  {
    text: "What is the unemployment rate in the US (in percent)?",
    min: 3.5,
    max: 4.5,
    tolerance: 0.5,
    correct: 4.0,
  },
  {
    text: "What is the world's largest stock exchange by market cap (NASDAQ, in trillion USD)?",
    min: 35,
    max: 40,
    tolerance: 2,
    correct: 37.5,
  },
  {
    text: "What is the world's GDP (in quintillion USD)?",
    min: 110,
    max: 120,
    tolerance: 2,
    correct: 115,
  },
  {
    text: "What is the average house price in the US (in thousand USD)?",
    min: 420,
    max: 450,
    tolerance: 10,
    correct: 435,
  },
  {
    text: "What is the minimum wage in the US (in USD per hour)?",
    min: 7.0,
    max: 7.3,
    tolerance: 0.2,
    correct: 7.25,
  },
  {
    text: "What is the inflation rate globally (in percent)?",
    min: 3.0,
    max: 4.0,
    tolerance: 0.5,
    correct: 3.5,
  },
  {
    text: "What is the average price of a Tesla Model 3 (in USD)?",
    min: 40000,
    max: 50000,
    tolerance: 2000,
    correct: 45000,
  },
  {
    text: "What is the average salary in the tech industry (in USD)?",
    min: 100000,
    max: 150000,
    tolerance: 10000,
    correct: 125000,
  },
  {
    text: "What is the price of Bitcoin (in USD)?",
    min: 40000,
    max: 70000,
    tolerance: 5000,
    correct: 55000,
  },
  {
    text: "What is the crude oil price (in USD per barrel)?",
    min: 70,
    max: 90,
    tolerance: 5,
    correct: 80,
  },
  {
    text: "What is the Federal Funds Rate (in percent)?",
    min: 4.0,
    max: 5.5,
    tolerance: 0.5,
    correct: 4.75,
  },
  {
    text: "What is the S&P 500 index level?",
    min: 4500,
    max: 5000,
    tolerance: 100,
    correct: 4750,
  },
  {
    text: "What is the US national debt (in trillion USD)?",
    min: 30,
    max: 35,
    tolerance: 1,
    correct: 32.5,
  },
  {
    text: "What is the average rent in NYC (in USD per month)?",
    min: 3500,
    max: 4000,
    tolerance: 200,
    correct: 3750,
  },
  {
    text: "What is the average salary of a lawyer in the US (in USD)?",
    min: 100000,
    max: 150000,
    tolerance: 10000,
    correct: 125000,
  },
  {
    text: "What is the average price of a gallon of gasoline in the US (in USD)?",
    min: 3.0,
    max: 3.5,
    tolerance: 0.2,
    correct: 3.25,
  },
  {
    text: "What is the price of an ounce of gold (in USD)?",
    min: 1800,
    max: 2000,
    tolerance: 50,
    correct: 1900,
  },
  {
    text: "What is the market cap of Apple (in trillion USD)?",
    min: 2.5,
    max: 3.0,
    tolerance: 0.1,
    correct: 2.75,
  },
  {
    text: "What is the market cap of Microsoft (in trillion USD)?",
    min: 2.4,
    max: 2.9,
    tolerance: 0.1,
    correct: 2.65,
  },
  {
    text: "What is the average cost of a college education in the US (in USD)?",
    min: 100000,
    max: 150000,
    tolerance: 10000,
    correct: 125000,
  },
  {
    text: "What is the price of a movie ticket in the US (in USD)?",
    min: 9.0,
    max: 11.0,
    tolerance: 0.5,
    correct: 10.0,
  },
  {
    text: "What is the average cost of a car in the US (in USD)?",
    min: 40000,
    max: 50000,
    tolerance: 2000,
    correct: 45000,
  },
  {
    text: "What is the US trade deficit (in billion USD)?",
    min: 500,
    max: 700,
    tolerance: 50,
    correct: 600,
  },
  {
    text: "What is the average interest rate on a mortgage (in percent)?",
    min: 6.5,
    max: 7.5,
    tolerance: 0.3,
    correct: 7.0,
  },
  {
    text: "What is the price of a cup of coffee in Starbucks (in USD)?",
    min: 5.0,
    max: 6.0,
    tolerance: 0.3,
    correct: 5.5,
  },
];

async function seedRangeQuestions() {
  try {
    console.log("🌱 Seeding 100 RANGE questions...");

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

    // Get or create Precision round
    let precisionRound = await prisma.round.findFirst({
      where: {
        gameId: adminGame.id,
        category: "Precision",
      },
    });

    if (!precisionRound) {
      const roundCount = await prisma.round.count({
        where: { gameId: adminGame.id },
      });

      precisionRound = await prisma.round.create({
        data: {
          gameId: adminGame.id,
          roundNumber: roundCount + 1,
          category: "Precision",
          status: "ACTIVE",
        },
      });
    }

    const existingCount = await prisma.question.count({
      where: { roundId: precisionRound.id },
    });

    let addedCount = 0;
    for (const q of RANGE_QUESTIONS) {
      const existing = await prisma.question.findFirst({
        where: {
          roundId: precisionRound.id,
          text: q.text,
        },
      });

      if (existing) {
        console.log(`⊘ Skipping duplicate: "${q.text.substring(0, 40)}..."`);
        continue;
      }

      await prisma.question.create({
        data: {
          roundId: precisionRound.id,
          type: "RANGE",
          text: q.text,
          correct: q.correct,
          metadata: {
            min: q.min,
            max: q.max,
            tolerance: q.tolerance,
          },
          pointsMax: [100, 200, 300, 400, 500][(existingCount + addedCount) % 5],
          timeLimit: 45,
          questionIndex: existingCount + addedCount,
        },
      });

      addedCount++;
      if (addedCount % 10 === 0) {
        console.log(`✓ Added ${addedCount} questions...`);
      }
    }

    console.log(`\n✅ Successfully seeded ${addedCount} RANGE questions!`);

    const totalQuestions = await prisma.question.count({
      where: { roundId: precisionRound.id },
    });
    console.log(`📈 Precision round now has ${totalQuestions} questions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedRangeQuestions();
