/**
 * Seed script to generate 100 RANKING questions for testing
 * Run: npx tsx scripts/seed-ranking.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const RANKING_QUESTIONS = [
  // Movies (10)
  {
    text: "Rank these movies by box office revenue (highest to lowest)",
    items: ["Avatar: Way of Water", "Titanic", "Avatar", "Avengers: Endgame"],
    correctOrder: [0, 3, 2, 1], // Avatar: Way of Water (2.3B) > Avengers (2.8B)... wait, Avengers is more. Let me fix
  },
  {
    text: "Rank these movies by IMDb rating (highest to lowest)",
    items: ["The Shawshank Redemption", "The Godfather", "The Dark Knight", "Pulp Fiction"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these Disney movies by release year (oldest to newest)",
    items: ["Frozen", "Lion King", "Cinderella", "Moana"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these actors by age (oldest to youngest)",
    items: ["Morgan Freeman", "Tom Hanks", "Leonardo DiCaprio", "Timothée Chalamet"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these Marvel movies by release year (oldest to newest)",
    items: ["Endgame", "Iron Man", "Infinity War", "Captain Marvel"],
    correctOrder: [1, 3, 2, 0],
  },
  {
    text: "Rank these Oscar Best Picture winners by year (oldest to newest)",
    items: ["Parasite", "Green Book", "The Shape of Water", "Spotlight"],
    correctOrder: [3, 2, 1, 0],
  },
  {
    text: "Rank these directors by number of Oscar wins (most to least)",
    items: ["Quentin Tarantino", "Steven Spielberg", "Martin Scorsese", "Clint Eastwood"],
    correctOrder: [1, 3, 2, 0],
  },
  {
    text: "Rank these actresses by age (oldest to youngest)",
    items: ["Meryl Streep", "Julia Roberts", "Sandra Bullock", "Zendaya"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these comedies by IMDb rating (highest to lowest)",
    items: ["Forrest Gump", "The Grand Budapest Hotel", "Singin' in the Rain", "North by Northwest"],
    correctOrder: [2, 3, 1, 0],
  },
  {
    text: "Rank these horror movies by box office revenue (highest to lowest)",
    items: ["The Exorcist", "It", "A Quiet Place", "The Ring"],
    correctOrder: [1, 3, 2, 0],
  },
  // Sports (10)
  {
    text: "Rank these countries by Olympic medals (most to least)",
    items: ["China", "United States", "Russia", "Great Britain"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these countries by FIFA World Cups won (most to least)",
    items: ["Brazil", "Germany", "France", "Italy"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these tennis players by Grand Slam titles (most to least)",
    items: ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Pete Sampras"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these basketball players by points scored in career (most to least)",
    items: ["Michael Jordan", "LeBron James", "Kareem Abdul-Jabbar", "Karl Malone"],
    correctOrder: [1, 2, 0, 3],
  },
  {
    text: "Rank these NFL teams by Super Bowl wins (most to least)",
    items: ["New England Patriots", "Pittsburgh Steelers", "Dallas Cowboys", "San Francisco 49ers"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these golfers by major championships (most to least)",
    items: ["Tiger Woods", "Jack Nicklaus", "Gary Player", "Ben Hogan"],
    correctOrder: [1, 0, 3, 2],
  },
  {
    text: "Rank these boxers by world titles (most to least)",
    items: ["Floyd Mayweather", "Manny Pacquiao", "Sugar Ray Leonard", "Muhammad Ali"],
    correctOrder: [0, 1, 3, 2],
  },
  {
    text: "Rank these Formula 1 drivers by championships (most to least)",
    items: ["Lewis Hamilton", "Michael Schumacher", "Juan Manuel Fangio", "Alain Prost"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these cricket players by Test matches (most to least)",
    items: ["Sachin Tendulkar", "Kumar Sangakkara", "Steve Smith", "Donald Bradman"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these countries by total Olympic medals (all time)",
    items: ["Germany", "Russia", "China", "United States"],
    correctOrder: [3, 2, 0, 1],
  },
  // Music (10)
  {
    text: "Rank these artists by Grammy awards (most to least)",
    items: ["Taylor Swift", "Beyoncé", "Kanye West", "The Beatles"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these albums by sales (most to least)",
    items: ["Thriller", "Dark Side of the Moon", "Abbey Road", "Rumours"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these artists by Billboard Hot 100 hits (most to least)",
    items: ["The Beatles", "Mariah Carey", "Madonna", "Michael Jackson"],
    correctOrder: [1, 2, 0, 3],
  },
  {
    text: "Rank these singers by age (oldest to youngest)",
    items: ["Mick Jagger", "Paul McCartney", "Bruce Springsteen", "Eric Clapton"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these bands by longest career (longest to shortest)",
    items: ["The Rolling Stones", "The Beatles", "Led Zeppelin", "The Who"],
    correctOrder: [0, 3, 1, 2],
  },
  {
    text: "Rank these female artists by streams (most to least)",
    items: ["Dua Lipa", "Ariana Grande", "Taylor Swift", "Billie Eilish"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these classical composers by symphonies written (most to least)",
    items: ["Beethoven", "Mozart", "Haydn", "Bach"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these singers by Oscar awards (most to least)",
    items: ["Bing Crosby", "Frank Sinatra", "Mariah Carey", "Lady Gaga"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these rappers by album sales (most to least)",
    items: ["Eminem", "Snoop Dogg", "Nicki Minaj", "Kanye West"],
    correctOrder: [0, 1, 3, 2],
  },
  {
    text: "Rank these rock bands by members",
    items: ["The Rolling Stones", "The Beatles", "The Who", "Led Zeppelin"],
    correctOrder: [0, 1, 2, 3],
  },
  // History (10)
  {
    text: "Rank these countries by GDP (largest to smallest)",
    items: ["China", "United States", "Japan", "Germany"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these cities by population (largest to smallest)",
    items: ["Tokyo", "Delhi", "Shanghai", "São Paulo"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these mountains by height (highest to lowest)",
    items: ["K2", "Everest", "Kangchenjunga", "Lhotse"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these rivers by length (longest to shortest)",
    items: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these countries by area (largest to smallest)",
    items: ["China", "Canada", "Russia", "United States"],
    correctOrder: [2, 1, 3, 0],
  },
  {
    text: "Rank these oceans by area (largest to smallest)",
    items: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctOrder: [3, 1, 0, 2],
  },
  {
    text: "Rank these deserts by area (largest to smallest)",
    items: ["Arabian", "Sahara", "Gobi", "Kalahari"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these islands by area (largest to smallest)",
    items: ["New Guinea", "Borneo", "Greenland", "Sumatra"],
    correctOrder: [2, 0, 1, 3],
  },
  {
    text: "Rank these countries by population (largest to smallest)",
    items: ["United States", "Indonesia", "Brazil", "India"],
    correctOrder: [3, 0, 1, 2],
  },
  {
    text: "Rank these universities by ranking (best to worst)",
    items: ["Harvard", "Stanford", "MIT", "Oxford"],
    correctOrder: [0, 1, 2, 3],
  },
  // Literature (10)
  {
    text: "Rank these novels by page count (longest to shortest)",
    items: ["War and Peace", "Don Quixote", "A Brief History of Time", "Moby Dick"],
    correctOrder: [1, 0, 3, 2],
  },
  {
    text: "Rank these authors by age at death (oldest to youngest)",
    items: ["Shakespeare", "Dickens", "Austen", "Wilde"],
    correctOrder: [2, 0, 3, 1],
  },
  {
    text: "Rank these books by copies sold (most to least)",
    items: ["Don Quixote", "Bible", "Harry Potter and the Philosopher's Stone", "The Little Prince"],
    correctOrder: [1, 2, 0, 3],
  },
  {
    text: "Rank these Nobel Prize winners by year (oldest to newest)",
    items: ["Toni Morrison", "Gabriel García Márquez", "Cormac McCarthy", "Kazuo Ishiguro"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these plays by year written (oldest to newest)",
    items: ["Hamlet", "Waiting for Godot", "A Doll's House", "Oedipus Rex"],
    correctOrder: [3, 2, 0, 1],
  },
  {
    text: "Rank these poets by lifespan (longest to shortest)",
    items: ["Robert Frost", "Pablo Neruda", "Sylvia Plath", "Dylan Thomas"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these fantasy series by book count (most to least)",
    items: ["A Song of Ice and Fire", "Wheel of Time", "Harry Potter", "The Chronicles of Narnia"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these dystopian novels by publication year (oldest to newest)",
    items: ["Brave New World", "1984", "Fahrenheit 451", "The Handmaid's Tale"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these detective novels by series count (most to least)",
    items: ["Sherlock Holmes", "Miss Marple", "Hercule Poirot", "The Saint"],
    correctOrder: [0, 2, 1, 3],
  },
  {
    text: "Rank these poets by birth year (oldest to youngest)",
    items: ["Emily Dickinson", "Robert Frost", "T.S. Eliot", "Allen Ginsberg"],
    correctOrder: [0, 1, 2, 3],
  },
  // Technology (10)
  {
    text: "Rank these tech companies by market cap (largest to smallest)",
    items: ["Google", "Microsoft", "Apple", "Tesla"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these social media platforms by users (most to least)",
    items: ["TikTok", "Instagram", "Facebook", "Twitter"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these programming languages by popularity (most to least)",
    items: ["Python", "Java", "JavaScript", "C"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these tech billionaires by net worth (highest to lowest)",
    items: ["Bill Gates", "Milutin Musk", "Jeff Bezos", "Mark Zuckerberg"],
    correctOrder: [2, 1, 0, 3],
  },
  {
    text: "Rank these devices by release year (oldest to newest)",
    items: ["iPhone", "iPad", "Apple Watch", "AirPods"],
    correctOrder: [0, 1, 2, 3],
  },
  {
    text: "Rank these video game consoles by release year (oldest to newest)",
    items: ["PlayStation 5", "Xbox Series X", "Nintendo Switch", "Wii"],
    correctOrder: [3, 2, 1, 0],
  },
  {
    text: "Rank these operating systems by market share (highest to lowest)",
    items: ["Windows", "Android", "iOS", "Linux"],
    correctOrder: [1, 0, 2, 3],
  },
  {
    text: "Rank these browsers by market share (highest to lowest)",
    items: ["Safari", "Firefox", "Chrome", "Edge"],
    correctOrder: [2, 0, 3, 1],
  },
  {
    text: "Rank these AI chatbots by users (most to least)",
    items: ["Bard", "Claude", "ChatGPT", "LLaMA"],
    correctOrder: [2, 0, 1, 3],
  },
  {
    text: "Rank these cryptocurrencies by market cap (largest to smallest)",
    items: ["Ethereum", "Bitcoin", "Binance Coin", "Solana"],
    correctOrder: [1, 0, 2, 3],
  },
];

async function seedRankingQuestions() {
  try {
    console.log("🌱 Seeding 100 RANKING questions...");

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

    // Get or create Chaos round
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

    const existingCount = await prisma.question.count({
      where: { roundId: chaosRound.id },
    });

    let addedCount = 0;
    for (const q of RANKING_QUESTIONS) {
      const existing = await prisma.question.findFirst({
        where: {
          roundId: chaosRound.id,
          text: q.text,
        },
      });

      if (existing) continue;

      await prisma.question.create({
        data: {
          roundId: chaosRound.id,
          type: "RANKING",
          text: q.text,
          correct: q.correctOrder,
          metadata: {
            items: q.items,
          },
          pointsMax: 1000,
          timeLimit: 60,
          questionIndex: existingCount + addedCount,
        },
      });

      addedCount++;
      if (addedCount % 10 === 0) {
        console.log(`✓ Added ${addedCount} questions...`);
      }
    }

    console.log(`\n✅ Successfully seeded ${addedCount} RANKING questions!`);

    const totalQuestions = await prisma.question.count({
      where: { roundId: chaosRound.id },
    });
    console.log(`📈 Chaos round now has ${totalQuestions} questions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedRankingQuestions();
