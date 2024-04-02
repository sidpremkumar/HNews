import { FlatList } from "react-native";
import { View } from "tamagui";
import CommentViewEntry from "./CommentViewEntry";
import { AlgoliaCommentRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";

const CommentsView: React.FC<{
  initalKids: AlgoliaCommentRaw[];
  postId: number;
  postOP: string;
  headerComponent?: React.JSX.Element;
  parsedElement?: Awaited<ReturnType<typeof HackerNewsClient.getParsedHTML>>;
  setRefresh: (value: boolean) => void;
}> = ({
  headerComponent,
  initalKids,
  postId,
  postOP,
  parsedElement,
  setRefresh,
}) => {
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
              setRefresh={setRefresh}
              parsedElement={parsedElement}
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
