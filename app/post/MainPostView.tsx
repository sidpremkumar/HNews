import { useDispatch, useSelector } from "react-redux";
import { Button, View, Text, Image, ScrollView } from "tamagui";
import { PostStateReducer } from "../../Redux/postStateReducer";
import React, { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import {
  mainGrey,
  mainPurple,
  mainStyles,
  spotifyBlack,
} from "../../utils/main.styles";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import domainToEmoji from "../../utils/domainToEmoji";
import dayjs from "dayjs";
import * as WebBrowser from "expo-web-browser";
import { getOpenGraphImageURL } from "../../utils/getOpenGraphImageURL";
import { Dimensions } from "react-native";
import CommentsView from "./CommentsView";
import { setCurrentlyViewingUser } from "../../Redux/userStateReducer";
import WebView from "react-native-webview";
import { webViewScript } from "../../components/RecursiveComment";
import RenderLinkIcon from "../../components/RenderLinkIcon";
import getRelativeOrAbsoluteTime from "../../utils/getRelativeOrAbsoluteTime";

const MainPostView: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const webViewRef = useRef(null);
  const [webviewHeight, setWebviewHeight] = useState<number | undefined>(
    undefined
  );
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

  const urlDomain = new URL(
    postMetadata?.storyData?.url ?? `https://${postMetadata?.storyData?.by}.com`
  ).hostname;
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
          postId={postMetadata?.storyData?.id ?? 0}
          initalKids={postMetadata?.storyData?.kids ?? []}
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
                  <View width={"75%"}>
                    <Text fontSize={"$8"}>
                      {emoji}
                      {postMetadata?.storyData?.title}
                    </Text>
                  </View>

                  <View width={"25%"} height={"100%"}>
                    <RenderLinkIcon
                      urlDomain={urlDomain}
                      imageURL={imageURL}
                      setImageURL={setImageURL}
                    />
                  </View>
                </View>

                {/* text body if it exists */}
                {postMetadata?.storyData?.text ? (
                  <View>
                    <WebView
                      injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight);$(document).ready(function(){
$(this).scrollTop(0);
});"
                      source={{
                        html: `<html>
<head><meta name="viewport" content="width=device-width"></head>
<body>${postMetadata?.storyData?.text}</body>
</html>`,
                      }}
                      scrollEnabled={true}
                      ref={webViewRef}
                      onLoadEnd={() =>
                        // @ts-ignore
                        webViewRef.current?.injectJavaScript(webViewScript)
                      }
                      style={{ flex: 1, height: webviewHeight }}
                      onMessage={(e: { nativeEvent: { data?: string } }) => {
                        setWebviewHeight(Number(e.nativeEvent.data));
                      }}
                      onShouldStartLoadWithRequest={(request: {
                        url: string;
                      }) => {
                        if (request.url !== "about:blank") {
                          WebBrowser.openBrowserAsync(request.url);
                          return false;
                        } else return true;
                      }}
                    />
                  </View>
                ) : (
                  <></>
                )}

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
                    {getRelativeOrAbsoluteTime(
                      dayjs((postMetadata?.storyData?.time ?? 0) * 1000)
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
