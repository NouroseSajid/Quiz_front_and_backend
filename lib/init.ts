/**
 * App Initialization Module
 * 
 * Runs once on app startup to:
 * - Initialize the game state persistence service
 * - Recover any orphaned sessions
 * - Cleanup old backups
 * - Start periodic backup intervals
 */

import { GameStatePersistence } from "@/lib/gameStatePersistence";

let initialized = false;

export async function initializeApp(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    console.log("[Init] Starting app initialization...");

    // Initialize persistence service
    await GameStatePersistence.initialize();

    // Cleanup old backups on startup
    await GameStatePersistence.cleanupOldBackups(5, 86400000); // Keep 5 latest, delete older than 24h

    initialized = true;

    console.log("[Init] App initialization completed successfully");
  } catch (error) {
    console.error("[Init] Failed to initialize app:", error);

    // Don't throw - app can continue with degraded functionality
    // Just log the error so it's visible in logs
  }
}
