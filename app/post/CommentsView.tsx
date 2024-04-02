import { FlatList } from "react-native";
import { View } from "tamagui";
import CommentViewEntry from "./CommentViewEntry";
import { AlgoliaCommentRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";

const CommentsView: React.FC<{
  initalKids: AlgoliaCommentRaw[];
  postId: number;
  postOP: string;
  headerComponent?: React.JSX.Element;
}> = ({ headerComponent, initalKids, postId, postOP }) => {
  return (
    //   {/* Use a flatlist so it lazy loads since it might be a lot of comments */}
    <FlatList
      ListFooterComponent={<View height={50} />}
      ListHeaderComponent={headerComponent ?? undefined}
      maxToRenderPerBatch={5}
      initialNumToRender={5}
      windowSize={1}
      data={initalKids}
      renderItem={({ item }) => {
        return (
          <View key={item.id}>
            <CommentViewEntry
              commentData={item}
              postId={postId}
              postOP={postOP}
            />
          </View>
        );
      }}
    />
  );
};

export default CommentsView;
