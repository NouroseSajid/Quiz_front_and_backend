/**
 * Background jobs for game state maintenance
 * Call startBackgroundJobs() once during app initialization
 */

import { GameStateManager } from "./gameState";

let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Start background cleanup job for inactive sessions
 * Runs every 5 minutes
 */
export function startSessionCleanupJob(): void {
  if (cleanupIntervalId) return; // Already running
  
  cleanupIntervalId = setInterval(() => {
    try {
      GameStateManager.cleanupInactiveSessions(3600000); // 1 hour idle timeout
      const remaining = GameStateManager.getAllSessions().length;
      if (remaining > 0) {
        console.log(`[Cleanup] ${remaining} active sessions remaining`);
      }
    } catch (err) {
      console.error("[Cleanup] Error during session cleanup:", err);
    }
  }, 300000); // Every 5 minutes
}

/**
 * Stop background cleanup job
 */
export function stopSessionCleanupJob(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

/**
 * Check if cleanup job is running
 */
export function isCleanupJobRunning(): boolean {
  return cleanupIntervalId !== null;
}
