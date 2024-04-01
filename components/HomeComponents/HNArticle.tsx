import { useEffect, useState } from "react";
import { View, Text, Image } from "tamagui";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";
import {
  GetCommentResponseRaw,
  GetStoryResponseRaw,
} from "../../utils/HackerNewsClient/HackerNewsClient.types";
import { ActivityIndicator, Dimensions } from "react-native";
import { mainGrey, mainPurple, mainStyles } from "../../utils/main.styles";
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
        const res = await HackerNewsClient.getStoryDetails(postId);
        /**
         * Set this first, then we can pull all comments async
         * while the user scrolls
         */
        dispatch(
          setStoryResponseRaw({
            storyData: res,
            commentData: undefined,
            postId,
          })
        );

        /**
         * Pull all comments
         */
        const allComments = await HackerNewsClient.getAllComments(
          res?.kids ?? []
        );
        dispatch(
          setStoryResponseRaw({
            storyData: res,
            commentData: allComments,
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

  if (!postData?.storyData?.url) {
    return <></>;
  }

  return (
    <HNArticle
      storyData={postData.storyData}
      commentData={postData.commentData}
      postNumber={postNumber}
    />
  );
};

const HNArticle: React.FC<{
  storyData: GetStoryResponseRaw;
  commentData?: GetCommentResponseRaw[];
  postNumber: number;
}> = ({ storyData, commentData, postNumber }) => {
  const urlDomain = new URL(storyData.url).hostname;
  const dispatch = useDispatch();
  const emoji = `${domainToEmoji(urlDomain)}`;
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const windowWidth = Dimensions.get("window").width;

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
          <View flexDirection="row">
            <Text fontSize={"$3"} color={mainPurple}>
              {urlDomain}
            </Text>
            <Text fontSize={"$3"}>
              {" "}
              - {dayjs(storyData.time * 1000).format("MMM DD, YYYY")}
            </Text>
          </View>

          <View flexDirection="row">
            <View width={imageURL === undefined ? "100%" : "75%"}>
              <View marginTop={5}>
                <Text fontSize={"$5"}>
                  {emoji}
                  {storyData.title}
                </Text>

                <View paddingTop={8} flexDirection="row">
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(
                        setCurrentlyViewingUser({
                          newState: storyData.by,
                        })
                      );
                      router.push("/user");
                    }}
                  >
                    <Text fontSize={"$3"}>
                      by {storyData.by.replace(" ", "")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View paddingTop={5} flexDirection="row">
                  <Text fontSize={"$3"}>
                    {nFormatter(storyData.score)} points
                  </Text>
                  <Text fontSize={"$3"} paddingLeft={5}>
                    |{" "}
                  </Text>
                  {commentData === undefined ? (
                    <ActivityIndicator size={"small"} />
                  ) : (
                    <Text fontSize={"$3"}>
                      {nFormatter((commentData ?? []).length)} comments
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View
              width={imageURL === undefined ? "0%" : "25%"}
              height={imageURL === undefined ? 0 : "100%"}
            >
              <Image
                source={{ uri: imageURL }}
                height={90}
                width={windowWidth * 0.23}
                resizeMode="cover"
                onError={(err) => {
                  console.log(`Error loading link preview`, err);
                  setImageURL(undefined);
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </BlinkInWrapper>
  );
};

export default HNArticleRoot;
