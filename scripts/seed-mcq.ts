/**
 * Seed script to generate 100 MCQ questions for testing
 * Run: npx tsx scripts/seed-mcq.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const MCQ_QUESTIONS = [
  // Science & Nature (25 questions)
  {
    text: "What is the chemical symbol for gold?",
    options: ["Au", "Gd", "Go", "Ag"],
    correct: 0,
  },
  {
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
  {
    text: "What is the process by which plants make their own food?",
    options: ["Photosynthesis", "Fermentation", "Respiration", "Digestion"],
    correct: 0,
  },
  {
    text: "How many bones are in the adult human body?",
    options: ["186", "206", "236", "256"],
    correct: 1,
  },
  {
    text: "What is the smallest unit of life?",
    options: ["Atom", "Molecule", "Cell", "Organ"],
    correct: 2,
  },
  {
    text: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
    correct: 1,
  },
  {
    text: "What is the speed of light?",
    options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "100,000 km/s"],
    correct: 0,
  },
  {
    text: "Which of these animals is a mammal?",
    options: ["Penguin", "Shark", "Dolphin", "Alligator"],
    correct: 2,
  },
  {
    text: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Diamond", "Platinum", "Titanium"],
    correct: 1,
  },
  {
    text: "How many chambers does a human heart have?",
    options: ["2", "3", "4", "6"],
    correct: 2,
  },
  {
    text: "What is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correct: 2,
  },
  {
    text: "Which planet has the most moons?",
    options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
    correct: 1,
  },
  {
    text: "What type of animal is a seahorse?",
    options: ["Crustacean", "Fish", "Mollusk", "Amphibian"],
    correct: 1,
  },
  {
    text: "What is the boiling point of water at sea level?",
    options: ["90°C", "100°C", "110°C", "120°C"],
    correct: 1,
  },
  {
    text: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correct: 2,
  },
  {
    text: "What is the largest organ in the human body?",
    options: ["Brain", "Heart", "Liver", "Lung"],
    correct: 2,
  },
  {
    text: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correct: 2,
  },
  {
    text: "Which vitamin is produced when skin is exposed to sunlight?",
    options: ["Vitamin A", "Vitamin B", "Vitamin D", "Vitamin E"],
    correct: 2,
  },
  {
    text: "What is the study of rocks called?",
    options: ["Biology", "Geology", "Astronomy", "Botany"],
    correct: 1,
  },
  {
    text: "Which of these is a renewable energy source?",
    options: ["Coal", "Natural Gas", "Solar", "Petroleum"],
    correct: 2,
  },
  {
    text: "What is the center of an atom called?",
    options: ["Electron", "Nucleus", "Proton", "Neutron"],
    correct: 1,
  },
  {
    text: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: 1,
  },
  {
    text: "What type of animal is a bat?",
    options: ["Bird", "Reptile", "Mammal", "Amphibian"],
    correct: 2,
  },
  {
    text: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3,
  },
  {
    text: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "O2", "N2"],
    correct: 0,
  },
  // History & Geography (25 questions)
  {
    text: "In which year did Columbus discover America?",
    options: ["1482", "1491", "1492", "1493"],
    correct: 2,
  },
  {
    text: "Which country is the largest by area?",
    options: ["Canada", "China", "Russia", "United States"],
    correct: 2,
  },
  {
    text: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
    correct: 1,
  },
  {
    text: "What is the capital of Japan?",
    options: ["Osaka", "Tokyo", "Kyoto", "Yokohama"],
    correct: 1,
  },
  {
    text: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correct: 2,
  },
  {
    text: "Which ancient wonder is located in Egypt?",
    options: ["Colossus of Rhodes", "Great Pyramid of Giza", "Hanging Gardens", "Temple of Zeus"],
    correct: 1,
  },
  {
    text: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correct: 2,
  },
  {
    text: "Who wrote the Declaration of Independence?",
    options: ["Benjamin Franklin", "Thomas Jefferson", "John Adams", "James Madison"],
    correct: 1,
  },
  {
    text: "Which river is the longest in the world?",
    options: ["Amazon", "Yangtze", "Nile", "Mississippi"],
    correct: 2,
  },
  {
    text: "In which year did the Titanic sink?",
    options: ["1910", "1911", "1912", "1913"],
    correct: 2,
  },
  {
    text: "What is the capital of France?",
    options: ["Lyon", "Marseille", "Paris", "Toulouse"],
    correct: 2,
  },
  {
    text: "Which country gifted the Statue of Liberty to the USA?",
    options: ["United Kingdom", "France", "Spain", "Netherlands"],
    correct: 1,
  },
  {
    text: "What is the capital of India?",
    options: ["Mumbai", "Bangalore", "Delhi", "Kolkata"],
    correct: 2,
  },
  {
    text: "In which year did the Berlin Wall fall?",
    options: ["1987", "1988", "1989", "1990"],
    correct: 2,
  },
  {
    text: "Which empire built the Great Wall of China?",
    options: ["Han", "Ming", "Qin", "Tang"],
    correct: 2,
  },
  {
    text: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "Liechtenstein", "San Marino"],
    correct: 1,
  },
  {
    text: "Which ancient city was buried by Mount Vesuvius?",
    options: ["Rome", "Athens", "Pompeii", "Syracuse"],
    correct: 2,
  },
  {
    text: "What is the capital of Brazil?",
    options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
    correct: 2,
  },
  {
    text: "In which year did the Titanic sink?",
    options: ["1910", "1911", "1912", "1913"],
    correct: 2,
  },
  {
    text: "Who was the first President of Brazil?",
    options: ["Juscelino Kubitschek", "Getúlio Vargas", "Floriano Peixoto", "Manuel Deodoro da Fonseca"],
    correct: 3,
  },
  {
    text: "Which country hosted the first FIFA World Cup?",
    options: ["Brazil", "Italy", "France", "Uruguay"],
    correct: 3,
  },
  {
    text: "What is the capital of Canada?",
    options: ["Toronto", "Vancouver", "Ottawa", "Montreal"],
    correct: 2,
  },
  {
    text: "In which year did the Renaissance begin?",
    options: ["13th Century", "14th Century", "15th Century", "16th Century"],
    correct: 1,
  },
  {
    text: "Which country is known as the Land of the Rising Sun?",
    options: ["South Korea", "Vietnam", "Japan", "Thailand"],
    correct: 2,
  },
  { text: "What is the capital of Mexico?", options: ["Cancún", "Acapulco", "Mexico City", "Guadalajara"], correct: 2 },
  {
    text: "Which desert is the largest in the world?",
    options: ["Sahara", "Arabian", "Kalahari", "Gobi"],
    correct: 0,
  },
  // Literature & Arts (25 questions)
  {
    text: "Who wrote 'Romeo and Juliet'?",
    options: ["Christopher Marlowe", "William Shakespeare", "Ben Jonson", "John Webster"],
    correct: 1,
  },
  {
    text: "Which author wrote 'Pride and Prejudice'?",
    options: ["Charlotte Brontë", "Jane Austen", "George Eliot", "Emily Brontë"],
    correct: 1,
  },
  {
    text: "Who painted the Mona Lisa?",
    options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
    correct: 2,
  },
  {
    text: "Which author wrote '1984'?",
    options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "Kurt Vonnegut"],
    correct: 1,
  },
  {
    text: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Harper Lee", "Flannery O'Connor", "Carson McCullers", "Eudora Welty"],
    correct: 0,
  },
  {
    text: "Which artist cut off his own ear?",
    options: ["Pablo Picasso", "Vincent van Gogh", "Paul Cézanne", "Henri Matisse"],
    correct: 1,
  },
  {
    text: "Who wrote 'The Great Gatsby'?",
    options: ["Ernest Hemingway", "F. Scott Fitzgerald", "John Steinbeck", "William Faulkner"],
    correct: 1,
  },
  {
    text: "Which composer wrote 'The Magic Flute'?",
    options: ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Franz Schubert", "Frédéric Chopin"],
    correct: 1,
  },
  {
    text: "Who sculpted 'David'?",
    options: ["Leonardo da Vinci", "Donatello", "Michelangelo", "Raphael"],
    correct: 2,
  },
  {
    text: "Which author wrote 'The Odyssey'?",
    options: ["Sophocles", "Homer", "Aeschylus", "Euripides"],
    correct: 1,
  },
  {
    text: "Who wrote 'Crime and Punishment'?",
    options: ["Leo Tolstoy", "Fyodor Dostoevsky", "Ivan Turgenev", "Aleksandr Pushkin"],
    correct: 1,
  },
  {
    text: "Which artist is famous for painting sunflowers?",
    options: ["Paul Gauguin", "Vincent van Gogh", "Claude Monet", "Pierre-Auguste Renoir"],
    correct: 1,
  },
  {
    text: "Who wrote 'Moby Dick'?",
    options: ["Edgar Allan Poe", "Herman Melville", "Nathaniel Hawthorne", "Mark Twain"],
    correct: 1,
  },
  {
    text: "Which composer wrote 'Moonlight Sonata'?",
    options: ["Johann Sebastian Bach", "Ludwig van Beethoven", "Frédéric Chopin", "Joseph Haydn"],
    correct: 1,
  },
  {
    text: "Who wrote 'Jane Eyre'?",
    options: ["Charlotte Brontë", "Jane Austen", "George Eliot", "Emily Brontë"],
    correct: 0,
  },
  {
    text: "Which author wrote 'The Catcher in the Rye'?",
    options: ["Jack Kerouac", "J.D. Salinger", "Allen Ginsberg", "William S. Burroughs"],
    correct: 1,
  },
  {
    text: "Who painted 'Starry Night'?",
    options: ["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dalí"],
    correct: 1,
  },
  {
    text: "Which author wrote 'Wuthering Heights'?",
    options: ["Charlotte Brontë", "Jane Austen", "George Eliot", "Emily Brontë"],
    correct: 3,
  },
  {
    text: "Who wrote 'The Iliad'?",
    options: ["Sophocles", "Homer", "Aeschylus", "Euripides"],
    correct: 1,
  },
  {
    text: "Which composer wrote 'The Four Seasons'?",
    options: ["Johann Sebastian Bach", "Vivaldi", "Mozart", "Haydn"],
    correct: 1,
  },
  {
    text: "Who wrote 'Frankenstein'?",
    options: ["Mary Shelley", "Bram Stoker", "Robert Louis Stevenson", "Oscar Wilde"],
    correct: 0,
  },
  {
    text: "Which author wrote 'The Picture of Dorian Gray'?",
    options: ["Oscar Wilde", "George Bernard Shaw", "W.B. Yeats", "Samuel Beckett"],
    correct: 0,
  },
  {
    text: "Who sculpted 'The Thinker'?",
    options: ["Edgar Degas", "Henri Moore", "Auguste Rodin", "Constantin Brancusi"],
    correct: 2,
  },
  {
    text: "Which author wrote 'Anna Karenina'?",
    options: ["Fyodor Dostoevsky", "Leo Tolstoy", "Ivan Turgenev", "Aleksandr Pushkin"],
    correct: 1,
  },
  {
    text: "Who painted 'The Persistence of Memory'?",
    options: ["Joan Miró", "Salvador Dalí", "Pablo Picasso", "Marc Chagall"],
    correct: 1,
  },
  // Sports & Entertainment (25 questions)
  {
    text: "Which sport uses a racket and a birdie?",
    options: ["Tennis", "Badminton", "Squash", "Pickleball"],
    correct: 1,
  },
  {
    text: "How many players are on a basketball team on the court?",
    options: ["4", "5", "6", "7"],
    correct: 1,
  },
  {
    text: "Which country won the FIFA World Cup in 2018?",
    options: ["Germany", "Brazil", "France", "Spain"],
    correct: 2,
  },
  {
    text: "How many strings does a standard violin have?",
    options: ["3", "4", "5", "6"],
    correct: 1,
  },
  {
    text: "Which tennis tournament is played on grass?",
    options: ["US Open", "French Open", "Wimbledon", "Australian Open"],
    correct: 2,
  },
  {
    text: "How long is a rugby league field in meters?",
    options: ["100", "110", "120", "130"],
    correct: 1,
  },
  {
    text: "Which golfer won the most Masters tournaments?",
    options: ["Jack Nicklaus", "Tiger Woods", "Arnold Palmer", "Tom Watson"],
    correct: 0,
  },
  {
    text: "How many rings are on the Olympic symbol?",
    options: ["4", "5", "6", "7"],
    correct: 1,
  },
  {
    text: "Which sport is played in a swimming pool?",
    options: ["Water Polo", "Diving", "Swimming", "All of the above"],
    correct: 3,
  },
  {
    text: "How many innings are in a baseball game?",
    options: ["7", "8", "9", "10"],
    correct: 2,
  },
  {
    text: "Which streaming service produced 'The Crown'?",
    options: ["Amazon Prime", "Netflix", "Disney+", "HBO"],
    correct: 1,
  },
  {
    text: "How many strings does a standard guitar have?",
    options: ["5", "6", "7", "8"],
    correct: 1,
  },
  {
    text: "Which actor played James Bond?",
    options: ["Johnny Depp", "Pierce Brosnan", "Matt Damon", "Daniel Craig"],
    correct: 3,
  },
  {
    text: "How many days are games played in the Wimbledon tournament?",
    options: ["10", "12", "14", "16"],
    correct: 2,
  },
  {
    text: "Which movie won best picture at the 2020 Oscars?",
    options: ["1917", "Once Upon a Time", "Parasite", "Joker"],
    correct: 2,
  },
  {
    text: "How many players are on a soccer team on the field?",
    options: ["9", "10", "11", "12"],
    correct: 2,
  },
  {
    text: "Which chess piece can move in an L-shape?",
    options: ["Bishop", "Knight", "Rook", "Queen"],
    correct: 1,
  },
  {
    text: "How many points is a touchdown worth in American football?",
    options: ["4", "5", "6", "7"],
    correct: 2,
  },
  {
    text: "Which video game features Mario?",
    options: ["The Legend of Zelda", "Super Mario Bros", "Donkey Kong Country", "Kirby"],
    correct: 1,
  },
  {
    text: "How many strings does a bass guitar typically have?",
    options: ["3", "4", "5", "6"],
    correct: 1,
  },
  {
    text: "Which actor played Iron Man?",
    options: ["Chris Evans", "Robert Downey Jr.", "Tom Hiddleston", "Chris Hemsworth"],
    correct: 1,
  },
  {
    text: "How many points is a field goal worth in football?",
    options: ["2", "3", "4", "5"],
    correct: 1,
  },
  {
    text: "Which sport is played with sticks and a puck?",
    options: ["Lacrosse", "Ice Hockey", "Field Hockey", "All of the above"],
    correct: 3,
  },
  {
    text: "How many players are on a volleyball team on the court?",
    options: ["5", "6", "7", "8"],
    correct: 1,
  },
  {
    text: "Which video game features a plumber named Luigi?",
    options: ["Super Mario Bros", "Donkey Kong", "Metroid", "Kirby"],
    correct: 0,
  },
];

async function seedMCQQuestions() {
  try {
    console.log("🌱 Seeding 100 MCQ questions...");

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
      console.log("✓ Created ADMIN game");
    } else {
      console.log("✓ Found existing ADMIN game");
    }

    // Get or create Knowledge round
    let knowledgeRound = await prisma.round.findFirst({
      where: {
        gameId: adminGame.id,
        category: "Knowledge",
      },
    });

    if (!knowledgeRound) {
      const roundCount = await prisma.round.count({
        where: { gameId: adminGame.id },
      });

      knowledgeRound = await prisma.round.create({
        data: {
          gameId: adminGame.id,
          roundNumber: roundCount + 1,
          category: "Knowledge",
          status: "ACTIVE",
        },
      });
      console.log("✓ Created Knowledge round");
    } else {
      console.log("✓ Found existing Knowledge round");
    }

    // Get the current question count
    const existingCount = await prisma.question.count({
      where: { roundId: knowledgeRound.id },
    });

    console.log(`ℹ️  Found ${existingCount} existing MCQ questions`);

    // Add questions
    let addedCount = 0;
    for (let i = 0; i < MCQ_QUESTIONS.length; i++) {
      const q = MCQ_QUESTIONS[i];

      // Check if question already exists (prevent duplicates)
      const existing = await prisma.question.findFirst({
        where: {
          roundId: knowledgeRound.id,
          text: q.text,
        },
      });

      if (existing) {
        console.log(`⊘ Skipping duplicate: "${q.text.substring(0, 40)}..."`);
        continue;
      }

      await prisma.question.create({
        data: {
          roundId: knowledgeRound.id,
          type: "MULTIPLE_CHOICE",
          text: q.text,
          correct: q.correct,
          metadata: {
            options: q.options,
          },
          pointsMax: 1000,
          timeLimit: 30,
          questionIndex: existingCount + addedCount,
        },
      });

      addedCount++;
      if (addedCount % 10 === 0) {
        console.log(`✓ Added ${addedCount} questions...`);
      }
    }

    console.log(`\n✅ Successfully seeded ${addedCount} MCQ questions!`);
    console.log(`📊 Total MCQ questions in database: ${existingCount + addedCount}`);

    const totalQuestions = await prisma.question.count({
      where: { roundId: knowledgeRound.id },
    });
    console.log(`📈 Knowledge round now has ${totalQuestions} questions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMCQQuestions();
