import { View, Text } from "tamagui";
import { spotifyBlack } from "../../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../../Redux/authUserReducer";

const LogoutButton: React.FC<{}> = () => {
  const dispatch = useDispatch();
  return (
    <TouchableOpacity
      onPress={async () => {
        await HackerNewsClient.logout();
        dispatch(setUserLoggedIn({ newState: false }));
      }}
    >
      <View backgroundColor={spotifyBlack} padding={15} borderRadius={10}>
        <Text color="white" fontSize={"$7"}>
          Log Out
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LogoutButton;
