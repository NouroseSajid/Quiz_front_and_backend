-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameStateBackup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "checkpoint" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameStateBackup_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_gameId_key" ON "Session"("gameId");

-- CreateIndex
CREATE INDEX "Session_gameId_idx" ON "Session"("gameId");

-- CreateIndex
CREATE INDEX "Session_hostId_idx" ON "Session"("hostId");

-- CreateIndex
CREATE INDEX "Session_isActive_idx" ON "Session"("isActive");

-- CreateIndex
CREATE INDEX "GameStateBackup_gameId_idx" ON "GameStateBackup"("gameId");

-- CreateIndex
CREATE INDEX "GameStateBackup_createdAt_idx" ON "GameStateBackup"("createdAt");
