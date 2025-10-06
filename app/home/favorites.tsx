import { Feather } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Text, View } from "tamagui";
import RenderLinkIcon from "../../components/RenderLinkIcon";
import { getAllFavorites, removeFromFavorites } from "../../Redux/favoritesReducer";
import { setCurrentlyViewingPost, setStoryResponseRaw } from "../../Redux/postStateReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import domainToEmoji from "../../utils/domainToEmoji";
import getRelativeOrAbsoluteTime from "../../utils/getRelativeOrAbsoluteTime";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import { mainGrey, mainPurple, mainStyles } from "../../utils/main.styles";
import nFormatter from "../../utils/nFormatter";

const FavoritesScreen: React.FC = () => {
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);

    // Get favorites from Redux
    const favorites = useSelector((state: ReduxStoreInterface) => getAllFavorites(state));
    const postDataMapping = useSelector((state: ReduxStoreInterface) => state.postState.postDataMapping);

    // Sort favorites by most recently favorited
    const sortedFavorites = useMemo(() => {
        return [...favorites].sort((a, b) => b.favoritedAt - a.favoritedAt);
    }, [favorites]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const handlePostPress = useCallback(async (postId: number) => {
        try {
            // Fetch the full post data if not already cached
            if (!postDataMapping[postId]) {
                const allData = await HackerNewsClient.getAllDataWithFallback(postId);
                dispatch(
                    setStoryResponseRaw({
                        storyData: allData,
                        postId,
                    })
                );
            }

            dispatch(setCurrentlyViewingPost({ newState: postId }));
            router.push("/post");
        } catch (error) {
            console.error("Failed to load post:", error);
        }
    }, [dispatch, postDataMapping]);

    const handleRemoveFavorite = useCallback((postId: number) => {
        dispatch(removeFromFavorites({ postId }));
    }, [dispatch]);

    const renderFavoriteItem = useCallback(({ item }: { item: any }) => {
        const urlDomain = new URL(item.url ?? `https://${item.author}.com`).hostname;
        const emoji = domainToEmoji(urlDomain);

        return (
            <View
                marginVertical={5}
                marginHorizontal={10}
                style={{
                    ...mainStyles.mainShadow,
                    backgroundColor: "white",
                    padding: 10,
                    borderRadius: 10,
                }}
            >
                <TouchableOpacity
                    onPress={() => handlePostPress(item.postId)}
                >
                    <View flexDirection="row" marginBottom={2}>
                        <Text fontSize={"$3"} color={mainPurple}>
                            {urlDomain}
                        </Text>
                        <Text fontSize={"$3"}>
                            {" "}
                            - {getRelativeOrAbsoluteTime(dayjs(item.createdAt))}
                        </Text>
                    </View>

                    <View flexDirection="row">
                        <View width={"75%"}>
                            <View marginTop={5}>
                                <Text fontSize={"$5"} marginRight={3}>
                                    {emoji}
                                    {item.title}
                                </Text>

                                <View paddingTop={8} flexDirection="row">
                                    <Text fontSize={"$3"}>
                                        by {item.author?.replace(" ", "")}
                                    </Text>
                                </View>

                                <View paddingTop={5} flexDirection="row">
                                    <Text color={mainGrey} fontSize={"$3"}>
                                        {nFormatter(item.points)} points
                                    </Text>
                                    <Text color={mainGrey} fontSize={"$3"} paddingLeft={5}>
                                        •{" "}
                                    </Text>
                                    <Text color={mainGrey} fontSize={"$3"}>
                                        Favorited {getRelativeOrAbsoluteTime(dayjs(item.favoritedAt))}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            width={"25%"}
                            height={"100%"}
                            borderRadius={10}
                            overflow="hidden"
                            style={{
                                ...mainStyles.mainShadow,
                            }}
                        >
                            <RenderLinkIcon
                                urlDomain={urlDomain}
                                imageURL={undefined}
                                setImageURL={() => { }}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }, [handlePostPress, handleRemoveFavorite]);

    const renderEmptyState = useCallback(() => (
        <View
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={40}
            paddingTop={60}
        >
            <Feather
                name="heart"
                color={mainGrey}
                size={64}
                style={{ marginBottom: 16 }}
            />
            <Text
                fontSize={"$6"}
                fontWeight="600"
                color={mainGrey}
                textAlign="center"
                marginBottom={8}
            >
                No Favorites Yet
            </Text>
            <Text
                fontSize={"$4"}
                color={mainGrey}
                textAlign="center"
                lineHeight={24}
            >
                Start favoriting articles by tapping the heart icon on any post
            </Text>
        </View>
    ), []);

    if (sortedFavorites.length === 0) {
        return renderEmptyState();
    }

    return (
        <View flex={1} backgroundColor="#f8f9fa">
            <FlatList
                data={sortedFavorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.postId.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={mainPurple}
                    />
                }
                contentContainerStyle={{
                    paddingTop: 60,
                    paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default FavoritesScreen;
