import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface SettingsReducer {
    geminiApiKey?: string;
    geminiApiKeySet: boolean;
}

export const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        geminiApiKey: undefined,
        geminiApiKeySet: false,
    } as SettingsReducer,
    reducers: {
        setGeminiApiKey: (state, action: PayloadAction<{ newState: string }>) => {
            state.geminiApiKey = action.payload.newState;
            state.geminiApiKeySet = true;
        },
        clearGeminiApiKey: (state) => {
            state.geminiApiKey = undefined;
            state.geminiApiKeySet = false;
        },
        loadGeminiApiKeyFromStorage: (state, action: PayloadAction<{ apiKey: string | null }>) => {
            if (action.payload.apiKey) {
                state.geminiApiKey = action.payload.apiKey;
                state.geminiApiKeySet = true;
            } else {
                state.geminiApiKey = undefined;
                state.geminiApiKeySet = false;
            }
        },
    },
    selectors: {},
});

export const {
    setGeminiApiKey,
    clearGeminiApiKey,
    loadGeminiApiKeyFromStorage,
} = settingsSlice.actions;
export const { } = settingsSlice.selectors;

export default settingsSlice.reducer;
