import { Dimensions } from "react-native";
import { View, Text, Image } from "tamagui";
import { spotifyBlack } from "../utils/main.styles";

const RenderLinkIcon: React.FC<{
  urlDomain: string;
  imageURL?: string;
  setImageURL: (newState?: string) => void;
}> = ({ urlDomain, imageURL, setImageURL }) => {
  const windowWidth = Dimensions.get("window").width;
  const imageWidth = windowWidth * 0.22;
  return (
    <View
      height={imageWidth}
      width={imageWidth}
      borderRadius={10}
      overflow="hidden"
    >
      {imageURL === undefined ? (
        <View
          height={imageWidth}
          width={imageWidth}
          backgroundColor={spotifyBlack}
          justifyContent="center"
          alignItems="center"
          alignContent="center"
        >
          <Text fontSize={"$10"} color={"white"}>
            {urlDomain.replace("www.", "")[0]
              ? urlDomain.replace("www.", "")[0].toLocaleUpperCase()
              : ""}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageURL }}
          height={imageWidth}
          width={imageWidth}
          resizeMode="cover"
          onError={(err) => {
            console.log(`Error loading link preview`, err);
            setImageURL(undefined);
          }}
        />
      )}
    </View>
  );
};
export default RenderLinkIcon;
