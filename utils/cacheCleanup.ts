import { CachedAISummary, cleanupOldSummaries } from '../Redux/aiSummaryCacheReducer';
import store from '../Redux/store';

/**
 * Clean up old cached AI summaries
 * Should be called periodically to prevent memory bloat
 * 
 * @param maxAgeHours - Maximum age in hours before summaries are removed (default: 24)
 */
export const cleanupAISummaryCache = (maxAgeHours: number = 24) => {
    store.dispatch(cleanupOldSummaries({ maxAgeHours }));
    console.log(`Cleaned up AI summary cache (removed summaries older than ${maxAgeHours} hours)`);
};

/**
 * Get cache statistics
 * 
 * @returns Object with cache statistics
 */
export const getCacheStats = () => {
    const state = store.getState();
    const cacheState = state.aiSummaryCache;

    const summaries: CachedAISummary[] = Object.values(cacheState.summaries);

    return {
        totalCached: summaries.length,
        lastCleanup: cacheState.lastCleanup,
        oldestSummary: summaries.length > 0 ? Math.min(...summaries.map(s => s.createdAt)) : null,
        newestSummary: summaries.length > 0 ? Math.max(...summaries.map(s => s.createdAt)) : null,
        averageProcessingTime: summaries.length > 0 ?
            summaries.reduce((sum, s) => sum + s.processingTime, 0) / summaries.length : 0,
        totalExtractedLength: summaries.reduce((sum, s) => sum + s.extractedLength, 0),
        averageCompressionRatio: summaries.length > 0 ?
            summaries.reduce((sum, s) => sum + s.compressionRatio, 0) / summaries.length : 0,
    };
};

/**
 * Clear all cached summaries
 */
export const clearAllCachedSummaries = () => {
    store.dispatch(cleanupOldSummaries({ maxAgeHours: 0 }));
    console.log('Cleared all AI summary cache');
};

/**
 * Auto-cleanup setup - call this when the app starts
 * Sets up periodic cleanup every 6 hours
 */
export const setupAutoCleanup = () => {
    // Clean up immediately on setup
    cleanupAISummaryCache(24);

    // Set up periodic cleanup every 6 hours
    setInterval(() => {
        cleanupAISummaryCache(24);
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

    console.log('Auto-cleanup setup complete (every 6 hours)');
};
