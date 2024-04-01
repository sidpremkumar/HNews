import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { View, Text } from "tamagui";
import { mainPurple } from "../../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";

export default function App() {
  return (
    <View style={styles.container}>
      <Text fontSize={"$8"}>User Management Coming Soon 🚀</Text>

      <View height={20} />

      <View>
        <TouchableOpacity
          onPress={async () => {
            await WebBrowser.openBrowserAsync(
              `https://github.com/sidpremkumar/HNews`
            );
          }}
        >
          <View backgroundColor={mainPurple} padding={15} borderRadius={10}>
            <Text color="white" fontSize={"$7"}>
              SourceCode
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
