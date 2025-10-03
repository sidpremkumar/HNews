import dayjs from "dayjs";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { Text, View } from "tamagui";
import {
  setCurrentlyViewingPost,
  setStoryResponseRaw,
} from "../../Redux/postStateReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import { setCurrentlyViewingUser } from "../../Redux/userStateReducer";
import domainToEmoji from "../../utils/domainToEmoji";
import { getOpenGraphImageURL } from "../../utils/getOpenGraphImageURL";
import getRelativeOrAbsoluteTime from "../../utils/getRelativeOrAbsoluteTime";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import {
  AlgoliaCommentRaw,
  AlgoliaGetPostRaw
} from "../../utils/HackerNewsClient/HackerNewsClient.types";
import {
  mainGrey,
  mainPurple,
  mainStyles
} from "../../utils/main.styles";
import nFormatter from "../../utils/nFormatter";
import BlinkInWrapper from "../BlinkInWrapper";
import RenderLinkIcon from "../RenderLinkIcon";

const HNArticleRoot: React.FC<{
  postId: number;
  postNumber: number;
}> = memo(({ postId, postNumber }) => {
  const dispatch = useDispatch();
  const postDataMapping = useSelector(
    (state: ReduxStoreInterface) => state.postState.postDataMapping
  );
  const postData = postDataMapping[postId];
  const [hasTriedFetch, setHasTriedFetch] = useState(false);

  useEffect(() => {
    // Only try to fetch if we haven't tried before and data doesn't exist
    if (postDataMapping[postId] === undefined && !hasTriedFetch) {
      setHasTriedFetch(true);

      Promise.resolve().then(async () => {
        try {
          /**
           * Get all our data from algolia
           */
          const allData = await HackerNewsClient.getAllData(postId);
          dispatch(
            setStoryResponseRaw({
              storyData: allData,
              postId,
            })
          );
        } catch (error) {
          console.error(`Failed to fetch data for post ${postId}:`, error);
          // Mark as failed so we don't keep retrying
          dispatch(
            setStoryResponseRaw({
              storyData: undefined, // Mark as failed
              postId,
            })
          );
        }
      });
    }
  }, [postId, postDataMapping, dispatch, hasTriedFetch]); // Add hasTriedFetch dependency

  if (!postData) {
    return (
      <View height={100} width={"100%"} justifyContent="center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!postData?.storyData) {
    // Show a placeholder for failed posts
    return (
      <View height={100} width={"100%"} justifyContent="center" padding={10}>
        <Text color={mainGrey} fontSize={"$3"}>
          Failed to load post {postId}
        </Text>
      </View>
    );
  }

  return <HNArticle storyData={postData.storyData} postNumber={postNumber} />;
});

const HNArticle: React.FC<{
  storyData: AlgoliaGetPostRaw;
  postNumber: number;
}> = memo(({ storyData, postNumber }) => {
  const urlDomain = new URL(storyData.url ?? `https://${storyData.author}.com`)
    .hostname;
  const dispatch = useDispatch();
  const emoji = `${domainToEmoji(urlDomain)}`;
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);

  const extractChildren = useCallback((
    children: AlgoliaGetPostRaw["children"]
  ): AlgoliaCommentRaw[] => {
    if (!children) {
      return [];
    }
    const allChildren = children.map((c) => {
      return [c, ...extractChildren(c.children)];
    });
    return allChildren.flat();
  }, []);

  const allComments = useMemo(() => extractChildren(storyData.children), [storyData.children, extractChildren]);

  const handlePostPress = useCallback(() => {
    dispatch(setCurrentlyViewingPost({ newState: storyData.id }));
    router.push("/post");
  }, [dispatch, storyData.id]);

  const handleUserPress = useCallback(() => {
    dispatch(
      setCurrentlyViewingUser({
        newState: storyData.author,
      })
    );
    router.push("/user");
  }, [dispatch, storyData.author]);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const openGraphImage = await getOpenGraphImageURL(storyData.url);
      if (openGraphImage) {
        setImageURL(openGraphImage);
      }
    });
  }, [storyData.url]);

  return (
    <BlinkInWrapper>
      <View
        marginVertical={5}
        style={{
          ...mainStyles.mainShadow,
          backgroundColor: "white",
          padding: 10,
          borderRadius: 10,
        }}
      >
        <TouchableOpacity
          onPress={handlePostPress}
        >
          <View flexDirection="row" marginBottom={2}>
            <Text fontSize={"$3"} color={mainPurple}>
              {urlDomain}
            </Text>
            <Text fontSize={"$3"}>
              {" "}
              - {getRelativeOrAbsoluteTime(dayjs(storyData.created_at))}
            </Text>
          </View>

          <View flexDirection="row">
            <View width={"75%"}>
              <View marginTop={5}>
                <Text fontSize={"$5"} marginRight={3}>
                  {emoji}
                  {storyData.title}
                </Text>

                <View paddingTop={8} flexDirection="row">
                  <TouchableOpacity
                    onPress={handleUserPress}
                  >
                    <Text fontSize={"$3"}>
                      by {storyData.author?.replace(" ", "")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View paddingTop={5} flexDirection="row">
                  <Text color={mainGrey} fontSize={"$3"}>
                    {nFormatter(storyData.points)} points
                  </Text>
                  <Text color={mainGrey} fontSize={"$3"} paddingLeft={5}>
                    •{" "}
                  </Text>
                  <Text color={mainGrey} fontSize={"$3"}>
                    {nFormatter((allComments ?? []).length)} comments
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
                imageURL={imageURL}
                setImageURL={setImageURL}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </BlinkInWrapper>
  );
});

export default HNArticleRoot;
