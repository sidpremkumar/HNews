import { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Button } from "tamagui";
import { ReduxStoreInterface } from "../../Redux/store";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { setUserData } from "../../Redux/userStateReducer";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { mainStyles, spotifyBlack } from "../../utils/main.styles";
import dayjs from "dayjs";
import WebView from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { webViewScript } from "../../components/RecursiveComment";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const UserView: React.FC<{ userId: string }> = ({ userId }) => {
  const windowHeight = Dimensions.get("window").height;
  const userData = useSelector(
    (state: ReduxStoreInterface) => state.userState.userData
  );
  const [webviewHeight, setWebviewHeight] = useState<number | undefined>(
    undefined
  );
  const webViewRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    Promise.resolve().then(async () => {
      if (!userData || userData.id !== userId) {
        const userDataPulled = await HackerNewsClient.getUserInfo(userId);
        dispatch(setUserData({ newState: userDataPulled }));
      }
    });
  }, [userData]);

  return (
    <View>
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
          <View
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            marginLeft={10}
          >
            <Feather name="chevron-left" color={"black"} size={24} />
            <Text>Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{
          height: "100%",
        }}
      >
        {userData === undefined ? (
          <View
            height={windowHeight}
            justifyContent="center"
            alignContent="center"
            alignItems="center"
          >
            <ActivityIndicator size="large" color={spotifyBlack} />
          </View>
        ) : (
          <View
            justifyContent="center"
            alignContent="center"
            /**
             * Slightly higher bc im a freak
             */
            height={windowHeight * 0.8}
          >
            <Text textAlign="center" fontSize={"$10"}>
              {userData.id}
            </Text>
            <View
              width={"100%"}
              justifyContent="center"
              alignContent="center"
              alignItems="center"
              marginBottom={20}
            >
              <View
                backgroundColor={"black"}
                height={2}
                opacity={0.5}
                width={"60%"}
              />
            </View>

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
                minHeight={100}
                height={webviewHeight}
              >
                <WebView
                  injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight);$(document).ready(function(){
                  $(this).scrollTop(0);
              });"
                  source={{
                    html: `<html>
              <head><meta name="viewport" content="width=device-width"></head>
              <body>${userData.about}</body>
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
              </View>
            </View>

            <View height={20} />

            <Text textAlign="center" fontSize={"$7"}>
              🎂 {dayjs(userData.created * 1000).format("MMMM DD, YYYY")} (
              {dayjs(userData.created * 1000).from(dayjs())})
            </Text>

            <View
              width={"100%"}
              justifyContent="center"
              alignContent="center"
              alignItems="center"
              marginVertical={10}
            >
              <View
                backgroundColor={"black"}
                height={2}
                opacity={0.5}
                width={"60%"}
              />
            </View>

            <Text textAlign="center" fontSize={"$7"}>
              ⚡️ Karma: {userData.karma}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
export default UserView;
