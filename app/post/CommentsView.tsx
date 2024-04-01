import { FlatList } from "react-native";
import RecursiveComment from "../../components/RecursiveComment";
import { View } from "tamagui";

const CommentsView: React.FC<{
  commentIds: number[];
  headerComponent?: React.JSX.Element;
}> = ({ commentIds, headerComponent }) => {
  return (
    //   {/* Use a flatlist so it lazy loads since it might be a lot of comments */}
    <FlatList
      ListFooterComponent={<View height={50} />}
      ListHeaderComponent={headerComponent ?? undefined}
      data={commentIds}
      renderItem={({ item }) => {
        return (
          <View key={item} marginHorizontal={10} marginVertical={10}>
            <RecursiveComment commentId={item} />
          </View>
        );
      }}
    />
  );
};

export default CommentsView;
