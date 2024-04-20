import { Dimensions, Keyboard, StyleSheet } from "react-native";
import { View, Text, ScrollView } from "tamagui";
import { mainPurple } from "../../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";
import { ReduxStoreInterface } from "../../Redux/store";
import { useSelector } from "react-redux";
import LoginButton from "../../components/SettingsComponents/LoginButton";
import LogoutButton from "../../components/SettingsComponents/LogoutButton";
import UserInfo from "../../components/SettingsComponents/UserInfo";
import ViewProfileButton from "../../components/ViewProfileButton";

export default function App() {
  const windowHeight = Dimensions.get("window").height;
  const isUserLoggedIn = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userLoggedIn
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
            <UserInfo />
          </View>

          <View width={"100%"}>
            {isUserLoggedIn === true ? <LogoutButton /> : <LoginButton />}
          </View>

          <View height={10} />

          <View width={"100%"}>
            {isUserLoggedIn === true ? <ViewProfileButton /> : <></>}
          </View>

          <View height={10} />

          <View width={"100%"}>
            <TouchableOpacity
              onPress={async () => {
                await WebBrowser.openBrowserAsync(
                  `https://github.com/sidpremkumar/HNews`
                );
              }}
            >
              <View backgroundColor={mainPurple} padding={15} borderRadius={10}>
                <Text color="white" fontSize={"$7"}>
                  Source Code
                </Text>
              </View>
            </TouchableOpacity>
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
