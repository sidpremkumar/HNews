import { useDispatch, useSelector } from "react-redux";
import { Button, View, Text, TextArea } from "tamagui";
import {
  PostStateReducer,
  decreaseUpvoteNumber,
  increaseUpvoteNumber,
} from "../../Redux/postStateReducer";
import React, { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { mainGrey, mainPurple, mainStyles } from "../../utils/main.styles";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import domainToEmoji from "../../utils/domainToEmoji";
import dayjs from "dayjs";
import * as WebBrowser from "expo-web-browser";
import { getOpenGraphImageURL } from "../../utils/getOpenGraphImageURL";
import { ActivityIndicator, Dimensions } from "react-native";
import CommentsView from "./CommentsView";
import { setCurrentlyViewingUser } from "../../Redux/userStateReducer";
import WebView from "react-native-webview";
import { webViewScript } from "../../components/RecursiveComment";
import RenderLinkIcon from "../../components/RenderLinkIcon";
import getRelativeOrAbsoluteTime from "../../utils/getRelativeOrAbsoluteTime";
import { ReduxStoreInterface } from "../../Redux/store";
import {
  useToast,
  VStack,
  ToastTitle,
  ToastDescription,
  Toast,
} from "@gluestack-ui/themed";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import CommentDialog from "../../components/PostComponents/CommentDialog";

const MainPostView: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const toast = useToast();
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
  const isUserLoggedIn = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userLoggedIn
  );
  const postMetadata = currentlyViewingPost
    ? postDataMapping[currentlyViewingPost]
    : undefined;
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const windowHeight = Dimensions.get("window").height;
  const [parsedElement, setParsedElement] = useState<
    Awaited<ReturnType<typeof HackerNewsClient.getParsedHTML>> | undefined
  >(undefined);
  const [upvoteURL, setUpvoteURL] = useState<string | undefined>(undefined);
  const [downvoteURL, setDownvoteURL] = useState<string | undefined>(undefined);
  const [refresh, setRefresh] = useState<boolean>(false);

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
    Promise.resolve().then(async () => {
      setParsedElement(undefined);
      const parsedHTML = await HackerNewsClient.getParsedHTML(
        currentlyViewingPost ?? -1
      );

      await Promise.all([
        HackerNewsClient.getUpvoteUrl(
          `${postMetadata?.storyData?.id ?? 0}`,
          parsedHTML
        ).then((u) => setUpvoteURL(u)),
        HackerNewsClient.getDownvoteUrl(
          `${postMetadata?.storyData?.id ?? 0}`,
          parsedHTML
        ).then((d) => setDownvoteURL(d)),
      ]);

      setParsedElement(parsedHTML);

      setRefresh(false);
    });
  }, [downvoteURL, upvoteURL, refresh]);

  useEffect(() => {
    if (!postMetadata?.storyData) {
      router.back();
    }
  }, []);

  const urlDomain = new URL(
    postMetadata?.storyData?.url ??
      `https://${postMetadata?.storyData?.author}.com`
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

      {/* This is the loading the page view */}
      {parsedElement === undefined ? (
        <View
          position="absolute"
          style={{
            bottom: 40,
            right: 40,
          }}
          zIndex={99}
        >
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor={"white"}
            borderRadius={10}
            opacity={0.8}
          />
          <ActivityIndicator />
          <Text fontSize={"$1"}>Parsing HTML...</Text>
        </View>
      ) : (
        <></>
      )}

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
          parsedElement={parsedElement}
          setRefresh={setRefresh}
          postId={postMetadata?.storyData?.id ?? 0}
          postOP={postMetadata?.storyData?.author ?? ""}
          initalKids={postMetadata?.storyData?.children ?? []}
          headerComponent={
            <View>
              {/* // This is our main post content */}
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
                <View position="absolute" right={5} top={0}>
                  <CommentDialog />
                </View>
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

                    <View width={"25%"} height={"100%"} marginTop={10}>
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
                      {postMetadata?.storyData?.points} points
                    </Text>
                    <Text color={mainGrey}> • </Text>
                    <View zIndex={99}>
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            setCurrentlyViewingUser({
                              newState: postMetadata?.storyData?.author ?? "",
                            })
                          );
                          router.push("/user");
                        }}
                      >
                        <Text color={mainGrey}>
                          {postMetadata?.storyData?.author}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text color={mainGrey}> • </Text>
                    <Text color={mainGrey}>
                      {getRelativeOrAbsoluteTime(
                        dayjs(postMetadata?.storyData?.created_at)
                      )}
                    </Text>

                    <Text color={mainGrey}> • </Text>
                    <View zIndex={99}>
                      <TouchableOpacity
                        onPress={async () => {
                          if (isUserLoggedIn === false) {
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
                                        🚨 Please Login First
                                      </ToastTitle>
                                      <ToastDescription>
                                        You must login before you can continue
                                      </ToastDescription>
                                    </VStack>
                                  </Toast>
                                );
                              },
                            });
                            return;
                          }

                          if (upvoteURL) {
                            const response =
                              await HackerNewsClient.makeAuthRequest(upvoteURL);
                            if (response === true) {
                              dispatch(
                                increaseUpvoteNumber({
                                  postId: postMetadata?.storyData?.id ?? 0,
                                })
                              );

                              setUpvoteURL(undefined);
                            }
                          } else if (downvoteURL) {
                            const response =
                              await HackerNewsClient.makeAuthRequest(
                                downvoteURL
                              );
                            if (response === true) {
                              dispatch(
                                decreaseUpvoteNumber({
                                  postId: postMetadata?.storyData?.id ?? 0,
                                })
                              );

                              setDownvoteURL(undefined);
                            }
                          }
                        }}
                      >
                        <Text color={mainGrey}>
                          {upvoteURL !== undefined
                            ? "upvote"
                            : downvoteURL !== undefined
                            ? "unvote"
                            : ""}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* <View marginHorizontal={10}>
                <TextArea
                  size="$4"
                  borderWidth={2}
                  placeholder="very cool comment"
                />
                <TouchableOpacity style={{}}>
                  <View
                    flex={1}
                    backgroundColor={"transparent"}
                    alignItems="flex-end"
                  >
                    <Text>
                      <View backgroundColor={"transparent"}>
                        <Text>Add Comment</Text>
                      </View>
                    </Text>
                  </View>
                </TouchableOpacity>
              </View> */}
            </View>
          }
        />
      </View>
    </View>
  );
};
export default MainPostView;
