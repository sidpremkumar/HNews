import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { Image, Text, View } from "tamagui"; // or '@tamagui/core'
import FilterPill from "../../components/HomeComponents/FilterPills";
import HNArticle from "../../components/HomeComponents/HNArticle";
import {
    setFilterSelected,
    setHomeScreenRefreshing,
    setScrollToTopHomeScreen,
    setTopStories,
} from "../../Redux/homeScreenReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";

export default function App() {
    const dispatch = useDispatch();
    const windowHeight = Dimensions.get("window").height;
    const flatListRef = useRef(null);
    const renderCount = useRef(0);

    renderCount.current += 1;

    const topStories = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.topStories
    );
    const homeScreenRefreshing = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.homeScreenRefreshing
    );
    const scrollToTop = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.scrollToTopHomeScreen
    );
    const filterSelected = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.filterSelected
    );

    /* Initial load and filter change effect */
    useEffect(() => {
        console.log("🔄 Initial/Filter effect triggered", {
            filterSelected: filterSelected?.title,
            topStoriesLength: topStories?.length
        });

        if (filterSelected === undefined) {
            console.log("📝 Setting default filter to Welcome");
            dispatch(setFilterSelected({ newState: { title: "Welcome" } }));
            return;
        }

        const fetchStories = async () => {
            console.log("📡 Fetching stories for filter:", filterSelected?.title);
            dispatch(setTopStories({ newState: undefined }));

            try {
                /**
                 * See what kind of filter we have
                 */
                switch (filterSelected?.title ?? "Welcome") {
                    case "New": {
                        const topStoriesPulled = await HackerNewsClient.getNewStories();
                        console.log("✅ New stories fetched:", topStoriesPulled?.length);
                        dispatch(setTopStories({ newState: topStoriesPulled }));
                        break;
                    }
                    case "Best": {
                        const topStoriesPulled = await HackerNewsClient.getBestStories();
                        console.log("✅ Best stories fetched:", topStoriesPulled?.length);
                        dispatch(setTopStories({ newState: topStoriesPulled }));
                        break;
                    }
                    case "Ask HN": {
                        const topStoriesPulled = await HackerNewsClient.getAskHNStories();
                        console.log("✅ Ask HN stories fetched:", topStoriesPulled?.length);
                        dispatch(setTopStories({ newState: topStoriesPulled }));
                        break;
                    }
                    case "Show HN": {
                        const topStoriesPulled = await HackerNewsClient.getShowHNStories();
                        console.log("✅ Show HN stories fetched:", topStoriesPulled?.length);
                        dispatch(setTopStories({ newState: topStoriesPulled }));
                        break;
                    }
                    case "Welcome":
                    default: {
                        const topStoriesPulled = await HackerNewsClient.getTopStories();
                        console.log("✅ Top stories fetched:", topStoriesPulled?.length);
                        dispatch(setTopStories({ newState: topStoriesPulled }));
                        break;
                    }
                }
            } catch (error) {
                console.error("❌ Failed to fetch stories:", error);
                // Keep the loading state, don't set empty array
            }
        };

        fetchStories();
    }, [filterSelected?.title]); // Only depend on the title, not the whole object

    /* Handle refresh effect */
    useEffect(() => {
        console.log("🔄 Refresh effect triggered", {
            homeScreenRefreshing,
            filterSelected: filterSelected?.title
        });

        if (homeScreenRefreshing) {
            console.log("🔄 Starting refresh for filter:", filterSelected?.title);
            const refreshStories = async () => {
                try {
                    // Get the current filter from Redux state at the time of refresh
                    const currentFilter = filterSelected?.title ?? "Welcome";

                    /**
                     * See what kind of filter we have
                     */
                    switch (currentFilter) {
                        case "New": {
                            const topStoriesPulled = await HackerNewsClient.getNewStories();
                            console.log("🔄 Refreshed New stories:", topStoriesPulled?.length);
                            dispatch(setTopStories({ newState: topStoriesPulled }));
                            break;
                        }
                        case "Best": {
                            const topStoriesPulled = await HackerNewsClient.getBestStories();
                            console.log("🔄 Refreshed Best stories:", topStoriesPulled?.length);
                            dispatch(setTopStories({ newState: topStoriesPulled }));
                            break;
                        }
                        case "Ask HN": {
                            const topStoriesPulled = await HackerNewsClient.getAskHNStories();
                            console.log("🔄 Refreshed Ask HN stories:", topStoriesPulled?.length);
                            dispatch(setTopStories({ newState: topStoriesPulled }));
                            break;
                        }
                        case "Show HN": {
                            const topStoriesPulled = await HackerNewsClient.getShowHNStories();
                            console.log("🔄 Refreshed Show HN stories:", topStoriesPulled?.length);
                            dispatch(setTopStories({ newState: topStoriesPulled }));
                            break;
                        }
                        case "Welcome":
                        default: {
                            const topStoriesPulled = await HackerNewsClient.getTopStories();
                            console.log("🔄 Refreshed Top stories:", topStoriesPulled?.length);
                            dispatch(setTopStories({ newState: topStoriesPulled }));
                            break;
                        }
                    }
                } catch (error) {
                    console.error("❌ Failed to refresh stories:", error);
                } finally {
                    console.log("✅ Refresh completed, setting refreshing to false");
                    dispatch(setHomeScreenRefreshing({ newState: false }));
                }
            };

            refreshStories();
        }
    }, [homeScreenRefreshing]);

    useEffect(() => {
        console.log("🔄 Scroll to top effect triggered", {
            scrollToTop,
            hasFlatListRef: !!flatListRef.current
        });

        if (scrollToTop && flatListRef.current) {
            console.log("⬆️ Scrolling to top of FlatList");
            // @ts-ignore
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
            dispatch(setScrollToTopHomeScreen({ newState: false }));
        }
    }, [scrollToTop, flatListRef]);

    const today = dayjs();

    const filterPills = useMemo(() => [
        { title: "Welcome" },
        { title: "New" },
        { title: "Best" },
        { title: "Ask HN" },
        { title: "Show HN" },
    ], []);

    const flatListKey = `flatlist-${filterSelected?.title}-${topStories?.length}`;

    console.log("🎨 Component render #" + renderCount.current, {
        topStoriesLength: topStories?.length,
        homeScreenRefreshing,
        filterSelected: filterSelected?.title,
        scrollToTop,
        topStoriesFirstItem: topStories?.[0],
        topStoriesLastItem: topStories?.[topStories.length - 1],
        flatListKey
    });

    return (
        <View paddingTop={60}>
            <FlatList
                ref={flatListRef}
                // Temporarily disabled refresh control for debugging
                // refreshControl={
                //     <RefreshControl
                //         colors={["black"]}
                //         tintColor={"black"}
                //         progressBackgroundColor={"black"}
                //         refreshing={homeScreenRefreshing}
                //         onRefresh={() => {
                //             console.log("🔄 Pull to refresh triggered");
                //             dispatch(setHomeScreenRefreshing({ newState: true }));
                //         }}
                //         progressViewOffset={25}
                //     />
                // }
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
                                {filterPills.map((data, index) => {
                                    return <FilterPill data={data} key={data.title} />;
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
                onScrollBeginDrag={() => {
                    console.log("📱 Scroll started");
                }}
                onScrollEndDrag={() => {
                    console.log("📱 Scroll ended");
                }}
                onMomentumScrollEnd={() => {
                    console.log("📱 Momentum scroll ended");
                }}
                onLayout={() => {
                    console.log("📐 FlatList layout changed");
                }}
                onContentSizeChange={() => {
                    console.log("📏 FlatList content size changed");
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
