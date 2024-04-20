import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "tamagui";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import {
  AlgoliaCommentRaw,
  GetCommentResponseRaw,
} from "../utils/HackerNewsClient/HackerNewsClient.types";
import { ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { mainGrey, mainPurple, mainStyles } from "../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ReduxStoreInterface } from "../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { setCurrentlyViewingUser } from "../Redux/userStateReducer";
import { router } from "expo-router";
import BlinkInWrapper from "./BlinkInWrapper";
import getRelativeOrAbsoluteTime from "../utils/getRelativeOrAbsoluteTime";
import {
  useToast,
  VStack,
  ToastTitle,
  ToastDescription,
  Toast,
} from "@gluestack-ui/themed";
import {
  increaseUpvoteNumber,
  decreaseUpvoteNumber,
} from "../Redux/postStateReducer";
import CommentDialog from "./PostComponents/CommentDialog";

export const webViewScript = `
(function() {
window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
})()
`;

const RecursiveComment: React.FC<{
  commentData: AlgoliaCommentRaw;
  postOP: string;
  postId: number;
  depth?: number;
  parsedElement?: Awaited<ReturnType<typeof HackerNewsClient.getParsedHTML>>;
  setRefresh: (value: boolean) => void;
}> = ({
  commentData,
  postId,
  depth = 0,
  postOP,
  parsedElement,
  setRefresh,
}) => {
  const webViewRef = useRef(null);
  const toast = useToast();

  const [webviewHeight, setWebviewHeight] = useState<number | undefined>(
    undefined
  );
  const [showChildren, setShowChildren] = useState(true);
  const [showBody, setShowBody] = useState(true);
  const dispatch = useDispatch();
  const [upvoteURL, setUpvoteURL] = useState<string | undefined>(undefined);
  const [downvoteURL, setDownvoteURL] = useState<string | undefined>(undefined);
  const isUserLoggedIn = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userLoggedIn
  );
  const userName = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userName
  );

  const commentTime = dayjs(commentData?.created_at);
  const commentText = commentData?.text ?? "";

  let commentTimeText = getRelativeOrAbsoluteTime(commentTime);

  /**
   * Check if we have an in-memory comments as well
   */
  const inMemoryUserComments = useSelector(
    (state: ReduxStoreInterface) => state.authUser.inMemoryUserComments
  );
  const relevantComments = inMemoryUserComments[commentData.id] ?? [];
  const newComments = relevantComments.filter((a) => {
    const existingComment = commentData.children.find(
      (othercomment) =>
        othercomment.text === a.text && othercomment.author === a.author
    );
    if (existingComment) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!parsedElement) return;

    Promise.resolve().then(async () => {
      await Promise.all([
        HackerNewsClient.getUpvoteUrl(
          `${commentData.id ?? 0}`,
          parsedElement
        ).then((u) => {
          setUpvoteURL(u);
        }),
        HackerNewsClient.getDownvoteUrl(
          `${commentData.id ?? 0}`,
          parsedElement
        ).then((d) => {
          setDownvoteURL(d);
        }),
      ]);
    });
  }, [parsedElement]);

  const toggleShowChildren = () => {
    setShowChildren(!showBody);
    setShowBody(!showBody);
  };

  return (
    <View marginHorizontal={10} marginVertical={5}>
      {commentData === undefined ? (
        <View marginVertical={20} justifyContent="center" alignItems="center">
          <ActivityIndicator />
        </View>
      ) : (
        <BlinkInWrapper>
          <View
            borderLeftWidth={depth === 0 ? 0 : 5}
            borderLeftColor={"#fb651f"}
            backgroundColor={"white"}
            style={{
              ...mainStyles.mainShadow,
              borderRadius: 10,
            }}
          >
            <View position="absolute" right={5} top={0} zIndex={99}>
              <CommentDialog
                originalItemId={commentData.id ?? 0}
                originalItemContent={commentText}
                originalAuthor={commentData.author ?? ""}
              />
            </View>

            <View marginLeft={5}>
              <TouchableOpacity
                onPress={() => {
                  toggleShowChildren();
                }}
              >
                <View alignItems="flex-start">
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(
                        setCurrentlyViewingUser({
                          newState: commentData.author ?? "",
                        })
                      );
                      router.push("/user");
                    }}
                  >
                    <View flexDirection="row">
                      <Text
                        color={
                          postOP === commentData.author
                            ? "orange"
                            : userName === commentData.author
                            ? mainPurple
                            : mainGrey
                        }
                      >
                        {commentData.author}
                        {postOP === commentData.author ? " [OP]" : ""}
                        {commentData.author === userName ? " [ME]" : ""}
                      </Text>
                      <Text color={mainGrey}> • </Text>
                      <Text color={mainGrey}>{commentTimeText}</Text>
                      <Text color={mainGrey}> • </Text>
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
                              setRefresh(true);
                            }
                          } else if (downvoteURL) {
                            const response =
                              await HackerNewsClient.makeAuthRequest(
                                downvoteURL
                              );
                            if (response === true) {
                              setRefresh(true);
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
                  </TouchableOpacity>
                </View>

                <View
                  width={"100%"}
                  justifyContent="center"
                  alignContent="center"
                  alignItems="center"
                  marginVertical={3}
                >
                  <View
                    backgroundColor={"black"}
                    width={"98%"}
                    height={1}
                    opacity={0.2}
                  />
                </View>
              </TouchableOpacity>

              {showBody === true ? (
                <View>
                  <WebView
                    injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight);$(document).ready(function(){
                  $(this).scrollTop(0);
              });"
                    source={{
                      html: `<html>
              <head><meta name="viewport" content="width=device-width"></head>
              <body>${commentText}</body>
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

              {showChildren === true ? (
                <View>
                  {/* Now for each kid we need to recursivly call and offsett */}
                  {[...(commentData.children ?? []), ...newComments].map(
                    (d) => {
                      return (
                        <View key={d.id}>
                          <RecursiveComment
                            commentData={d}
                            postId={postId}
                            depth={depth + 1}
                            postOP={postOP}
                            setRefresh={setRefresh}
                            parsedElement={parsedElement}
                          />
                        </View>
                      );
                    }
                  )}
                </View>
              ) : (
                // If we have something to show, let the user know that
                <View>
                  {[...(commentData.children ?? []), ...newComments].length >
                    0 && showChildren === false ? (
                    <View justifyContent="center" alignItems="center">
                      <TouchableOpacity
                        onPress={() => {
                          setShowChildren(!showChildren);
                          setShowBody(!showChildren);
                        }}
                      >
                        <View
                          backgroundColor={"white"}
                          marginVertical={5}
                          padding={3}
                          borderRadius={20}
                          style={{
                            ...mainStyles.mainShadow,
                          }}
                        >
                          <Feather
                            name="chevron-down"
                            size={24}
                            color={"black"}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
              )}
            </View>
          </View>
        </BlinkInWrapper>
      )}
    </View>
  );
};

export default RecursiveComment;
