import { ActivityIndicator, Dimensions, FlatList } from "react-native";
import { View, Text, Image } from "tamagui"; // or '@tamagui/core'
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import HNArticle from "../../components/HomeComponents/HNArticle";
import { ReduxStoreInterface } from "../../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTopStories } from "../../Redux/homeScreenReducer";

export default function App() {
  const dispatch = useDispatch();
  const windowHeight = Dimensions.get("window").height;

  const topStories = useSelector(
    (state: ReduxStoreInterface) => state.homeScreen.topStories
  );

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (topStories === undefined) {
        const topStoriesPulled = await HackerNewsClient.getTopStories();
        dispatch(setTopStories({ newState: topStoriesPulled }));
      }
    });
  }, []);

  const today = dayjs();
  return (
    <View paddingTop={60}>
      <FlatList
        style={{
          overflow: "visible",
        }}
        ListHeaderComponent={
          <View marginLeft={10} marginBottom={10}>
            <Text fontSize={"$5"}>{today.format("ddd DD, YYYY")}</Text>
            <View flexDirection="row" marginTop={5}>
              <Image
                src={require("../../assets/images/ycLogo.png")}
                height={30}
                width={30}
              />
              <View justifyContent="center" paddingLeft={5}>
                <Text fontSize={"$8"} fontWeight={"bold"}>
                  Hacker News
                </Text>
              </View>
            </View>
          </View>
        }
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        windowSize={1}
        data={topStories}
        renderItem={(data) => {
          return (
            <View key={`${data.item}`} marginHorizontal={5}>
              <HNArticle postId={data.item} postNumber={data.index} />
            </View>
          );
        }}
      />
      {(topStories ?? []).length === 0 ? (
        <View height={windowHeight / 1.5} justifyContent="center">
          <ActivityIndicator size={"small"} color={"black"} />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
}
