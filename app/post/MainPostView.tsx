import { useDispatch, useSelector } from "react-redux";
import { Button, View, Text, Image, ScrollView } from "tamagui";
import { PostStateReducer } from "../../Redux/postStateReducer";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { mainGrey, mainPurple, mainStyles } from "../../utils/main.styles";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import domainToEmoji from "../../utils/domainToEmoji";
import dayjs from "dayjs";
import * as WebBrowser from "expo-web-browser";
import { getOpenGraphImageURL } from "../../utils/getOpenGraphImageURL";
import { Dimensions } from "react-native";
import CommentsView from "./CommentsView";
import { setCurrentlyViewingUser } from "../../Redux/userStateReducer";

const MainPostView: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const postDataMapping = useSelector(
    (state: { postState: PostStateReducer }) => state.postState.postDataMapping
  );
  const currentlyViewingPost = useSelector(
    (state: { postState: PostStateReducer }) =>
      state.postState.currentlyViewingPost
  );
  const postMetadata = currentlyViewingPost
    ? postDataMapping[currentlyViewingPost]
    : undefined;
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  useEffect(() => {
    Promise.resolve().then(async () => {
      const openGraphImage = await getOpenGraphImageURL(
        postMetadata?.storyData?.url ?? ""
      );
      if (openGraphImage) {
        setImageURL(openGraphImage);
      }
    });
  }, []);

  useEffect(() => {
    if (!postMetadata?.storyData) {
      router.back();
    }
  }, []);

  const urlDomain = new URL(postMetadata?.storyData?.url ?? "").hostname;
  const emoji = `${domainToEmoji(urlDomain)}`;
  return (
    <View backgroundColor={"white"} height={windowHeight}>
      {/* This is the back button */}
      <View
        position="absolute"
        style={{
          ...mainStyles.standardTopLeftButtonOffset,
        }}
        zIndex={99}
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Button
            style={{ backgroundColor: "transparent" }}
            icon={<Feather name="chevron-left" color={"black"} size={24} />}
          >
            Back
          </Button>
        </TouchableOpacity>
      </View>

      {/* This is the share button */}
      <View
        position="absolute"
        style={{
          ...mainStyles.standardTopRightButtonOffset,
        }}
        zIndex={99}
      >
        <TouchableOpacity
          onPress={async () => {
            await WebBrowser.openBrowserAsync(
              `https://news.ycombinator.com/item?id=${currentlyViewingPost}`
            );
          }}
        >
          <Button
            style={{ backgroundColor: "transparent" }}
            icon={<Feather name="share" color={"black"} size={24} />}
          ></Button>
        </TouchableOpacity>
      </View>

      {/* This is the comments */}
      <View height={windowHeight}>
        <CommentsView
          commentData={postMetadata?.commentData ?? []}
          headerComponent={
            // This is our main post content
            <View
              marginTop={100}
              marginBottom={10}
              marginHorizontal={10}
              style={{
                backgroundColor: "white",
                ...mainStyles.mainShadow,
                padding: 10,
                borderRadius: 5,
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  await WebBrowser.openBrowserAsync(
                    postMetadata?.storyData?.url ?? ""
                  );
                }}
              >
                {/* Title info */}
                <View flexDirection="row">
                  <View width={imageURL ? "75%" : "100%"} flexDirection="row">
                    <Text fontSize={"$8"}>
                      {emoji}
                      {postMetadata?.storyData?.title}
                    </Text>
                  </View>
                  <View
                    width={imageURL === undefined ? "0%" : "25%"}
                    height={imageURL === undefined ? 0 : "100%"}
                  >
                    <Image
                      source={{ uri: imageURL }}
                      height={90}
                      width={windowWidth * 0.23}
                      resizeMode="cover"
                      onError={(err) => {
                        /**
                         * @note removed error here since it wasn't very useful
                         */
                        console.log(`Error loading link preview`);
                        setImageURL(undefined);
                      }}
                    />
                  </View>
                </View>
                {/* Show info on the URL */}
                <Text fontSize={"$3"} color={mainPurple}>
                  {urlDomain}
                </Text>

                {/* Show info on the post itself */}
                <View flexDirection="row">
                  <Text color={mainGrey}>
                    {postMetadata?.storyData?.score} points
                  </Text>
                  <Text color={mainGrey}> • </Text>
                  <View zIndex={99}>
                    <TouchableOpacity
                      onPress={() => {
                        dispatch(
                          setCurrentlyViewingUser({
                            newState: postMetadata?.storyData?.by ?? "",
                          })
                        );
                        router.push("/user");
                      }}
                    >
                      <Text color={mainGrey}>
                        {postMetadata?.storyData?.by}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text color={mainGrey}> • </Text>
                  <Text color={mainGrey}>
                    {dayjs((postMetadata?.storyData?.time ?? 0) * 1000).format(
                      "ddd MMM DD, YYYY"
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
};
export default MainPostView;