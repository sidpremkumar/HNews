import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { ReduxStoreInterface } from '../Redux/store';

/**
 * Types for AI conversation and responses
 */
export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    body: string;
    pdfData?: {
        base64Data: string;
        mimeType: string;
    };
}

export interface GeminiAIResponse {
    text: string;
    usage?: {
        promptTokens: number;
        candidatesTokens: number;
        totalTokens: number;
    };
}

export interface UseGeminiAIOptions {
    temperature?: number;
    maxTokens?: number;
}

export interface UseGeminiAIReturn {
    /**
     * Make an AI call with the given conversation
     */
    generateResponse: (conversation: ConversationMessage[]) => Promise<GeminiAIResponse | null>;

    /**
     * Loading state for the AI call
     */
    isLoading: boolean;

    /**
     * Error state if the AI call fails
     */
    error: string | null;

    /**
     * Check if API key is available
     */
    hasApiKey: boolean;
}

/**
 * Custom hook for making Gemini AI calls
 * 
 * @param options - Configuration options for the AI calls
 * @returns Object with AI call function and state
 */
export const useGeminiAI = (options: UseGeminiAIOptions = {}): UseGeminiAIReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const geminiApiKey = useSelector(
        (state: ReduxStoreInterface) => state.settings.geminiApiKey
    );
    const geminiApiKeySet = useSelector(
        (state: ReduxStoreInterface) => state.settings.geminiApiKeySet
    );

    const hasApiKey = geminiApiKeySet && !!geminiApiKey;

    const generateResponse = useCallback(async (
        conversation: ConversationMessage[]
    ): Promise<GeminiAIResponse | null> => {
        // Reset error state
        setError(null);

        // Check if API key is available
        if (!hasApiKey || !geminiApiKey) {
            Alert.alert(
                'API Key Required',
                'Please set your Gemini API Key in settings to use AI features.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Go to Settings', onPress: () => {
                            // You could navigate to settings here if needed
                            console.log('Navigate to settings');
                        }
                    }
                ]
            );
            return null;
        }

        setIsLoading(true);

        try {
            // Convert conversation to Gemini format
            const contents = conversation.map(msg => {
                const parts: any[] = [{ text: msg.body }];

                // Add PDF data if present
                if (msg.pdfData) {
                    parts.push({
                        inline_data: {
                            mime_type: msg.pdfData.mimeType,
                            data: msg.pdfData.base64Data
                        }
                    });
                }

                return {
                    role: msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : msg.role,
                    parts
                };
            });

            const requestBody = {
                contents,
                generationConfig: {
                    temperature: options.temperature ?? 0.7,
                    maxOutputTokens: options.maxTokens ?? 1024,
                    topP: 0.8,
                    topK: 10
                }
            };

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error?.message ||
                    `API request failed with status ${response.status}`
                );
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response generated from AI');
            }

            const candidate = data.candidates[0];

            // Check if the response was blocked by safety filters
            if (candidate.finishReason === 'SAFETY') {
                throw new Error('Response blocked by safety filters. Try rephrasing your request.');
            }

            if (candidate.finishReason === 'RECITATION') {
                throw new Error('Response blocked due to recitation concerns. Try rephrasing your request.');
            }

            if (candidate.finishReason === 'MAX_TOKENS') {
                throw new Error('Response was cut off due to token limit. Try reducing the input or increasing max tokens.');
            }

            const text = candidate.content?.parts?.[0]?.text || '';

            if (!text.trim()) {
                throw new Error('AI returned empty response. This might be due to content policy restrictions.');
            }

            const result: GeminiAIResponse = {
                text,
                usage: data.usageMetadata ? {
                    promptTokens: data.usageMetadata.promptTokenCount || 0,
                    candidatesTokens: data.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: data.usageMetadata.totalTokenCount || 0,
                } : undefined
            };

            return result;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Gemini AI API Error:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [hasApiKey, geminiApiKey, options.temperature, options.maxTokens]);

    return {
        generateResponse,
        isLoading,
        error,
        hasApiKey,
    };
};
