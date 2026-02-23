import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  (new PrismaClient({ adapter }) as any);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Initialize game state persistence service
import { GameStatePersistence } from "@/lib/gameStatePersistence";

let persistenceInitialized = false;

async function initializePersistence() {
  if (persistenceInitialized) return;
  
  try {
    await GameStatePersistence.initialize();
    persistenceInitialized = true;
  } catch (error) {
    console.error("[Prisma] Failed to initialize persistence:", error);
  }
}

// Initialize on first import
initializePersistence().catch(console.error);

