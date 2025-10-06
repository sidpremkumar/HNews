import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatHistoryEntry } from '../utils/chatPersistentStorage';

/**
 * Interface for the chat history state
 */
export interface ChatHistoryState {
    chatHistory: Record<string, ChatHistoryEntry>; // Key is postId as string
    isLoading: boolean;
    lastCleanup: string;
}

const initialState: ChatHistoryState = {
    chatHistory: {},
    isLoading: false,
    lastCleanup: new Date().toISOString(),
};

/**
 * Chat history slice for managing chat conversations
 */
export const chatHistorySlice = createSlice({
    name: 'chatHistory',
    initialState,
    reducers: {
        /**
         * Set loading state
         */
        setChatHistoryLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        /**
         * Load chat history from storage
         */
        loadChatHistory: (state, action: PayloadAction<{ chats: Record<string, ChatHistoryEntry>; lastCleanup: string }>) => {
            state.chatHistory = action.payload.chats;
            state.lastCleanup = action.payload.lastCleanup;
            state.isLoading = false;
        },

        /**
         * Save chat history for a specific post
         */
        saveChatHistoryForPost: (state, action: PayloadAction<{
            postId: number;
            messages: ChatHistoryEntry['messages'];
            conversationHistory: ChatHistoryEntry['conversationHistory'];
        }>) => {
            const { postId, messages, conversationHistory } = action.payload;
            const chatKey = postId.toString();
            const now = new Date().toISOString();

            state.chatHistory[chatKey] = {
                postId,
                messages,
                conversationHistory,
                createdAt: state.chatHistory[chatKey]?.createdAt || now,
                lastUpdated: now,
            };
        },

        /**
         * Add a new message to chat history
         */
        addMessageToChatHistory: (state, action: PayloadAction<{
            postId: number;
            message: {
                id: string;
                text: string;
                isUser: boolean;
                timestamp: string;
            };
            conversationEntry?: {
                role: 'user' | 'assistant' | 'system';
                body: string;
            };
        }>) => {
            const { postId, message, conversationEntry } = action.payload;
            const chatKey = postId.toString();

            if (!state.chatHistory[chatKey]) {
                const now = new Date().toISOString();
                state.chatHistory[chatKey] = {
                    postId,
                    messages: [],
                    conversationHistory: [],
                    createdAt: now,
                    lastUpdated: now,
                };
            }

            // Add message
            state.chatHistory[chatKey].messages.push(message);

            // Add conversation entry if provided
            if (conversationEntry) {
                state.chatHistory[chatKey].conversationHistory.push(conversationEntry);
            }

            // Update last updated time
            state.chatHistory[chatKey].lastUpdated = new Date().toISOString();
        },

        /**
         * Clear chat history for a specific post
         */
        clearChatHistoryForPost: (state, action: PayloadAction<number>) => {
            const postId = action.payload;
            const chatKey = postId.toString();
            delete state.chatHistory[chatKey];
        },

        /**
         * Clear all chat history
         */
        clearAllChatHistory: (state) => {
            state.chatHistory = {};
        },

        /**
         * Update last cleanup time
         */
        updateLastCleanup: (state, action: PayloadAction<string>) => {
            state.lastCleanup = action.payload;
        },
    },
});

export const {
    setChatHistoryLoading,
    loadChatHistory,
    saveChatHistoryForPost,
    addMessageToChatHistory,
    clearChatHistoryForPost,
    clearAllChatHistory,
    updateLastCleanup,
} = chatHistorySlice.actions;

export default chatHistorySlice.reducer;
