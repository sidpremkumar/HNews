import { Feather } from '@expo/vector-icons';
import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
    VStack,
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import { useSelector } from 'react-redux';
import { Text, View } from 'tamagui';
import { cacheAISummary, clearAISummary, getCachedSummary, hasCachedSummary } from '../../Redux/aiSummaryCacheReducer';
import { ReduxStoreInterface, useAppDispatch } from '../../Redux/store';
import { AlgoliaCommentRaw } from '../../utils/HackerNewsClient/HackerNewsClient.types';
import { extractCommentsForAI } from '../../utils/extractCommentsForAI';
import { fetchAndExtractContent, isLikelyArticle } from '../../utils/fetchAndExtractContent';
import { mainPurple, mainStyles } from '../../utils/main.styles';
import { useGeminiAI } from '../../utils/useGeminiAI';

interface AISummaryButtonProps {
    postId: number;
    postTitle?: string;
    postUrl?: string;
    postAuthor?: string;
    postPoints?: number;
    postText?: string;
    comments?: AlgoliaCommentRaw[];
}

const AISummaryButton: React.FC<AISummaryButtonProps> = ({
    postId,
    postTitle,
    postUrl,
    postAuthor,
    postPoints,
    postText,
    comments,
}) => {
    console.log('🔵 AISummaryButton mounted with postId:', postId);
    const toast = useToast();
    const { generateResponse, isLoading: isAILoading, hasApiKey } = useGeminiAI({
        temperature: 0.7,
        maxTokens: 3072,
    });
    const [showAISummary, setShowAISummary] = useState<boolean>(false);
    const [isExtractingContent, setIsExtractingContent] = useState<boolean>(false);
    const [showApiKeyError, setShowApiKeyError] = useState<boolean>(false);

    // Get cached summary and check if it exists
    const cachedSummary = useSelector((state: ReduxStoreInterface) =>
        getCachedSummary(state, postId)
    );
    const hasCached = useSelector((state: ReduxStoreInterface) =>
        hasCachedSummary(state, postId)
    );

    const dispatch = useAppDispatch();

    // Reset error state when API key becomes available
    React.useEffect(() => {
        if (hasApiKey && showApiKeyError) {
            setShowApiKeyError(false);
        }
    }, [hasApiKey, showApiKeyError]);

    // Auto-show cached summary when component mounts (but don't auto-generate)
    React.useEffect(() => {
        if (hasCached && cachedSummary) {
            console.log('🔵 Auto-showing cached summary');
            setShowAISummary(true);
        }
    }, [hasCached, cachedSummary]);

    const handleGenerateSummary = async () => {
        console.log('🔵 AISummaryButton: handleGenerateSummary called');
        console.log('🔵 hasApiKey:', hasApiKey);
        console.log('🔵 hasCached:', hasCached);
        console.log('🔵 cachedSummary:', !!cachedSummary);
        console.log('🔵 postId:', postId);

        if (!hasApiKey) {
            console.log('🔵 No API key, showing alert');
            setShowApiKeyError(true);
            Alert.alert(
                '⚡ API Key Required',
                'Please set your Gemini API Key in settings to generate AI summaries',
                [
                    {
                        text: 'OK',
                        style: 'default',
                        onPress: () => setShowApiKeyError(false),
                    },
                ]
            );
            return;
        }

        // If we have a cached summary, just toggle display
        if (hasCached && cachedSummary) {
            console.log('🔵 Using cached summary, toggling display');
            setShowAISummary(!showAISummary);
            return;
        }

        // If no cached summary but we have API key, generate one
        if (hasApiKey && !hasCached) {
            console.log('🔵 No cached summary, proceeding with AI generation');
        } else {
            console.log('🔵 No API key and no cached summary, cannot proceed');
            return;
        }
        // Extract comments data for AI
        console.log('Comments data:', comments?.length || 0, 'comments available');
        const commentsText = comments && comments.length > 0
            ? extractCommentsForAI(comments, 10, 10)
            : 'No comments available.';
        console.log('Comments text length:', commentsText.length);

        // Fetch and extract website content if URL is available and looks like an article
        let websiteContentText = '';
        let pdfData: { base64Data: string; mimeType: string } | undefined;

        if (postUrl && isLikelyArticle(postUrl)) {
            setIsExtractingContent(true);
            try {
                console.log('Fetching website content from:', postUrl);
                const contentResult = await fetchAndExtractContent(postUrl);

                if (contentResult.success && contentResult.content) {
                    if (contentResult.extractionMethod === 'pdf' && contentResult.base64Data) {
                        // Handle PDF content
                        websiteContentText = `\n\nPDF DOCUMENT:\n${contentResult.content}`;
                        pdfData = {
                            base64Data: contentResult.base64Data,
                            mimeType: contentResult.mimeType || 'application/pdf'
                        };
                        console.log(`PDF downloaded and ready for Gemini processing (${contentResult.originalLength} bytes)`);
                    } else {
                        // Handle regular website content
                        websiteContentText = `\n\nWEBSITE CONTENT:\n${contentResult.content}`;
                        console.log(`Extracted ${contentResult.extractedLength} characters from website (${contentResult.compressionRatio.toFixed(2)}x compression)`);
                    }
                } else {
                    console.log('Website content extraction failed:', contentResult.error);
                    websiteContentText = '\n\nWEBSITE CONTENT: Unable to extract content from the linked website.';
                }
            } catch (error) {
                console.error('Error fetching website content:', error);
                websiteContentText = '\n\nWEBSITE CONTENT: Error fetching content from the linked website.';
            } finally {
                setIsExtractingContent(false);
            }
        } else if (postUrl) {
            websiteContentText = '\n\nWEBSITE CONTENT: Link provided but content extraction not attempted (likely not an article).';
        } else {
            websiteContentText = '\n\nWEBSITE CONTENT: No external link provided.';
        }

        const conversation = [
            {
                role: 'user' as const,
                body: `Create a comprehensive summary with TWO distinct sections. Use as many DIRECT QUOTES as possible to make it engaging and authentic.

POST:
Title: ${postTitle || 'N/A'}
${postText ? `Content: ${postText}` : `URL: ${postUrl || 'N/A'}`}
Author: ${postAuthor || 'N/A'} (${postPoints || 0} points)

COMMUNITY DISCUSSION:
${commentsText}${websiteContentText}

Please structure your response as follows:

## 📰 ARTICLE SUMMARY
[Summarize the main article content using direct quotes from the website content when available. Include key points, arguments, and notable statements. Use quotes like "..." to highlight important passages.]

## 💬 COMMUNITY INSIGHTS  
[Summarize the Hacker News discussion using direct quotes from the top comments. Highlight different perspectives, expert opinions, criticisms, and community reactions. Use quotes like "..." to showcase what people are actually saying.]

Requirements:
- Use as many direct quotes as possible in both sections
- Keep quotes short and impactful (1-2 sentences max per quote)
- Include 3-5 quotes per section
- Make it feel like you're hearing directly from the article and community
- Be concise but comprehensive`,
                pdfData: pdfData, // Include PDF data if available
            },
        ];

        try {
            const response = await generateResponse(conversation);
            if (response && response.text && response.text.trim()) {

                // Cache the summary
                dispatch(cacheAISummary({
                    postId,
                    summary: response.text,
                    websiteContent: websiteContentText.includes('WEBSITE CONTENT:') ?
                        websiteContentText.split('WEBSITE CONTENT:')[1]?.trim() : undefined,
                    extractionMethod: 'readability', // We'll update this based on actual extraction
                    processingTime: Date.now() - Date.now(), // We'll calculate this properly
                    originalLength: 0, // We'll calculate this properly
                    extractedLength: response.text.length,
                    compressionRatio: 0, // We'll calculate this properly
                }));

                setShowAISummary(true);

                // Show success toast
                toast.show({
                    placement: 'top',
                    render: ({ id }) => {
                        const toastId = 'toast-' + id;
                        return (
                            <Toast nativeID={toastId}>
                                <VStack>
                                    <ToastTitle>✅ Summary Generated</ToastTitle>
                                    <ToastDescription>
                                        AI summary has been generated and cached
                                    </ToastDescription>
                                </VStack>
                            </Toast>
                        );
                    },
                });
            } else {
                console.log('No response received from AI');
                toast.show({
                    placement: 'top',
                    render: ({ id }) => {
                        const toastId = 'toast-' + id;
                        return (
                            <Toast nativeID={toastId}>
                                <VStack>
                                    <ToastTitle>❌ No Response</ToastTitle>
                                    <ToastDescription>
                                        AI did not return a summary. Please try again.
                                    </ToastDescription>
                                </VStack>
                            </Toast>
                        );
                    },
                });
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.show({
                placement: 'top',
                render: ({ id }) => {
                    const toastId = 'toast-' + id;
                    return (
                        <Toast nativeID={toastId}>
                            <VStack>
                                <ToastTitle>❌ Error</ToastTitle>
                                <ToastDescription>
                                    Failed to generate summary: {error instanceof Error ? error.message : 'Unknown error'}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    return (
        <View
            marginHorizontal={10}
            marginBottom={10}
            style={{
                backgroundColor: 'white',
                ...mainStyles.mainShadow,
                padding: 15,
                borderRadius: 5,
            }}
        >
            {/* Button Container */}
            <View
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
            >
                {/* Main Action Button - Always show if no cached summary, or show toggle if cached */}
                {(!hasCached || !showAISummary) && (
                    <TouchableOpacity
                        onPress={handleGenerateSummary}
                        disabled={isAILoading || isExtractingContent}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: showApiKeyError ? '#dc3545' : mainPurple,
                            padding: 12,
                            borderRadius: 8,
                            opacity: isAILoading || isExtractingContent ? 0.7 : 1,
                        }}
                    >
                        {isAILoading || isExtractingContent ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Feather name="zap" color="white" size={20} />
                        )}
                        <Text
                            color="white"
                            fontSize="$5"
                            fontWeight="600"
                            marginLeft={8}
                        >
                            {isAILoading || isExtractingContent
                                ? (isExtractingContent ? 'Extracting Content...' : 'Generating Summary...')
                                : showApiKeyError
                                    ? '⚠️ API Key Required'
                                    : hasCached
                                        ? 'Show AI Summary'
                                        : 'Generate AI Summary'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* AI Summary Display */}
            {showAISummary && cachedSummary && (
                <View
                    marginTop={12}
                >
                    <View
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom={8}
                    >
                        <Text
                            fontSize="$4"
                            fontWeight="600"
                            color="#495057"
                        >
                            🤖 AI Summary
                        </Text>
                        <View
                            flexDirection="row"
                            alignItems="center"
                        >
                            <Text
                                fontSize="$2"
                                color="#6c757d"
                                marginRight={8}
                            >
                                {new Date(cachedSummary.createdAt).toLocaleDateString()} {new Date(cachedSummary.createdAt).toLocaleTimeString()}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    // Clear the cached summary and regenerate
                                    dispatch(clearAISummary({ postId }));
                                    setShowAISummary(false);
                                    // The next click will regenerate
                                }}
                                style={{
                                    padding: 4,
                                    borderRadius: 4,
                                    backgroundColor: '#e9ecef',
                                    marginRight: 8,
                                }}
                            >
                                <Feather name="refresh-cw" color="#6c757d" size={16} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowAISummary(false)}
                                style={{
                                    padding: 4,
                                    borderRadius: 4,
                                    backgroundColor: '#e9ecef',
                                }}
                            >
                                <Feather name="x" color="#6c757d" size={16} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Markdown
                        style={{
                            body: {
                                fontSize: 16,
                                lineHeight: 24,
                                color: '#495057',
                                fontFamily: 'System',
                            },
                            heading1: {
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#212529',
                                marginTop: 16,
                                marginBottom: 8,
                            },
                            heading2: {
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: '#212529',
                                marginTop: 12,
                                marginBottom: 6,
                            },
                            heading3: {
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: '#212529',
                                marginTop: 10,
                                marginBottom: 4,
                            },
                            paragraph: {
                                marginTop: 8,
                                marginBottom: 8,
                            },
                            strong: {
                                fontWeight: 'bold',
                                color: '#212529',
                            },
                            em: {
                                fontStyle: 'italic',
                            },
                            code_inline: {
                                backgroundColor: '#e9ecef',
                                paddingHorizontal: 4,
                                paddingVertical: 2,
                                borderRadius: 3,
                                fontFamily: 'monospace',
                                fontSize: 14,
                            },
                            code_block: {
                                backgroundColor: '#f8f9fa',
                                padding: 12,
                                borderRadius: 6,
                                fontFamily: 'monospace',
                                fontSize: 14,
                                marginVertical: 8,
                            },
                            blockquote: {
                                backgroundColor: '#f8f9fa',
                                borderLeftWidth: 4,
                                borderLeftColor: '#6c757d',
                                paddingLeft: 12,
                                marginVertical: 8,
                                fontStyle: 'italic',
                            },
                            list_item: {
                                marginVertical: 2,
                            },
                            hr: {
                                backgroundColor: '#dee2e6',
                                height: 1,
                                marginVertical: 16,
                            },
                            link: {
                                color: '#007bff',
                                textDecorationLine: 'underline',
                            },
                            table: {
                                borderWidth: 1,
                                borderColor: '#dee2e6',
                                borderRadius: 6,
                                marginVertical: 8,
                            },
                            th: {
                                backgroundColor: '#f8f9fa',
                                fontWeight: 'bold',
                                padding: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: '#dee2e6',
                            },
                            td: {
                                padding: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: '#dee2e6',
                            },
                        }}
                    >
                        {cachedSummary.summary}
                    </Markdown>
                </View>
            )}

            {/* Chat Button - Only show when AI summary is displayed */}
            {showAISummary && cachedSummary && (
                <View
                    marginTop={12}
                    alignItems="center"
                >
                    <TouchableOpacity
                        onPress={() => {
                            // Navigate to chat screen with post data
                            router.push({
                                pathname: '/post/chat',
                                params: {
                                    postId: postId.toString(),
                                    postTitle: postTitle || '',
                                    postUrl: postUrl || '',
                                    postAuthor: postAuthor || '',
                                    postPoints: postPoints?.toString() || '0',
                                    aiSummary: cachedSummary.summary,
                                }
                            });
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#007AFF',
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            borderRadius: 20,
                            minWidth: 120,
                        }}
                    >
                        <Feather name="message-circle" color="white" size={18} />
                        <Text
                            color="white"
                            fontSize="$4"
                            fontWeight="600"
                            marginLeft={8}
                        >
                            Chat
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default AISummaryButton;
