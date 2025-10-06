import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Text, View } from 'tamagui';
import { addMessageToChatHistory, saveChatHistoryForPost } from '../../Redux/chatHistoryReducer';
import { ReduxStoreInterface, useAppDispatch } from '../../Redux/store';
import { saveChatHistoryForPost as saveChatHistoryToStorage } from '../../utils/chatPersistentStorage';
import { ConversationMessage, useGeminiAI } from '../../utils/useGeminiAI';

interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const ChatScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const {
        postId,
        postTitle,
        postUrl,
        postAuthor,
        postPoints,
        aiSummary,
    } = params;

    // Initialize AI hook
    const { generateResponse, isLoading: isAILoading, hasApiKey } = useGeminiAI({
        temperature: 0.7,
        maxTokens: 1024,
    });

    // Redux integration
    const dispatch = useAppDispatch();
    const chatHistoryState = useSelector((state: ReduxStoreInterface) =>
        state.chatHistory.chatHistory[postId?.toString() || '']
    );

    // Initialize with existing chat history or create new
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (chatHistoryState?.messages) {
            return chatHistoryState.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
        }
        return [{
            id: '1',
            text: `Here's the AI summary for "${postTitle}":\n\n${aiSummary}`,
            isUser: false,
            timestamp: new Date(),
        }];
    });

    const [inputText, setInputText] = useState('');
    const [chatHistory, setChatHistory] = useState<ConversationMessage[]>(() => {
        if (chatHistoryState?.conversationHistory) {
            return chatHistoryState.conversationHistory;
        }
        return [{
            role: 'system',
            body: `You are an AI assistant helping users discuss and analyze Hacker News posts. 

CONTEXT:
- Post Title: ${postTitle}
- Post URL: ${postUrl || 'No URL'}
- Post Author: ${postAuthor}
- Post Points: ${postPoints}
- AI Summary: ${aiSummary}

You should use this context and the chat history to answer user questions about this post. Be helpful, informative, and engaging. You can discuss the article content, community reactions, technical aspects, or any related topics the user brings up.`,
        }];
    });

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);

        // Add user message to chat history
        const newChatHistory = [...chatHistory, {
            role: 'user' as const,
            body: inputText.trim(),
        }];
        setChatHistory(newChatHistory);

        // Save user message to Redux and persistent storage
        dispatch(addMessageToChatHistory({
            postId: Number(postId),
            message: {
                id: userMessage.id,
                text: userMessage.text,
                isUser: userMessage.isUser,
                timestamp: userMessage.timestamp.toISOString(),
            },
            conversationEntry: {
                role: 'user',
                body: inputText.trim(),
            }
        }));

        setInputText('');

        try {
            // Generate AI response using the full chat history
            const response = await generateResponse(newChatHistory);

            if (response && response.text) {
                const aiResponse: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response.text,
                    isUser: false,
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, aiResponse]);

                // Add AI response to chat history
                const updatedChatHistory = [...newChatHistory, {
                    role: 'assistant' as const,
                    body: response.text,
                }];
                setChatHistory(updatedChatHistory);

                // Save AI response to Redux and persistent storage
                dispatch(addMessageToChatHistory({
                    postId: Number(postId),
                    message: {
                        id: aiResponse.id,
                        text: aiResponse.text,
                        isUser: aiResponse.isUser,
                        timestamp: aiResponse.timestamp.toISOString(),
                    },
                    conversationEntry: {
                        role: 'assistant',
                        body: response.text,
                    }
                }));

                // Save complete chat history to persistent storage
                const allMessages = [...messages, userMessage, aiResponse];
                const allConversationHistory = updatedChatHistory;

                dispatch(saveChatHistoryForPost({
                    postId: Number(postId),
                    messages: allMessages.map(msg => ({
                        id: msg.id,
                        text: msg.text,
                        isUser: msg.isUser,
                        timestamp: msg.timestamp.toISOString(),
                    })),
                    conversationHistory: allConversationHistory,
                }));

                // Also save to persistent storage
                saveChatHistoryToStorage(
                    Number(postId),
                    allMessages.map(msg => ({
                        id: msg.id,
                        text: msg.text,
                        isUser: msg.isUser,
                        timestamp: msg.timestamp.toISOString(),
                    })),
                    allConversationHistory
                );
            } else {
                // Handle case where AI doesn't respond
                const errorResponse: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: "I'm sorry, I couldn't generate a response. Please try again or check your API key in settings.",
                    isUser: false,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorResponse]);
            }
        } catch (error) {
            console.error('Error generating AI response:', error);
            const errorResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "I encountered an error while generating a response. Please try again.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorResponse]);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
            {/* Header */}
            <View
                backgroundColor="white"
                paddingHorizontal={16}
                paddingVertical={16}
                borderBottomWidth={1}
                borderBottomColor="#E5E5EA"
                flexDirection="row"
                alignItems="center"
            >
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 16,
                    }}
                >
                    <Feather name="arrow-left" size={20} color="#007AFF" />
                </TouchableOpacity>

                {/* Content centered in remaining space */}
                <View
                    alignItems="center"
                    flex={1}
                >
                    <Text
                        fontSize="$5"
                        fontWeight="600"
                        color="#000"
                        textAlign="center"
                        marginBottom={2}
                    >
                        Chat
                    </Text>
                    <Text
                        fontSize="$3"
                        color="#8E8E93"
                        textAlign="center"
                        numberOfLines={2}
                        maxWidth="100%"
                    >
                        {postTitle}
                    </Text>
                    {!hasApiKey && (
                        <Text
                            fontSize="$2"
                            color="#FF3B30"
                            textAlign="center"
                            marginTop={4}
                        >
                            ⚠️ API Key Required
                        </Text>
                    )}
                </View>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            marginBottom={12}
                            alignItems={message.isUser ? 'flex-end' : 'flex-start'}
                        >
                            <View
                                backgroundColor={message.isUser ? '#007AFF' : '#E5E5EA'}
                                paddingHorizontal={16}
                                paddingVertical={12}
                                borderRadius={18}
                                maxWidth="80%"
                                style={{
                                    borderBottomRightRadius: message.isUser ? 4 : 18,
                                    borderBottomLeftRadius: message.isUser ? 18 : 4,
                                }}
                            >
                                {message.isUser ? (
                                    <Text
                                        color="white"
                                        fontSize="$4"
                                        lineHeight={20}
                                    >
                                        {message.text}
                                    </Text>
                                ) : (
                                    <Markdown
                                        style={{
                                            body: {
                                                fontSize: 16,
                                                lineHeight: 20,
                                                color: '#000',
                                                fontFamily: 'System',
                                                margin: 0,
                                                padding: 0,
                                            },
                                            heading1: {
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                color: '#000',
                                                marginTop: 8,
                                                marginBottom: 4,
                                            },
                                            heading2: {
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                color: '#000',
                                                marginTop: 6,
                                                marginBottom: 3,
                                            },
                                            heading3: {
                                                fontSize: 15,
                                                fontWeight: 'bold',
                                                color: '#000',
                                                marginTop: 4,
                                                marginBottom: 2,
                                            },
                                            paragraph: {
                                                marginTop: 4,
                                                marginBottom: 4,
                                            },
                                            strong: {
                                                fontWeight: 'bold',
                                                color: '#000',
                                            },
                                            em: {
                                                fontStyle: 'italic',
                                            },
                                            code_inline: {
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                paddingHorizontal: 3,
                                                paddingVertical: 1,
                                                borderRadius: 3,
                                                fontFamily: 'monospace',
                                                fontSize: 13,
                                            },
                                            code_block: {
                                                backgroundColor: 'rgba(0,0,0,0.05)',
                                                padding: 8,
                                                borderRadius: 4,
                                                fontFamily: 'monospace',
                                                fontSize: 13,
                                                marginVertical: 4,
                                            },
                                            blockquote: {
                                                backgroundColor: 'rgba(0,0,0,0.05)',
                                                borderLeftWidth: 3,
                                                borderLeftColor: '#8E8E93',
                                                paddingLeft: 8,
                                                marginVertical: 4,
                                                fontStyle: 'italic',
                                            },
                                            list_item: {
                                                marginVertical: 1,
                                            },
                                            hr: {
                                                backgroundColor: '#8E8E93',
                                                height: 1,
                                                marginVertical: 8,
                                            },
                                            link: {
                                                color: '#007AFF',
                                                textDecorationLine: 'underline',
                                            },
                                        }}
                                    >
                                        {message.text}
                                    </Markdown>
                                )}
                            </View>
                            <Text
                                fontSize="$2"
                                color="#8E8E93"
                                marginTop={4}
                                marginHorizontal={4}
                            >
                                {formatTime(message.timestamp)}
                            </Text>
                        </View>
                    ))}

                    {isAILoading && (
                        <View
                            marginBottom={12}
                            alignItems="flex-start"
                        >
                            <View
                                backgroundColor="#E5E5EA"
                                paddingHorizontal={16}
                                paddingVertical={12}
                                borderRadius={18}
                                borderBottomLeftRadius={4}
                                flexDirection="row"
                                alignItems="center"
                            >
                                <ActivityIndicator size="small" color="#8E8E93" />
                                <Text
                                    color="#8E8E93"
                                    fontSize="$3"
                                    marginLeft={8}
                                >
                                    AI is thinking...
                                </Text>
                            </View>
                        </View>
                    )}

                    {!hasApiKey && messages.length === 1 && (
                        <View
                            marginBottom={12}
                            alignItems="center"
                        >
                            <View
                                backgroundColor="#FFF3CD"
                                paddingHorizontal={16}
                                paddingVertical={12}
                                borderRadius={12}
                                borderWidth={1}
                                borderColor="#FFEAA7"
                                maxWidth="90%"
                            >
                                <Text
                                    color="#856404"
                                    fontSize="$4"
                                    textAlign="center"
                                    fontWeight="500"
                                >
                                    🔑 API Key Required
                                </Text>
                                <Text
                                    color="#856404"
                                    fontSize="$3"
                                    textAlign="center"
                                    marginTop={4}
                                >
                                    Please set your Gemini API Key in settings to start chatting with AI.
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View
                    backgroundColor="white"
                    paddingHorizontal={16}
                    paddingVertical={12}
                    borderTopWidth={1}
                    borderTopColor="#E5E5EA"
                >
                    <View
                        flexDirection="row"
                        alignItems="flex-end"
                        backgroundColor="#F2F2F7"
                        borderRadius={20}
                        paddingHorizontal={16}
                        paddingVertical={8}
                    >
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            placeholderTextColor="#8E8E93"
                            style={{
                                flex: 1,
                                fontSize: 16,
                                lineHeight: 20,
                                maxHeight: 100,
                                paddingVertical: 8,
                            }}
                            multiline
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            onPress={handleSendMessage}
                            disabled={!inputText.trim() || isAILoading}
                            style={{
                                backgroundColor: inputText.trim() ? '#007AFF' : '#C7C7CC',
                                borderRadius: 16,
                                padding: 8,
                                marginLeft: 8,
                                opacity: inputText.trim() && !isAILoading ? 1 : 0.6,
                            }}
                        >
                            <Feather
                                name="send"
                                size={16}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;
