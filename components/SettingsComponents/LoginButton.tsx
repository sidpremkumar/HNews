import { useState } from "react";
import {
  useToast,
  VStack,
  ToastTitle,
  ToastDescription,
  Toast,
} from "@gluestack-ui/themed";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import {
  View,
  Text,
  Adapt,
  Dialog,
  Fieldset,
  Input,
  Label,
  Sheet,
  Unspaced,
  XStack,
  Button,
} from "tamagui";
import { spotifyBlack } from "../../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { setUserLoggedIn, setUserName } from "../../Redux/authUserReducer";
import * as WebBrowser from "expo-web-browser";

const LoginButton: React.FC<{}> = () => {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const toast = useToast();
  const dispatch = useDispatch();
  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <View>
          <View backgroundColor={spotifyBlack} padding={15} borderRadius={10}>
            <Text color="white" fontSize={"$7"}>
              Log In
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
          <Dialog.Title>Log In</Dialog.Title>
          <Dialog.Description>
            Log In to your Hacker News account.
          </Dialog.Description>

          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Username
            </Label>
            <Input
              flex={1}
              id="name"
              autoCapitalize="none"
              placeholder="very-cool-username"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </Fieldset>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Password
            </Label>
            <Input
              secureTextEntry={true}
              flex={1}
              autoCapitalize="none"
              id="password"
              defaultValue=""
              value={password}
              onChangeText={(text) => setPassword(text)}
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
                onPress={async () => {
                  if (!username || !password) {
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
                                🚨 Enter username/password
                              </ToastTitle>
                              <ToastDescription>
                                Double check you've entered a username and
                                password
                              </ToastDescription>
                            </VStack>
                          </Toast>
                        );
                      },
                    });
                    return;
                  }
                  /**
                   * Validate the username and password even exist
                   */
                  const result =
                    await HackerNewsClient.validateAndSaveCredentials(
                      username,
                      password
                    );
                  if (result === false) {
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
                              <ToastTitle>🚨 Invalid Credentils</ToastTitle>
                              <ToastDescription>
                                Double check your username/password
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
                            <ToastTitle>🙌 Success</ToastTitle>
                          </VStack>
                        </Toast>
                      );
                    },
                  });

                  /**
                   * Clear input
                   */
                  dispatch(setUserLoggedIn({ newState: true }));
                  dispatch(setUserName({ newState: username }));
                  setPassword(undefined);
                  setUsername(undefined);

                  return;
                }}
              >
                Submit
              </Button>
            </Dialog.Close>
          </XStack>

          <Dialog.Description>
            We use{" "}
            <TouchableOpacity
              onPress={async () => {
                await WebBrowser.openBrowserAsync(
                  "https://github.com/oblador/react-native-keychain?tab=readme-ov-file#setgenericpasswordusername-password--accesscontrol-accessible-accessgroup-service-securitylevel"
                );
              }}
            >
              <Text color="purple">react-native-keychain</Text>
            </TouchableOpacity>{" "}
            to store credentials on the device.
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
  );
};

export default LoginButton;
