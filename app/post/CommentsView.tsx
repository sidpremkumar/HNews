import { FlatList } from "react-native";
import { View } from "tamagui";
import CommentViewEntry from "./CommentViewEntry";

const CommentsView: React.FC<{
  initalKids: number[];
  postId: number;
  headerComponent?: React.JSX.Element;
}> = ({ headerComponent, initalKids, postId }) => {
  return (
    //   {/* Use a flatlist so it lazy loads since it might be a lot of comments */}
    <FlatList
      ListFooterComponent={<View height={50} />}
      ListHeaderComponent={headerComponent ?? undefined}
      maxToRenderPerBatch={1}
      initialNumToRender={2}
      windowSize={1}
      data={initalKids}
      renderItem={({ item }) => {
        return (
          <View key={item}>
            <CommentViewEntry commentId={item} postId={postId} />
          </View>
        );
      }}
    />
  );
};

export default CommentsView;
