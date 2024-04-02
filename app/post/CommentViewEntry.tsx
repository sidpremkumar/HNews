import { View } from "tamagui";
import RecursiveComment from "../../components/RecursiveComment";
import { AlgoliaCommentRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";

const CommentViewEntry: React.FC<{
  commentData: AlgoliaCommentRaw;
  postId: number;
  postOP: string;
}> = ({ commentData, postId, postOP }) => {
  return (
    <View>
      <RecursiveComment
        commentData={commentData}
        postId={postId}
        postOP={postOP}
      />
    </View>
  );
};
export default CommentViewEntry;
