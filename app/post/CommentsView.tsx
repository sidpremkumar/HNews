import { FlatList } from "react-native";
import { View } from "tamagui";
import CommentViewEntry from "./CommentViewEntry";
import { AlgoliaCommentRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";

const CommentsView: React.FC<{
  initalKids: AlgoliaCommentRaw[];
  postId: number;
  headerComponent?: React.JSX.Element;
}> = ({ headerComponent, initalKids, postId }) => {
  return (
    //   {/* Use a flatlist so it lazy loads since it might be a lot of comments */}
    <FlatList
      ListFooterComponent={<View height={50} />}
      ListHeaderComponent={headerComponent ?? undefined}
      maxToRenderPerBatch={1}
      initialNumToRender={1}
      windowSize={1}
      data={initalKids}
      renderItem={({ item }) => {
        return (
          <View key={item.id}>
            <CommentViewEntry commentData={item} postId={postId} />
          </View>
        );
      }}
    />
  );
};

export default CommentsView;
