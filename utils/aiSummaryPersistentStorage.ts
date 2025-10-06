import AsyncStorage from '@react-native-async-storage/async-storage';
import { AISummaryCacheReducer, CachedAISummary } from '../Redux/aiSummaryCacheReducer';

const AI_SUMMARY_CACHE_KEY = 'ai_summary_cache';

/**
 * Load AI summary cache from persistent storage
 */
export const loadAISummaryCache = async (): Promise<AISummaryCacheReducer> => {
    try {
        const cachedData = await AsyncStorage.getItem(AI_SUMMARY_CACHE_KEY);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            console.log('📦 Loaded AI summary cache from storage:', {
                totalSummaries: Object.keys(parsed.summaries || {}).length,
                lastCleanup: parsed.lastCleanup
            });
            return parsed;
        }
    } catch (error) {
        console.error('❌ Error loading AI summary cache from storage:', error);
    }

    // Return default state if loading fails
    return {
        summaries: {},
        lastCleanup: Date.now(),
    };
};

/**
 * Save AI summary cache to persistent storage
 */
export const saveAISummaryCache = async (cache: AISummaryCacheReducer): Promise<void> => {
    try {
        await AsyncStorage.setItem(AI_SUMMARY_CACHE_KEY, JSON.stringify(cache));
        console.log('💾 Saved AI summary cache to storage:', {
            totalSummaries: Object.keys(cache.summaries).length,
            lastCleanup: cache.lastCleanup
        });
    } catch (error) {
        console.error('❌ Error saving AI summary cache to storage:', error);
    }
};

/**
 * Save a single AI summary to persistent storage
 */
export const saveAISummary = async (summary: CachedAISummary): Promise<void> => {
    try {
        // Load current cache
        const currentCache = await loadAISummaryCache();

        // Add the new summary
        currentCache.summaries[summary.postId] = summary;

        // Save back to storage
        await saveAISummaryCache(currentCache);

        console.log('💾 Saved single AI summary to storage:', {
            postId: summary.postId,
            totalSummaries: Object.keys(currentCache.summaries).length
        });
    } catch (error) {
        console.error('❌ Error saving single AI summary to storage:', error);
    }
};

/**
 * Remove a single AI summary from persistent storage
 */
export const removeAISummary = async (postId: number): Promise<void> => {
    try {
        // Load current cache
        const currentCache = await loadAISummaryCache();

        // Remove the summary
        delete currentCache.summaries[postId];

        // Save back to storage
        await saveAISummaryCache(currentCache);

        console.log('🗑️ Removed AI summary from storage:', {
            postId,
            totalSummaries: Object.keys(currentCache.summaries).length
        });
    } catch (error) {
        console.error('❌ Error removing AI summary from storage:', error);
    }
};

/**
 * Clear all AI summaries from persistent storage
 */
export const clearAllAISummaries = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(AI_SUMMARY_CACHE_KEY);
        console.log('🗑️ Cleared all AI summaries from storage');
    } catch (error) {
        console.error('❌ Error clearing AI summaries from storage:', error);
    }
};

/**
 * Get cache statistics from persistent storage
 */
export const getCacheStats = async (): Promise<{
    totalCached: number;
    lastCleanup: number;
    oldestSummary?: number;
    newestSummary?: number;
}> => {
    try {
        const cache = await loadAISummaryCache();
        const summaries = Object.values(cache.summaries);

        return {
            totalCached: summaries.length,
            lastCleanup: cache.lastCleanup,
            oldestSummary: summaries.length > 0 ? Math.min(...summaries.map(s => s.createdAt)) : undefined,
            newestSummary: summaries.length > 0 ? Math.max(...summaries.map(s => s.createdAt)) : undefined,
        };
    } catch (error) {
        console.error('❌ Error getting cache stats from storage:', error);
        return {
            totalCached: 0,
            lastCleanup: Date.now(),
        };
    }
};
