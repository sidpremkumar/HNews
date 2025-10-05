import * as WebBrowser from "expo-web-browser";
import { Dimensions, Keyboard, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { ScrollView, Text, View } from "tamagui";
import GeminiApiKeyButton from "../../components/SettingsComponents/GeminiApiKeyButton";
import LoginButton from "../../components/SettingsComponents/LoginButton";
import LogoutButton from "../../components/SettingsComponents/LogoutButton";
import UserInfo from "../../components/SettingsComponents/UserInfo";
import ViewProfileButton from "../../components/ViewProfileButton";
import { clearGeminiApiKey } from "../../Redux/settingsReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { mainPurple, spotifyBlack } from "../../utils/main.styles";

export default function App() {
  const windowHeight = Dimensions.get("window").height;
  const dispatch = useDispatch();
  const isUserLoggedIn = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userLoggedIn
  );
  const geminiApiKeySet = useSelector(
    (state: ReduxStoreInterface) => state.settings.geminiApiKeySet
  );

  return (
    <ScrollView height={windowHeight} paddingTop={100}>
      <View
        justifyContent="center"
        alignItems="center"
        alignContent="center"
        width={"100%"}
      >
        <View
          style={styles.container}
          onTouchStart={() => Keyboard.dismiss()}
          width={"90%"}
        >
          <View width={"100%"}>
            <Text color="$gray10" fontSize="$3" marginBottom={8} marginLeft={4}>
              Hacker News Account
            </Text>
            <View gap={8}>
              <UserInfo />
              {isUserLoggedIn === true ? <LogoutButton /> : <LoginButton />}
              {isUserLoggedIn === true && <ViewProfileButton />}
            </View>
          </View>

          <View height={10} />

          <View width={"100%"}>
            {geminiApiKeySet ? (
              <View>
                <Text color="$gray10" fontSize="$3" marginBottom={8} marginLeft={4}>
                  Gemini API Key Set - Actions
                </Text>
                <View gap={8}>
                  <TouchableOpacity
                    onPress={async () => {
                      await WebBrowser.openBrowserAsync(
                        "https://aistudio.google.com/usage"
                      );
                    }}
                  >
                    <View backgroundColor={spotifyBlack} padding={15} borderRadius={10}>
                      <Text color="white" fontSize={"$7"}>
                        📊 See API Usage
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      // Clear from keychain
                      await HackerNewsClient.clearGeminiApiKey();

                      // Update Redux state
                      dispatch(clearGeminiApiKey());
                    }}
                  >
                    <View backgroundColor="#ff4444" padding={15} borderRadius={10}>
                      <Text color="white" fontSize={"$7"}>
                        🗑️ Clear API Key
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <GeminiApiKeyButton />
            )}
          </View>

          <View height={10} />

          <View width={"100%"}>
            <Text color="$gray10" fontSize="$3" marginBottom={8} marginLeft={4}>
              About
            </Text>
            <View gap={8}>
              <TouchableOpacity
                onPress={async () => {
                  await WebBrowser.openBrowserAsync(
                    `https://github.com/sidpremkumar/HNews`
                  );
                }}
              >
                <View backgroundColor={mainPurple} padding={15} borderRadius={10}>
                  <Text color="white" fontSize={"$7"}>
                    📱 Source Code
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
