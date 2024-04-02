import { View } from "tamagui";
import RecursiveComment from "../../components/RecursiveComment";
import { AlgoliaCommentRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";

const CommentViewEntry: React.FC<{
  commentData: AlgoliaCommentRaw;
  postId: number;
}> = ({ commentData, postId }) => {
  return (
    <View>
      <RecursiveComment commentData={commentData} postId={postId} />
    </View>
  );
};
export default CommentViewEntry;
