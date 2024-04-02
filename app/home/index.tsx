import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
} from "react-native";
import { View, Text, Image } from "tamagui"; // or '@tamagui/core'
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import HNArticle from "../../components/HomeComponents/HNArticle";
import { ReduxStoreInterface } from "../../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilterSelected,
  setHomeScreenRefreshing,
  setTopStories,
} from "../../Redux/homeScreenReducer";
import { ScrollView } from "react-native-gesture-handler";
import FilterPill from "../../components/HomeComponents/FilterPills";

export default function App() {
  const dispatch = useDispatch();
  const windowHeight = Dimensions.get("window").height;

  const topStories = useSelector(
    (state: ReduxStoreInterface) => state.homeScreen.topStories
  );
  const homeScreenRefreshing = useSelector(
    (state: ReduxStoreInterface) => state.homeScreen.homeScreenRefreshing
  );
  const filterSelected = useSelector(
    (state: ReduxStoreInterface) => state.homeScreen.filterSelected
  );

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (filterSelected === undefined) {
        dispatch(setFilterSelected({ newState: { title: "Welcome" } }));
      }

      dispatch(setTopStories({ newState: undefined }));

      /**
       * See what kind of filter we have
       */
      switch (filterSelected?.title ?? "Welcome") {
        case "New": {
          const topStoriesPulled = await HackerNewsClient.getNewStories();
          dispatch(setTopStories({ newState: topStoriesPulled }));
          break;
        }
        case "Best": {
          const topStoriesPulled = await HackerNewsClient.getBestStories();
          dispatch(setTopStories({ newState: topStoriesPulled }));
          break;
        }
        case "Ask HN": {
          const topStoriesPulled = await HackerNewsClient.getAskHNStories();
          dispatch(setTopStories({ newState: topStoriesPulled }));
          break;
        }
        case "Show HN": {
          const topStoriesPulled = await HackerNewsClient.getShowHNStories();
          dispatch(setTopStories({ newState: topStoriesPulled }));
          break;
        }
        case "Welcome":
        default: {
          const topStoriesPulled = await HackerNewsClient.getTopStories();
          dispatch(setTopStories({ newState: topStoriesPulled }));
          break;
        }
      }

      dispatch(setHomeScreenRefreshing({ newState: false }));
    });
  }, [homeScreenRefreshing, filterSelected]);

  const today = dayjs();
  return (
    <View paddingTop={60}>
      <FlatList
        refreshControl={
          <RefreshControl
            colors={["black"]}
            tintColor={"black"}
            progressBackgroundColor={"black"}
            refreshing={homeScreenRefreshing}
            onRefresh={() => {
              dispatch(setHomeScreenRefreshing({ newState: true }));
            }}
            progressViewOffset={25}
          />
        }
        style={{
          overflow: "visible",
        }}
        ListHeaderComponent={
          <View marginLeft={10} marginBottom={0}>
            <Text fontSize={"$5"}>{today.format("dddd DD MMMM, YYYY")}</Text>
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

            <View>
              <ScrollView
                horizontal
                style={{
                  overflow: "visible",
                  marginVertical: 10,
                }}
              >
                {[
                  { title: "Welcome" },
                  { title: "New" },
                  { title: "Best" },
                  { title: "Ask HN" },
                  { title: "Show HN" },
                ].map((data, index) => {
                  return <FilterPill data={data} />;
                })}
              </ScrollView>
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
