import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, RefreshControl, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { Image, Text } from "tamagui";
import FilterPill from "../../components/HomeComponents/FilterPills";
import HNArticle from "../../components/HomeComponents/HNArticle";
import { setFilterSelected, setHomeScreenRefreshing, setTopStories } from "../../Redux/homeScreenReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";

export default function App() {
    const flatListRef = useRef(null);
    const dispatch = useDispatch();

    // Get data from Redux
    const topStories = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.topStories
    );
    const homeScreenRefreshing = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.homeScreenRefreshing
    );
    const filterSelected = useSelector(
        (state: ReduxStoreInterface) => state.homeScreen.filterSelected
    );
    const postDataMapping = useSelector(
        (state: ReduxStoreInterface) => state.postState.postDataMapping
    );

    // State for infinite scroll
    const [allStories, setAllStories] = useState<number[]>([]);
    const [displayedCount, setDisplayedCount] = useState(50);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Animation for content transition
    const contentOpacity = useRef(new Animated.Value(1)).current;

    // Simple data computation - just show the stories we want to display
    const data = useMemo(() => {
        if (!allStories.length) return [];
        return allStories.slice(0, displayedCount);
    }, [allStories, displayedCount]);

    // Memoized values
    const today = useMemo(() => dayjs(), []);
    const filterPills = useMemo(() => [
        { title: "Welcome" },
        { title: "New" },
        { title: "Best" },
        { title: "Ask HN" },
        { title: "Show HN" },
    ], []);

    // Set default filter and fetch initial data
    useEffect(() => {
        // Set default filter to Welcome if none is selected
        if (!filterSelected) {
            dispatch(setFilterSelected({ newState: { title: "Welcome" } }));
        }
    }, [filterSelected, dispatch]);


    // Fetch data when filter changes or on initial load
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Start content transition animation
                Animated.sequence([
                    Animated.timing(contentOpacity, {
                        toValue: 0.3,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(contentOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                const currentFilter = filterSelected?.title || "Welcome";
                let stories;

                switch (currentFilter) {
                    case "New":
                        stories = await HackerNewsClient.getNewStories();
                        break;
                    case "Best":
                        stories = await HackerNewsClient.getBestStories();
                        break;
                    case "Ask HN":
                        stories = await HackerNewsClient.getAskHNStories();
                        break;
                    case "Show HN":
                        stories = await HackerNewsClient.getShowHNStories();
                        break;
                    default:
                        stories = await HackerNewsClient.getTopStories();
                }

                // Load all stories and filter out any that might cause issues
                const validStories = stories.filter(id => id && typeof id === 'number' && id > 0);
                console.log(`🚀 Fetched ${currentFilter} stories:`, validStories.length);
                console.log(`📋 First 5 story IDs:`, validStories.slice(0, 5));
                console.log(`🔍 Invalid IDs found:`, stories.filter(id => !id || typeof id !== 'number' || id <= 0).slice(0, 5));
                setAllStories(validStories);
                // Display all available stories (or first 50, whichever is smaller)
                const initialCount = Math.min(50, validStories.length);
                setDisplayedCount(initialCount);
                dispatch(setTopStories({ newState: validStories.slice(0, initialCount) }));
            } catch (error) {
                console.error("Failed to fetch stories:", error);
            }
        };

        if (filterSelected) {
            fetchData();
        }
    }, [filterSelected?.title, dispatch, contentOpacity]);

    // Safe refresh effect - only runs when refreshing is true
    useEffect(() => {
        if (homeScreenRefreshing) {
            const refreshData = async () => {
                try {
                    const currentFilter = filterSelected?.title || "Welcome";
                    let stories;

                    switch (currentFilter) {
                        case "New":
                            stories = await HackerNewsClient.getNewStories();
                            break;
                        case "Best":
                            stories = await HackerNewsClient.getBestStories();
                            break;
                        case "Ask HN":
                            stories = await HackerNewsClient.getAskHNStories();
                            break;
                        case "Show HN":
                            stories = await HackerNewsClient.getShowHNStories();
                            break;
                        default:
                            stories = await HackerNewsClient.getTopStories();
                    }

                    // Load all stories and filter out any that might cause issues
                    const validStories = stories.filter(id => id && typeof id === 'number' && id > 0);
                    console.log(`🔄 Refreshed ${currentFilter} stories:`, validStories.length);
                    console.log(`📋 First 5 story IDs:`, validStories.slice(0, 5));
                    setAllStories(validStories);
                    // Display all available stories (or first 50, whichever is smaller)
                    const initialCount = Math.min(50, validStories.length);
                    setDisplayedCount(initialCount);
                    dispatch(setTopStories({ newState: validStories.slice(0, initialCount) }));
                } catch (error) {
                    console.error("Failed to refresh stories:", error);
                } finally {
                    dispatch(setHomeScreenRefreshing({ newState: false }));
                }
            };
            refreshData();
        }
    }, [homeScreenRefreshing, filterSelected?.title, dispatch]);


    const renderItem = useCallback(({ item, index }: { item: number; index: number }) => {
        return (
            <View style={{ marginHorizontal: 5, marginVertical: 2 }}>
                <HNArticle postId={item} postNumber={index} />
            </View>
        );
    }, []);

    const handleRefresh = useCallback(() => {
        dispatch(setHomeScreenRefreshing({ newState: true }));
    }, [dispatch]);

    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || displayedCount >= allStories.length) return;

        setIsLoadingMore(true);
        const newCount = Math.min(displayedCount + 25, allStories.length);
        setDisplayedCount(newCount);
        setIsLoadingMore(false);
    }, [isLoadingMore, displayedCount, allStories.length]);

    const ListHeaderComponent = useMemo(() => (
        <View style={{
            marginLeft: 8,
            marginRight: 8,
            marginBottom: 2,
            paddingTop: 4,
        }}>
            {/* Compact Date */}
            <Text
                fontSize={"$3"}
                color={"#8e8e93"}
                fontWeight={"400"}
                letterSpacing={0.2}
                style={{ marginBottom: 6 }}
            >
                {today.format("dddd, MMMM DD")}
            </Text>

            {/* Consolidated Header with Logo and Filters */}
            <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 16,
                paddingVertical: 10,
                paddingHorizontal: 12,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)',
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: 44,
            }}>
                {/* YC Logo - Seamless Integration */}
                <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderWidth: 0.5,
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                }}>
                    <Image
                        src={require("../../assets/images/ycLogo.png")}
                        height={18}
                        width={18}
                        borderRadius={3}
                    />
                </View>

                {/* Filter Pills Container */}
                <View style={{
                    flex: 1,
                    overflow: 'hidden',
                }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            alignItems: 'center',
                            paddingRight: 8,
                        }}
                        style={{
                            flex: 1,
                        }}
                    >
                        {filterPills.map((data) => (
                            <FilterPill data={data} key={data.title} />
                        ))}
                    </ScrollView>
                </View>
            </View>
        </View>
    ), [today, filterPills]);

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#f2f2f7',
            paddingTop: 60
        }}>
            <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
                <FlatList
                    ref={flatListRef}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `post-${item}-${index}`}
                    style={{ flex: 1 }}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={100}
                    initialNumToRender={10}
                    windowSize={10}
                    refreshControl={
                        <RefreshControl
                            colors={["#8d75e8"]}
                            tintColor={"#8d75e8"}
                            progressBackgroundColor={"#ffffff"}
                            refreshing={homeScreenRefreshing}
                            onRefresh={handleRefresh}
                            progressViewOffset={25}
                        />
                    }
                    ListHeaderComponent={ListHeaderComponent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <View style={{
                                padding: 24,
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                marginHorizontal: 16,
                                marginVertical: 8,
                                borderRadius: 12,
                            }}>
                                <Text style={{
                                    color: '#8e8e93',
                                    fontSize: 15,
                                    fontWeight: '500'
                                }}>
                                    Loading more posts...
                                </Text>
                            </View>
                        ) : displayedCount >= allStories.length && allStories.length > 0 ? (
                            <View style={{
                                padding: 24,
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                marginHorizontal: 16,
                                marginVertical: 8,
                                borderRadius: 12,
                            }}>
                                <Text style={{
                                    color: '#8e8e93',
                                    fontSize: 15,
                                    fontWeight: '500',
                                    textAlign: 'center'
                                }}>
                                    That's all {allStories.length} posts for {filterSelected?.title || 'this filter'}
                                </Text>
                            </View>
                        ) : null
                    }
                />
            </Animated.View>
        </View>
    );
}