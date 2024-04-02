import { View } from "tamagui";
import RecursiveComment from "../../components/RecursiveComment";

const CommentViewEntry: React.FC<{ commentId: number; postId: number }> = ({
  commentId,
  postId,
}) => {
  return (
    <View>
      <RecursiveComment commentId={commentId} postId={postId} />
    </View>
  );
};
export default CommentViewEntry;
