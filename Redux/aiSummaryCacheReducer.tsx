import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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

            state.summaries[postId] = {
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
        },

        clearAISummary: (state, action: PayloadAction<{ postId: number }>) => {
            delete state.summaries[action.payload.postId];
        },

        clearAllAISummaries: (state) => {
            state.summaries = {};
        },

        cleanupOldSummaries: (state, action: PayloadAction<{ maxAgeHours?: number }>) => {
            const maxAgeHours = action.payload.maxAgeHours || 24; // Default 24 hours
            const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

            Object.keys(state.summaries).forEach(postIdStr => {
                const postId = parseInt(postIdStr);
                const summary = state.summaries[postId];
                if (summary && summary.createdAt < cutoffTime) {
                    delete state.summaries[postId];
                }
            });

            state.lastCleanup = Date.now();
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
