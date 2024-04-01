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
      maxToRenderPerBatch={2}
      initialNumToRender={2}
      data={commentData}
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
