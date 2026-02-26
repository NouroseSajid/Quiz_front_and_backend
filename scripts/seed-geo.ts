/**
 * Seed script to generate 100 GEO questions for testing
 * Run: npx tsx scripts/seed-geo.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const GEO_QUESTIONS = [
  // Major Cities (50)
  {
    text: "Where is the Eiffel Tower located?",
    lat: 48.8584,
    lng: 2.2945,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is Big Ben located?",
    lat: 51.4975,
    lng: -0.1247,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Statue of Liberty located?",
    lat: 40.6892,
    lng: -74.0445,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Christ the Redeemer statue located?",
    lat: -22.9519,
    lng: -43.2105,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Great Wall of China located?",
    lat: 40.3548,
    lng: 116.0727,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Colosseum located?",
    lat: 41.8902,
    lng: 12.4924,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Taj Mahal located?",
    lat: 27.1751,
    lng: 78.0421,
    scope: "city",
    tolerance: 1.0,
  },
  {
    text: "Where is the Sagrada Familia located?",
    lat: 41.4036,
    lng: 2.1744,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Leaning Tower of Pisa located?",
    lat: 43.3832,
    lng: 10.3964,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Machu Picchu located?",
    lat: -13.1631,
    lng: -72.5449,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Golden Gate Bridge located?",
    lat: 37.8199,
    lng: -122.4783,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Kremlin located?",
    lat: 55.75,
    lng: 37.6167,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Sydney Opera House located?",
    lat: -33.8568,
    lng: 151.2153,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Great Pyramid of Giza located?",
    lat: 29.9792,
    lng: 31.1342,
    scope: "city",
    tolerance: 1.0,
  },
  {
    text: "Where is the Liberty Bell located?",
    lat: 39.9486,
    lng: -75.1502,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is Tower Bridge located?",
    lat: 51.5055,
    lng: -0.0754,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Space Needle located?",
    lat: 47.6205,
    lng: -122.3493,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Hollywood Sign located?",
    lat: 34.1381,
    lng: -118.3205,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is Buckingham Palace located?",
    lat: 51.5007,
    lng: -0.1418,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Brandenburg Gate located?",
    lat: 52.516,
    lng: 13.3889,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Forbidden City located?",
    lat: 39.9163,
    lng: 116.3972,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is Big Ben (Elizabeth Tower) located?",
    lat: 51.4975,
    lng: -0.1247,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is Niagara Falls located?",
    lat: 43.0896,
    lng: -79.0849,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Statue of Liberty located?",
    lat: 40.6892,
    lng: -74.0445,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Acropolis located?",
    lat: 37.9715,
    lng: 23.7267,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is Angkor Wat located?",
    lat: 13.3667,
    lng: 103.8667,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Burj Khalifa located?",
    lat: 25.1972,
    lng: 55.2744,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Parthenon located?",
    lat: 37.9715,
    lng: 23.7267,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the White House located?",
    lat: 38.8951,
    lng: -77.0369,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Arc de Triomphe located?",
    lat: 48.8738,
    lng: 2.295,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Louvre Museum located?",
    lat: 48.8606,
    lng: 2.3352,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Vatican located?",
    lat: 41.9029,
    lng: 12.4534,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is St. Peter's Basilica located?",
    lat: 41.9029,
    lng: 12.4534,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Westminster Abbey located?",
    lat: 51.4955,
    lng: -0.1272,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Tower of London located?",
    lat: 51.5055,
    lng: -0.0754,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Uffizi Gallery located?",
    lat: 43.7681,
    lng: 11.2557,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Notre-Dame Cathedral located?",
    lat: 48.853,
    lng: 2.3499,
    scope: "city",
    tolerance: 0.5,
  },
  {
    text: "Where is the Chichen Itza located?",
    lat: 20.6843,
    lng: -87.1921,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Great Barrier Reef located?",
    lat: -16.2859,
    lng: 145.7781,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Galápagos Islands located?",
    lat: -0.1667,
    lng: -90.4833,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Dead Sea located?",
    lat: 31.5,
    lng: 35.5,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Mount Kilimanjaro located?",
    lat: -3.0674,
    lng: 37.3556,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Sahara Desert located?",
    lat: 25.0,
    lng: 15.0,
    scope: "continent",
    tolerance: 5.0,
  },
  {
    text: "Where is Victoria Falls located?",
    lat: -17.9245,
    lng: 25.8537,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is Iceland located?",
    lat: 64.9631,
    lng: -19.0208,
    scope: "country",
    tolerance: 3.0,
  },
  {
    text: "Where is the Fjords of Norway located?",
    lat: 60.9912,
    lng: 5.7331,
    scope: "region",
    tolerance: 3.0,
  },
  {
    text: "Where is the Swiss Alps located?",
    lat: 46.9479,
    lng: 10.4474,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Andes Mountains located?",
    lat: -9.193,
    lng: -75.0152,
    scope: "continent",
    tolerance: 5.0,
  },
  {
    text: "Where is the Rocky Mountains located?",
    lat: 55.0,
    lng: -115.0,
    scope: "continent",
    tolerance: 5.0,
  },
  // Natural Landmarks (50)
  {
    text: "Where is the Grand Canyon located?",
    lat: 36.2288,
    lng: -112.2627,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Amazon Rainforest located?",
    lat: -5.0,
    lng: -63.0,
    scope: "continent",
    tolerance: 5.0,
  },
  {
    text: "Where is the Serengeti located?",
    lat: -2.3333,
    lng: 34.8333,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is Yellowstone National Park located?",
    lat: 44.7258,
    lng: -110.496,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Everglades located?",
    lat: 25.4,
    lng: -80.9,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Panama Canal located?",
    lat: 9.0915,
    lng: -79.5824,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is Moab, Utah located?",
    lat: 38.5733,
    lng: -109.5898,
    scope: "city",
    tolerance: 1.0,
  },
  {
    text: "Where is the Dolomites located?",
    lat: 46.413,
    lng: 12.0,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Black Forest located?",
    lat: 48.5,
    lng: 8.0,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Lake District located?",
    lat: 54.4609,
    lng: -3.2034,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Scottish Highlands located?",
    lat: 56.8,
    lng: -4.5,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Plitvice Lakes located?",
    lat: 46.6907,
    lng: 15.8206,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Lofoten Islands located?",
    lat: 68.5,
    lng: 13.0,
    scope: "region",
    tolerance: 2.0,
  },
  {
    text: "Where is the Bay of Kotor located?",
    lat: 42.4167,
    lng: 18.75,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Plitvice Lakes National Park located?",
    lat: 46.6907,
    lng: 15.8206,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is Mount Fuji located?",
    lat: 35.3606,
    lng: 138.7274,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Zhangjiajie National Forest Park located?",
    lat: 29.3255,
    lng: 110.4592,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is Krka National Park located?",
    lat: 43.6981,
    lng: 15.8831,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Isle of Skye located?",
    lat: 57.5,
    lng: -6.2,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Cinque Terre located?",
    lat: 43.7381,
    lng: 9.6865,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Amalfi Coast located?",
    lat: 40.6333,
    lng: 14.6,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Santorini located?",
    lat: 36.417,
    lng: 25.431,
    scope: "region",
    tolerance: 1.0,
  },
  {
    text: "Where is the Mykonos located?",
    lat: 37.4467,
    lng: 25.3289,
    scope: "region",
    tolerance: 1.0,
  },
  {
    text: "Where is the Crete located?",
    lat: 35.3387,
    lng: 25.1353,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Capri located?",
    lat: 40.5333,
    lng: 14.25,
    scope: "region",
    tolerance: 1.0,
  },
  {
    text: "Where is the Corsica located?",
    lat: 41.9,
    lng: 8.9,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Sardinia located?",
    lat: 39.8,
    lng: 8.5,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Bali located?",
    lat: -8.6705,
    lng: 115.2126,
    scope: "region",
    tolerance: 1.5,
  },
  {
    text: "Where is the Maldives located?",
    lat: 4.1694,
    lng: 73.5093,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Seychelles located?",
    lat: -4.6796,
    lng: 55.492,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Fiji located?",
    lat: -17.7134,
    lng: 178.0650,
    scope: "country",
    tolerance: 3.0,
  },
  {
    text: "Where is the Samoa located?",
    lat: -13.759,
    lng: -172.1046,
    scope: "country",
    tolerance: 3.0,
  },
  {
    text: "Where is the Tonga located?",
    lat: -21.1789,
    lng: -175.198,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Mauritius located?",
    lat: -20.3484,
    lng: 57.5522,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Jamaica located?",
    lat: 18.1096,
    lng: -77.2975,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Barbados located?",
    lat: 13.1939,
    lng: -59.5432,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Trinidad and Tobago located?",
    lat: 10.6918,
    lng: -61.2225,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Puerto Rico located?",
    lat: 18.2208,
    lng: -66.5901,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Aruba located?",
    lat: 12.1696,
    lng: -68.99,
    scope: "country",
    tolerance: 1.5,
  },
  {
    text: "Where is the Curacao located?",
    lat: 12.169,
    lng: -68.99,
    scope: "country",
    tolerance: 1.5,
  },
  {
    text: "Where is the St. Lucia located?",
    lat: 13.9,
    lng: -60.9789,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Grenada located?",
    lat: 12.1165,
    lng: -61.6790,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Dominica located?",
    lat: 15.415,
    lng: -61.371,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Saint Kitts and Nevis located?",
    lat: 17.357822,
    lng: -62.783,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Antigua and Barbuda located?",
    lat: 17.0578,
    lng: -61.796,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Saint Lucia located?",
    lat: 13.9,
    lng: -60.9789,
    scope: "country",
    tolerance: 2.0,
  },
  {
    text: "Where is the Saint Vincent and the Grenadines located?",
    lat: 12.9843,
    lng: -61.2872,
    scope: "country",
    tolerance: 2.0,
  },
];

async function seedGeoQuestions() {
  try {
    console.log("🌱 Seeding 100 GEO questions...");

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

    // Get or create Social round for geo questions
    let socialRound = await prisma.round.findFirst({
      where: {
        gameId: adminGame.id,
        category: "Social",
      },
    });

    if (!socialRound) {
      const roundCount = await prisma.round.count({
        where: { gameId: adminGame.id },
      });

      socialRound = await prisma.round.create({
        data: {
          gameId: adminGame.id,
          roundNumber: roundCount + 1,
          category: "Social",
          status: "ACTIVE",
        },
      });
    }

    const existingCount = await prisma.question.count({
      where: { roundId: socialRound.id },
    });

    let addedCount = 0;
    for (const q of GEO_QUESTIONS) {
      const existing = await prisma.question.findFirst({
        where: {
          roundId: socialRound.id,
          text: q.text,
        },
      });

      if (existing) continue;

      await prisma.question.create({
        data: {
          roundId: socialRound.id,
          type: "GEO",
          text: q.text,
          correct: {
            lat: q.lat,
            lng: q.lng,
          },
          metadata: {
            scope: q.scope,
            tolerance: q.tolerance,
          },
          pointsMax: [100, 200, 300, 400, 500][(existingCount + addedCount) % 5],
          timeLimit: 60,
          questionIndex: existingCount + addedCount,
        },
      });

      addedCount++;
      if (addedCount % 10 === 0) {
        console.log(`✓ Added ${addedCount} questions...`);
      }
    }

    console.log(`\n✅ Successfully seeded ${addedCount} GEO questions!`);

    const totalQuestions = await prisma.question.count({
      where: { roundId: socialRound.id },
    });
    console.log(`📈 Social round now has ${totalQuestions} questions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedGeoQuestions();
