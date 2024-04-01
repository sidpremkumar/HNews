import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "tamagui";
import HackerNewsClient from "../utils/HackerNewsClient/HackerNewsClient";
import { GetCommentResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";
import { ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";

const RecursiveComment: React.FC<{ commentId: number; depth?: number }> = ({
  commentId,
  depth = 0,
}) => {
  const webViewRef = useRef(null);
  const [commentData, setCommentData] = useState<
    GetCommentResponseRaw | undefined
  >(undefined);
  const [webviewHeight, setWebviewHeight] = useState<number | undefined>(
    undefined
  );
  useEffect(() => {
    Promise.resolve().then(async () => {
      const data = await HackerNewsClient.getCommentDetails(commentId);
      setCommentData(data);
    });
  }, []);

  const commentTime = dayjs((commentData?.time ?? 0) * 1000);
  const commentText = commentData?.text ?? "";
  const webViewScript = `
  (function() {
  window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight);
  })()
  `;
  return (
    <View>
      {commentData === undefined ? (
        <View>
          <ActivityIndicator />
        </View>
      ) : (
        <View borderLeftWidth={depth === 0 ? 0 : 5} borderLeftColor={"#fb651f"}>
          <View marginLeft={depth === 0 ? 0 : 5}>
            <Text>
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

            <WebView
              injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight)"
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

            {/* Now for each kid we need to recursivly call and offsett */}
            {(commentData.kids ?? []).map((d) => {
              return (
                <View key={d} marginLeft={(depth + 1) * 10}>
                  <RecursiveComment commentId={d} depth={depth + 1} />
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default RecursiveComment;
