import { Feather } from "@expo/vector-icons";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import dayjs from "dayjs";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import WebView from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, View } from "tamagui";
import AISummaryButton from "../../components/PostComponents/AISummaryButton";
import CommentDialog from "../../components/PostComponents/CommentDialog";
import { webViewScript } from "../../components/RecursiveComment";
import RenderLinkIcon from "../../components/RenderLinkIcon";
import { getFavoritesCount, isFavorited, toggleFavorite } from "../../Redux/favoritesReducer";
import {
  decreaseUpvoteNumber,
  increaseUpvoteNumber,
  PostStateReducer,
} from "../../Redux/postStateReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import { setCurrentlyViewingUser } from "../../Redux/userStateReducer";
import domainToEmoji from "../../utils/domainToEmoji";
import { getOpenGraphImageURL } from "../../utils/getOpenGraphImageURL";
import getRelativeOrAbsoluteTime from "../../utils/getRelativeOrAbsoluteTime";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { mainGrey, mainPurple, mainStyles } from "../../utils/main.styles";
import CommentsView from "./CommentsView";

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
  const isPostFavorited = useSelector((state: ReduxStoreInterface) =>
    isFavorited(state, postMetadata?.storyData?.id ?? 0)
  );
  const totalFavorites = useSelector((state: ReduxStoreInterface) =>
    getFavoritesCount(state)
  );

  // Debug logging for favorites
  console.log('🔍 MainPostView favorites debug:', {
    postId: postMetadata?.storyData?.id,
    isPostFavorited,
    totalFavorites
  });
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

      {/* This is the share and favorite buttons */}
      <View
        position="absolute"
        style={{
          top: 50,
          right: 10,
        }}
        zIndex={99}
        flexDirection="row"
        gap={2}
      >
        {/* Favorite button */}
        <TouchableOpacity
          onPress={() => {
            if (postMetadata?.storyData) {
              const wasFavorited = isPostFavorited;
              dispatch(toggleFavorite({
                postId: postMetadata.storyData.id,
                title: postMetadata.storyData.title,
                author: postMetadata.storyData.author,
                points: postMetadata.storyData.points,
                url: postMetadata.storyData.url,
                domain: urlDomain,
                createdAt: new Date(postMetadata.storyData.created_at).getTime(),
              }));

              // Show toast notification
              toast.show({
                placement: "top",
                render: ({ id }) => {
                  const toastId = "toast-" + id;
                  return (
                    <Toast nativeID={toastId}>
                      <VStack>
                        <ToastTitle>
                          {wasFavorited ? "💔 Removed from Favorites" : "❤️ Added to Favorites"}
                        </ToastTitle>
                        <ToastDescription>
                          {wasFavorited
                            ? "Article removed from your favorites"
                            : "Article saved to your favorites"
                          }
                        </ToastDescription>
                      </VStack>
                    </Toast>
                  );
                },
              });
            }
          }}
        >
          <Button
            style={{ backgroundColor: "transparent" }}
            icon={
              <View
                style={{
                  backgroundColor: isPostFavorited ? '#ff3b30' : 'transparent',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isPostFavorited ? 0 : 1.5,
                  borderColor: isPostFavorited ? 'transparent' : '#d1d5db',
                  shadowColor: isPostFavorited ? '#ff3b30' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isPostFavorited ? 0.4 : 0,
                  shadowRadius: 3,
                  elevation: isPostFavorited ? 2 : 0,
                }}
              >
                <Feather
                  name="heart"
                  color={isPostFavorited ? 'white' : '#6b7280'}
                  size={16}
                  style={{
                    fontWeight: isPostFavorited ? 'bold' : 'normal',
                  }}
                />
              </View>
            }
          ></Button>
        </TouchableOpacity>

        {/* Share button */}
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
                  <CommentDialog
                    originalItemContent={postMetadata?.storyData?.title ?? ""}
                    originalItemId={postMetadata?.storyData?.id ?? 0}
                    originalAuthor={postMetadata?.storyData?.author ?? ""}
                  />
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
                                  >
                                    <VStack>
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

              {/* AI Summary Button */}
              <AISummaryButton
                postId={postMetadata?.storyData?.id ?? 0}
                postTitle={postMetadata?.storyData?.title}
                postUrl={postMetadata?.storyData?.url}
                postAuthor={postMetadata?.storyData?.author}
                postPoints={postMetadata?.storyData?.points}
                postText={postMetadata?.storyData?.text}
                comments={postMetadata?.storyData?.children}
              />

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
