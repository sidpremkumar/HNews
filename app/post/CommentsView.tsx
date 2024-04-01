import { FlatList } from "react-native";
import RecursiveComment from "../../components/RecursiveComment";
import { View } from "tamagui";
import { GetCommentResponseRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";

const CommentsView: React.FC<{
  commentData: GetCommentResponseRaw[];
  headerComponent?: React.JSX.Element;
}> = ({ commentData, headerComponent }) => {
  return (
    //   {/* Use a flatlist so it lazy loads since it might be a lot of comments */}
    <FlatList
      ListFooterComponent={<View height={50} />}
      ListHeaderComponent={headerComponent ?? undefined}
      maxToRenderPerBatch={1}
      initialNumToRender={2}
      windowSize={1}
      data={commentData.filter((d) => {
        if (!d.text || !d.by) {
          return false;
        }
        return true;
      })}
      renderItem={({ item }) => {
        return (
          <View key={item.id}>
            <RecursiveComment data={item} />
          </View>
        );
      }}
    />
  );
};

export default CommentsView;
