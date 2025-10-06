import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface for storing chat history in persistent storage
 */
export interface ChatHistoryEntry {
    postId: number;
    messages: {
        id: string;
        text: string;
        isUser: boolean;
        timestamp: string; // ISO string for serialization
    }[];
    conversationHistory: {
        role: 'user' | 'assistant' | 'system';
        body: string;
    }[];
    createdAt: string;
    lastUpdated: string;
}

/**
 * Interface for the complete chat storage structure
 */
export interface ChatStorageData {
    chats: Record<string, ChatHistoryEntry>; // Key is postId as string
    lastCleanup: string;
}

const CHAT_STORAGE_KEY = 'hnews_chat_history';
const MAX_CHAT_AGE_DAYS = 30; // Keep chats for 30 days
const MAX_CHATS_PER_POST = 5; // Keep max 5 chat sessions per post

/**
 * Load chat history from persistent storage
 */
export const loadChatHistory = async (): Promise<ChatStorageData> => {
    try {
        const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored) as ChatStorageData;
            return data;
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }

    return {
        chats: {},
        lastCleanup: new Date().toISOString(),
    };
};

/**
 * Save chat history to persistent storage
 */
export const saveChatHistory = async (data: ChatStorageData): Promise<void> => {
    try {
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
};

/**
 * Get chat history for a specific post
 */
export const getChatHistoryForPost = async (postId: number): Promise<ChatHistoryEntry | null> => {
    try {
        const data = await loadChatHistory();
        const chatKey = postId.toString();
        return data.chats[chatKey] || null;
    } catch (error) {
        console.error('Error getting chat history for post:', error);
        return null;
    }
};

/**
 * Save chat history for a specific post
 */
export const saveChatHistoryForPost = async (
    postId: number,
    messages: ChatHistoryEntry['messages'],
    conversationHistory: ChatHistoryEntry['conversationHistory']
): Promise<void> => {
    try {
        const data = await loadChatHistory();
        const chatKey = postId.toString();
        const now = new Date().toISOString();

        data.chats[chatKey] = {
            postId,
            messages,
            conversationHistory,
            createdAt: data.chats[chatKey]?.createdAt || now,
            lastUpdated: now,
        };

        await saveChatHistory(data);
    } catch (error) {
        console.error('Error saving chat history for post:', error);
    }
};

/**
 * Clear chat history for a specific post
 */
export const clearChatHistoryForPost = async (postId: number): Promise<void> => {
    try {
        const data = await loadChatHistory();
        const chatKey = postId.toString();
        delete data.chats[chatKey];
        await saveChatHistory(data);
    } catch (error) {
        console.error('Error clearing chat history for post:', error);
    }
};

/**
 * Clean up old chat history
 */
export const cleanupOldChatHistory = async (): Promise<void> => {
    try {
        const data = await loadChatHistory();
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - (MAX_CHAT_AGE_DAYS * 24 * 60 * 60 * 1000));

        let hasChanges = false;

        // Remove old chats
        Object.keys(data.chats).forEach(chatKey => {
            const chat = data.chats[chatKey];
            const chatDate = new Date(chat.lastUpdated);
            if (chatDate < cutoffDate) {
                delete data.chats[chatKey];
                hasChanges = true;
            }
        });

        // Update last cleanup time
        data.lastCleanup = now.toISOString();

        if (hasChanges) {
            await saveChatHistory(data);
            console.log('🧹 Cleaned up old chat history');
        }
    } catch (error) {
        console.error('Error cleaning up chat history:', error);
    }
};

/**
 * Get all chat history (for debugging or management)
 */
export const getAllChatHistory = async (): Promise<ChatHistoryEntry[]> => {
    try {
        const data = await loadChatHistory();
        return Object.values(data.chats);
    } catch (error) {
        console.error('Error getting all chat history:', error);
        return [];
    }
};

/**
 * Clear all chat history
 */
export const clearAllChatHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing all chat history:', error);
    }
};
