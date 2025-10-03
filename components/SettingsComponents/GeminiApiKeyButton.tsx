import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
    VStack,
} from "@gluestack-ui/themed";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Adapt,
    Button,
    Dialog,
    Fieldset,
    Input,
    Label,
    Sheet,
    Text,
    Unspaced,
    View,
    XStack,
} from "tamagui";
import { clearGeminiApiKey, setGeminiApiKey } from "../../Redux/settingsReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { mainPurple } from "../../utils/main.styles";

const GeminiApiKeyButton: React.FC<{}> = () => {
    const [apiKey, setApiKey] = useState<string | undefined>(undefined);
    const toast = useToast();
    const dispatch = useDispatch();

    const geminiApiKeySet = useSelector(
        (state: ReduxStoreInterface) => state.settings.geminiApiKeySet
    );

    const handleSetApiKey = async () => {
        if (!apiKey || apiKey.trim() === "") {
            toast.show({
                placement: "top",
                render: ({ id }) => {
                    const toastId = "toast-" + id;
                    return (
                        <Toast
                            nativeID={toastId}
                            action="attention"
                            variant="solid"
                        >
                            <VStack space="xs">
                                <ToastTitle>
                                    🚨 Enter API Key
                                </ToastTitle>
                                <ToastDescription>
                                    Please enter a valid Gemini API Key
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
            return;
        }

        // Basic validation - Gemini API keys typically start with "AIza"
        if (!apiKey.startsWith("AIza")) {
            toast.show({
                placement: "top",
                render: ({ id }) => {
                    const toastId = "toast-" + id;
                    return (
                        <Toast
                            nativeID={toastId}
                            action="attention"
                            variant="solid"
                        >
                            <VStack space="xs">
                                <ToastTitle>🚨 Invalid API Key Format</ToastTitle>
                                <ToastDescription>
                                    Gemini API keys typically start with "AIza"
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
            return;
        }

        toast.show({
            placement: "top",
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast
                        nativeID={toastId}
                        action="attention"
                        variant="solid"
                    >
                        <VStack space="xs">
                            <ToastTitle>🙌 API Key Saved</ToastTitle>
                            <ToastDescription>
                                Your Gemini API Key has been saved successfully
                            </ToastDescription>
                        </VStack>
                    </Toast>
                );
            },
        });

        // Save to keychain
        await HackerNewsClient.saveGeminiApiKey(apiKey);

        // Update Redux state
        dispatch(setGeminiApiKey({ newState: apiKey }));
        setApiKey(undefined);
    };

    const handleClearApiKey = async () => {
        // Clear from keychain
        await HackerNewsClient.clearGeminiApiKey();

        // Update Redux state
        dispatch(clearGeminiApiKey());

        toast.show({
            placement: "top",
            render: ({ id }) => {
                const toastId = "toast-" + id;
                return (
                    <Toast
                        nativeID={toastId}
                        action="attention"
                        variant="solid"
                    >
                        <VStack space="xs">
                            <ToastTitle>🗑️ API Key Cleared</ToastTitle>
                            <ToastDescription>
                                Your Gemini API Key has been removed
                            </ToastDescription>
                        </VStack>
                    </Toast>
                );
            },
        });
    };

    return (
        <View width={"100%"}>
            {geminiApiKeySet ? (
                <View>
                    <View backgroundColor={mainPurple} padding={15} borderRadius={10} marginBottom={10}>
                        <Text color="white" fontSize={"$7"} textAlign="center">
                            ✅ Gemini API Key Set
                        </Text>
                    </View>
                    <Button
                        backgroundColor="#ff4444"
                        color="white"
                        onPress={handleClearApiKey}
                        borderRadius={10}
                    >
                        Clear API Key
                    </Button>
                </View>
            ) : (
                <Dialog modal>
                    <Dialog.Trigger asChild>
                        <View>
                            <View backgroundColor={mainPurple} padding={15} borderRadius={10}>
                                <Text color="white" fontSize={"$7"}>
                                    Set Gemini API Key
                                </Text>
                            </View>
                        </View>
                    </Dialog.Trigger>

                    <Adapt when="sm" platform="touch">
                        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
                            <Sheet.Frame padding="$4" gap="$4">
                                <Adapt.Contents />
                            </Sheet.Frame>
                            <Sheet.Overlay
                                animation="lazy"
                                enterStyle={{ opacity: 0 }}
                                exitStyle={{ opacity: 0 }}
                            />
                        </Sheet>
                    </Adapt>

                    <Dialog.Portal>
                        <Dialog.Overlay
                            key="overlay"
                            animation="slow"
                            opacity={0.5}
                            enterStyle={{ opacity: 0 }}
                            exitStyle={{ opacity: 0 }}
                        />

                        <Dialog.Content
                            bordered
                            elevate
                            key="content"
                            animateOnly={["transform", "opacity"]}
                            animation={[
                                "quicker",
                                {
                                    opacity: {
                                        overshootClamping: true,
                                    },
                                },
                            ]}
                            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                            gap="$4"
                        >
                            <Dialog.Title>Set Gemini API Key</Dialog.Title>
                            <Dialog.Description>
                                Enter your Gemini API Key to enable AI features.
                            </Dialog.Description>

                            <Fieldset gap="$4" horizontal>
                                <Label width={160} justifyContent="flex-end" htmlFor="apikey">
                                    API Key
                                </Label>
                                <Input
                                    flex={1}
                                    id="apikey"
                                    autoCapitalize="none"
                                    placeholder="AIza..."
                                    value={apiKey}
                                    onChangeText={(text) => setApiKey(text)}
                                />
                            </Fieldset>

                            <XStack alignSelf="flex-end" gap="$4">
                                <Dialog.Close displayWhenAdapted asChild>
                                    <Button theme="active" aria-label="Close">
                                        Cancel
                                    </Button>
                                </Dialog.Close>
                                <Dialog.Close displayWhenAdapted asChild>
                                    <Button
                                        theme="active"
                                        aria-label="Close"
                                        onPress={handleSetApiKey}
                                    >
                                        Save
                                    </Button>
                                </Dialog.Close>
                            </XStack>

                            <Dialog.Description>
                                <Text>
                                    Get your API key from{" "}
                                    <Text
                                        color="purple"
                                        style={{ textDecorationLine: 'underline' }}
                                        onPress={async () => {
                                            await WebBrowser.openBrowserAsync(
                                                "https://makersuite.google.com/app/apikey"
                                            );
                                        }}
                                    >
                                        Google AI Studio
                                    </Text>
                                </Text>
                            </Dialog.Description>

                            <Unspaced>
                                <Dialog.Close asChild>
                                    <Button
                                        position="absolute"
                                        top="$3"
                                        right="$3"
                                        size="$2"
                                        circular
                                    />
                                </Dialog.Close>
                            </Unspaced>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog>
            )}
        </View>
    );
};

export default GeminiApiKeyButton;
