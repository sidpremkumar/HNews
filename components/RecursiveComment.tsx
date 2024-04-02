import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "tamagui";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import { GetCommentResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";
import { ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { mainGrey, mainStyles } from "../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ReduxStoreInterface } from "../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { setCurrentlyViewingUser } from "../Redux/userStateReducer";
import { router } from "expo-router";
import BlinkInWrapper from "./BlinkInWrapper";
import getRelativeOrAbsoluteTime from "../utils/getRelativeOrAbsoluteTime";
import { addToCommentData } from "../Redux/postStateReducer";

export const webViewScript = `
(function() {
window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
})()
`;

const RecursiveComment: React.FC<{
  commentId: number;
  postId: number;
  depth?: number;
}> = ({ commentId, postId, depth = 0 }) => {
  const commentData = useSelector((state: ReduxStoreInterface) =>
    state.postState.postDataMapping[postId].commentData?.find(
      (c) => c.id === commentId
    )
  );
  const webViewRef = useRef(null);
  const postDataMapping = useSelector(
    (state: ReduxStoreInterface) => state.postState.postDataMapping
  );
  const currentlyViewingPost = useSelector(
    (state: ReduxStoreInterface) => state.postState.currentlyViewingPost
  );

  const [webviewHeight, setWebviewHeight] = useState<number | undefined>(
    undefined
  );
  const [showChildren, setShowChildren] = useState(false);
  const [showBody, setShowBody] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (commentData === undefined) {
        /**
         * We need to query for this comment
         */
        const commentDataPulled = await HackerNewsClient.getCommentDetails(
          commentId
        );
        dispatch(
          addToCommentData({ postId: postId, commentData: commentDataPulled })
        );
      }
    });
  }, []);

  const commentTime = dayjs((commentData?.time ?? 0) * 1000);
  const commentText = commentData?.text ?? "";

  let commentTimeText = getRelativeOrAbsoluteTime(commentTime);

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
                          newState: commentData.by ?? "",
                        })
                      );
                      router.push("/user");
                    }}
                  >
                    <View flexDirection="row">
                      <Text color={mainGrey}>{commentData.by}</Text>
                      <Text color={mainGrey}> • </Text>
                      <Text color={mainGrey}>{commentTimeText}</Text>
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
                  {(commentData.kids ?? []).map((d) => {
                    return (
                      <View key={d}>
                        <RecursiveComment
                          commentId={d}
                          postId={postId}
                          depth={depth + 1}
                        />
                      </View>
                    );
                  })}
                </View>
              ) : (
                // If we have something to show, let the user know that
                <View>
                  {(commentData.kids ?? []).length > 0 &&
                  showChildren === false ? (
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
