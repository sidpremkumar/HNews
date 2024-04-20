import { View, Text } from "tamagui";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { spotifyBlack } from "../utils/main.styles";
import { ReduxStoreInterface } from "../Redux/store";
import * as WebBrowser from "expo-web-browser";

const ViewProfileButton: React.FC<{ profileName?: string }> = ({
  profileName,
}) => {
  const userName = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userName
  );
  return (
    <TouchableOpacity
      onPress={async () => {
        if (profileName) {
          await WebBrowser.openBrowserAsync(
            `https://news.ycombinator.com/user?id=${profileName}`
          );
        } else if (userName) {
          await WebBrowser.openBrowserAsync(
            `https://news.ycombinator.com/user?id=${userName}`
          );
        }
      }}
    >
      <View backgroundColor={spotifyBlack} padding={15} borderRadius={10}>
        <Text color="white" fontSize={"$7"}>
          View Profile
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ViewProfileButton;
