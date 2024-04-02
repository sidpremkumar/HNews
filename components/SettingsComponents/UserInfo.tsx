import { useDispatch, useSelector } from "react-redux";
import { ReduxStoreInterface } from "../../Redux/store";
import { View, Text } from "tamagui";
import { useEffect, useRef, useState } from "react";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { setUserInfo } from "../../Redux/authUserReducer";
import { ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import * as WebBrowser from "expo-web-browser";
import WebView from "react-native-webview";
import { webViewScript } from "../RecursiveComment";

const UserInfo: React.FC<{}> = () => {
  const isUserLoggedIn = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userLoggedIn
  );
  const userName = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userName
  );
  const userInfo = useSelector(
    (state: ReduxStoreInterface) => state.authUser.userInfo
  );
  const [webviewHeight, setWebviewHeight] = useState<number | undefined>(
    undefined
  );
  const webViewRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!userName) return;
      const userInfoPulled = await HackerNewsClient.getUserInfo(userName);
      dispatch(setUserInfo({ newState: userInfoPulled }));
    });
  }, [userName]);

  return (
    <View paddingVertical={20}>
      {isUserLoggedIn === false ? (
        <View justifyContent="center" alignItems="center">
          <Text fontSize={"$8"}>🔐 Login to see user info</Text>
        </View>
      ) : (
        <View justifyContent="center" alignItems="center">
          <Text fontSize={"$8"}>{userName}</Text>

          <View
            height={2}
            width={"98%"}
            backgroundColor="black"
            opacity={0.25}
            marginVertical={10}
          />

          {userInfo === undefined ? (
            <View>
              <ActivityIndicator />
            </View>
          ) : (
            <View width={"100%"}>
              <Text textAlign="center" fontSize={"$5"}>
                🎂 {dayjs(userInfo.created * 1000).format("MMMM DD, YYYY")} (
                {/* @ts-ignore */}
                {dayjs(userInfo.created * 1000).from(dayjs())})
              </Text>

              <Text textAlign="center" fontSize={"$5"}>
                ⚡️ Karma: {userInfo.karma}
              </Text>

              <View
                flexDirection="row"
                marginHorizontal={10}
                justifyContent="center"
                alignContent="center"
              >
                <View
                  overflow="hidden"
                  borderRadius={10}
                  width={"80%"}
                  minHeight={!userInfo.about ? 0 : 100}
                  height={webviewHeight}
                  marginVertical={5}
                >
                  {userInfo.about ? (
                    <WebView
                      injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight);$(document).ready(function(){
                    $(this).scrollTop(0);
                });"
                      source={{
                        html: `<html>
                <head><meta name="viewport" content="width=device-width"></head>
                <body>${userInfo.about}</body>
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
                  ) : (
                    <View
                      justifyContent="center"
                      alignItems="center"
                      marginVertical={10}
                    >
                      <Text>No About</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
export default UserInfo;
