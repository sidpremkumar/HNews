import { useEffect, useState } from "react";
import { View, Text, Image } from "tamagui";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import {
  AlgoliaCommentRaw,
  AlgoliaGetPostRaw,
  GetCommentResponseRaw,
  GetStoryResponseRaw,
} from "../../utils/HackerNewsClient/HackerNewsClient.types";
import { ActivityIndicator, Dimensions } from "react-native";
import {
  mainGrey,
  mainPurple,
  mainStyles,
  spotifyBlack,
} from "../../utils/main.styles";
import dayjs from "dayjs";
import nFormatter from "../../utils/nFormatter";
import domainToEmoji from "../../utils/domainToEmoji";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentlyViewingPost,
  setStoryResponseRaw,
} from "../../Redux/postStateReducer";
import { router } from "expo-router";
import { getOpenGraphImageURL } from "../../utils/getOpenGraphImageURL";
import { ReduxStoreInterface } from "../../Redux/store";
import { setCurrentlyViewingUser } from "../../Redux/userStateReducer";
import BlinkInWrapper from "../BlinkInWrapper";
import RenderLinkIcon from "../RenderLinkIcon";
import getRelativeOrAbsoluteTime from "../../utils/getRelativeOrAbsoluteTime";

const HNArticleRoot: React.FC<{
  postId: number;
  postNumber: number;
}> = ({ postId, postNumber }) => {
  const dispatch = useDispatch();
  const postDataMapping = useSelector(
    (state: ReduxStoreInterface) => state.postState.postDataMapping
  );
  const postData = postDataMapping[postId];

  useEffect(() => {
    Promise.resolve().then(async () => {
      if (postDataMapping[postId] === undefined) {
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
      }
    });
  }, []);

  if (!postData) {
    return (
      <View height={100} width={"100%"} justifyContent="center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!postData?.storyData) {
    return <></>;
  }

  return <HNArticle storyData={postData.storyData} postNumber={postNumber} />;
};

const HNArticle: React.FC<{
  storyData: AlgoliaGetPostRaw;
  postNumber: number;
}> = ({ storyData, postNumber }) => {
  const urlDomain = new URL(storyData.url ?? `https://${storyData.author}.com`)
    .hostname;
  const dispatch = useDispatch();
  const emoji = `${domainToEmoji(urlDomain)}`;
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);

  const extractChildren = (
    children: AlgoliaGetPostRaw["children"]
  ): AlgoliaCommentRaw[] => {
    const allChildren = children.map((c) => {
      return [c, ...extractChildren(c.children)];
    });
    return allChildren.flat();
  };
  const allComments = extractChildren(storyData.children);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const openGraphImage = await getOpenGraphImageURL(storyData.url);
      if (openGraphImage) {
        setImageURL(openGraphImage);
      }
    });
  }, []);

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
          onPress={() => {
            dispatch(setCurrentlyViewingPost({ newState: storyData.id }));
            router.push("/post");
          }}
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
                    onPress={() => {
                      dispatch(
                        setCurrentlyViewingUser({
                          newState: storyData.author,
                        })
                      );
                      router.push("/user");
                    }}
                  >
                    <Text fontSize={"$3"}>
                      by {storyData.author.replace(" ", "")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View paddingTop={5} flexDirection="row">
                  <Text fontSize={"$3"}>
                    {nFormatter(storyData.points)} points
                  </Text>
                  <Text fontSize={"$3"} paddingLeft={5}>
                    |{" "}
                  </Text>
                  <Text fontSize={"$3"}>
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
};

export default HNArticleRoot;
