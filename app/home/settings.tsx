import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { View, Text } from "tamagui";

export default function App() {
  return (
    <View style={styles.container}>
      <Text fontSize={"$8"}>User Settings Coming Soon 🚀</Text>
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
