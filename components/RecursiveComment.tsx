import { Feather } from "@expo/vector-icons";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
  useToast,
} from "@gluestack-ui/themed";
import dayjs from "dayjs";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import WebView from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { Text, View } from "tamagui";
import { ReduxStoreInterface } from "../Redux/store";
import { setCurrentlyViewingUser } from "../Redux/userStateReducer";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import { AlgoliaCommentRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";
import getRelativeOrAbsoluteTime from "../utils/getRelativeOrAbsoluteTime";
import { mainPurple, mainStyles } from "../utils/main.styles";
import BlinkInWrapper from "./BlinkInWrapper";
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
    const [showChildren, setShowChildren] = useState(false);
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

    // Debug logging
    console.log(`🔍 RecursiveComment ${commentData.id}: Rendering CommentDialog`);


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
              marginLeft={depth > 0 ? 20 : 0}
              marginVertical={depth === 0 ? 8 : 4}
              backgroundColor={"white"}
              style={{
                ...mainStyles.mainShadow,
                borderRadius: depth === 0 ? 16 : 12,
                borderWidth: depth === 0 ? 0 : 1,
                borderColor: depth === 0 ? "transparent" : "#f0f0f0",
              }}
            >
              {/* Comment Header */}
              <View
                paddingHorizontal={16}
                paddingTop={12}
                paddingBottom={8}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <View flexDirection="row" alignItems="center" flex={1}>
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
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color={
                        postOP === commentData.author
                          ? "#ff6b35"
                          : userName === commentData.author
                            ? mainPurple
                            : "#1d1d1f"
                      }
                    >
                      {commentData.author}
                      {postOP === commentData.author ? " [OP]" : ""}
                      {commentData.author === userName ? " [ME]" : ""}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    fontSize="$2"
                    color="#86868b"
                    marginLeft={8}
                  >
                    {commentTimeText}
                  </Text>
                </View>

                <View flexDirection="row" alignItems="center">
                  {isUserLoggedIn && (upvoteURL || downvoteURL) && (
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
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: upvoteURL !== undefined ? "#007aff" : "#f5f5f7",
                        borderWidth: upvoteURL !== undefined ? 0 : 1,
                        borderColor: upvoteURL !== undefined ? "transparent" : "#d1d1d6",
                        minWidth: 36,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        fontSize="$2"
                        color={upvoteURL !== undefined ? "white" : "#007aff"}
                        fontWeight="600"
                      >
                        {upvoteURL !== undefined
                          ? "↑"
                          : downvoteURL !== undefined
                            ? "↓"
                            : ""}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View marginLeft={8}>
                    <CommentDialog
                      originalItemId={commentData.id ?? 0}
                      originalItemContent={commentText}
                      originalAuthor={commentData.author ?? ""}
                    />
                  </View>
                </View>
              </View>

              {/* Comment Content */}
              <TouchableOpacity
                onPress={() => {
                  toggleShowChildren();
                }}
                activeOpacity={0.7}
              >

                {showBody === true ? (
                  <View paddingHorizontal={16} paddingBottom={12}>
                    <WebView
                      injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight);$(document).ready(function(){
                  $(this).scrollTop(0);
              });"
                      source={{
                        html: `<html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 15px;
                    line-height: 1.5;
                    color: #1d1d1f;
                    margin: 0;
                    padding: 0;
                    background: transparent;
                  }
                  p { margin: 0 0 12px 0; }
                  a { color: #007aff; text-decoration: none; }
                  code { 
                    background: #f5f5f7; 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 13px;
                  }
                  pre { 
                    background: #f5f5f7; 
                    padding: 12px; 
                    border-radius: 8px; 
                    overflow-x: auto;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 13px;
                  }
                </style>
              </head>
              <body>${commentText}</body>
              </html>`,
                      }}
                      scrollEnabled={true}
                      ref={webViewRef}
                      onLoadEnd={() =>
                        // @ts-ignore
                        webViewRef.current?.injectJavaScript(webViewScript)
                      }
                      style={{
                        flex: 1,
                        height: webviewHeight,
                        backgroundColor: 'transparent'
                      }}
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
                      <View
                        justifyContent="center"
                        alignItems="center"
                        paddingVertical={12}
                        paddingHorizontal={16}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setShowChildren(!showChildren);
                            setShowBody(!showChildren);
                          }}
                          style={{
                            backgroundColor: "#f5f5f7",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 20,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            fontSize="$2"
                            color="#007aff"
                            fontWeight="500"
                            marginRight={4}
                          >
                            {[...(commentData.children ?? []), ...newComments].length} replies
                          </Text>
                          <Feather
                            name="chevron-down"
                            size={16}
                            color="#007aff"
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </BlinkInWrapper>
        )}
      </View>
    );
  };

export default RecursiveComment;
