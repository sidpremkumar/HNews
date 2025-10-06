import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { clearAllAISummaries as clearAllAISummariesStorage, removeAISummary, saveAISummary, saveAISummaryCache } from "../utils/aiSummaryPersistentStorage";

export interface CachedAISummary {
    postId: number;
    summary: string;
    createdAt: number; // timestamp
    websiteContent?: string;
    extractionMethod: 'readability' | 'fallback' | 'failed';
    processingTime: number;
    originalLength: number;
    extractedLength: number;
    compressionRatio: number;
}

export interface AISummaryCacheReducer {
    summaries: { [postId: number]: CachedAISummary };
    lastCleanup: number;
}

export const aiSummaryCacheSlice = createSlice({
    name: "aiSummaryCache",
    initialState: {
        summaries: {},
        lastCleanup: Date.now(),
    } as AISummaryCacheReducer,
    reducers: {
        loadAISummaryCache: (state, action: PayloadAction<AISummaryCacheReducer>) => {
            return action.payload;
        },

        cacheAISummary: (state, action: PayloadAction<{
            postId: number;
            summary: string;
            websiteContent?: string;
            extractionMethod: 'readability' | 'fallback' | 'failed';
            processingTime: number;
            originalLength: number;
            extractedLength: number;
            compressionRatio: number;
        }>) => {
            const { postId, summary, websiteContent, extractionMethod, processingTime, originalLength, extractedLength, compressionRatio } = action.payload;

            const newSummary = {
                postId,
                summary,
                createdAt: Date.now(),
                websiteContent,
                extractionMethod,
                processingTime,
                originalLength,
                extractedLength,
                compressionRatio,
            };

            state.summaries[postId] = newSummary;

            // Persist to storage asynchronously
            saveAISummary(newSummary).catch(error => {
                console.error('Failed to persist AI summary to storage:', error);
            });
        },

        clearAISummary: (state, action: PayloadAction<{ postId: number }>) => {
            delete state.summaries[action.payload.postId];

            // Persist removal to storage asynchronously
            removeAISummary(action.payload.postId).catch(error => {
                console.error('Failed to remove AI summary from storage:', error);
            });
        },

        clearAllAISummaries: (state) => {
            state.summaries = {};

            // Persist clearing to storage asynchronously
            clearAllAISummariesStorage().catch(error => {
                console.error('Failed to clear AI summaries from storage:', error);
            });
        },

        cleanupOldSummaries: (state, action: PayloadAction<{ maxAgeHours?: number }>) => {
            const maxAgeHours = action.payload.maxAgeHours || 24; // Default 24 hours
            const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

            const removedPostIds: number[] = [];
            Object.keys(state.summaries).forEach(postIdStr => {
                const postId = parseInt(postIdStr);
                const summary = state.summaries[postId];
                if (summary && summary.createdAt < cutoffTime) {
                    delete state.summaries[postId];
                    removedPostIds.push(postId);
                }
            });

            state.lastCleanup = Date.now();

            // Persist the cleaned cache to storage asynchronously
            if (removedPostIds.length > 0) {
                saveAISummaryCache(state).catch(error => {
                    console.error('Failed to persist cleaned AI summary cache to storage:', error);
                });
            }
        },
    },
    selectors: {
        getCachedSummary: (state, postId: number) => state.summaries[postId],
        hasCachedSummary: (state, postId: number) => !!state.summaries[postId],
        getCacheStats: (state) => ({
            totalCached: Object.keys(state.summaries).length,
            lastCleanup: state.lastCleanup,
            oldestSummary: Math.min(...Object.values(state.summaries).map(s => s.createdAt)),
            newestSummary: Math.max(...Object.values(state.summaries).map(s => s.createdAt)),
        }),
    },
});

export const {
    loadAISummaryCache,
    cacheAISummary,
    clearAISummary,
    clearAllAISummaries,
    cleanupOldSummaries,
} = aiSummaryCacheSlice.actions;

export const {
    getCachedSummary,
    hasCachedSummary,
    getCacheStats,
} = aiSummaryCacheSlice.selectors;

export default aiSummaryCacheSlice.reducer;
