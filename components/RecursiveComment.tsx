import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "tamagui";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import { GetCommentResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";
import { ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { mainGrey } from "../utils/main.styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ReduxStoreInterface } from "../Redux/store";
import { useSelector } from "react-redux";

const RecursiveComment: React.FC<{
  data: GetCommentResponseRaw;
  depth?: number;
}> = ({ data, depth = 0 }) => {
  const commentData = data;
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
  const [showChildren, setShowChildren] = useState(true);

  const commentTime = dayjs((commentData?.time ?? 0) * 1000);
  const commentText = commentData?.text ?? "";
  const webViewScript = `
  (function() {
  window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
  })()
  `;
  return (
    <View marginHorizontal={10} marginVertical={10}>
      {commentData === undefined ? (
        <View marginVertical={20} justifyContent="center" alignItems="center">
          <ActivityIndicator />
        </View>
      ) : (
        <View borderLeftWidth={depth === 0 ? 0 : 5} borderLeftColor={"#fb651f"}>
          <View marginLeft={depth === 0 ? 0 : 5}>
            <TouchableOpacity onPress={() => setShowChildren(!showChildren)}>
              <Text color={mainGrey}>
                {commentData.by} on {commentTime.format("DD MMM, YYYY")}
              </Text>
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

            {showChildren === true ? (
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
                onShouldStartLoadWithRequest={(request: { url: string }) => {
                  if (request.url !== "about:blank") {
                    WebBrowser.openBrowserAsync(request.url);
                    return false;
                  } else return true;
                }}
              />
            ) : (
              <></>
            )}

            {showChildren === true ? (
              <View>
                {/* Now for each kid we need to recursivly call and offsett */}
                {(commentData.kids ?? []).map((d) => {
                  const commentDataForChild = postDataMapping[
                    currentlyViewingPost ?? -1
                  ].commentData.find((c) => c.id === d);
                  if (!commentDataForChild) {
                    return <></>;
                  }
                  return (
                    <View key={d}>
                      <RecursiveComment
                        data={commentDataForChild}
                        depth={depth + 1}
                      />
                    </View>
                  );
                })}
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default RecursiveComment;
