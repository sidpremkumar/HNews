import { View } from "tamagui";
import RecursiveComment from "../../components/RecursiveComment";
import { AlgoliaCommentRaw } from "../../utils/HackerNewsClient/HackerNewsClient.types";
import HackerNewsClient from "../../utils/HackerNewsClient/HackerNewsClient";

const CommentViewEntry: React.FC<{
  commentData: AlgoliaCommentRaw;
  postId: number;
  postOP: string;
  parsedElement?: Awaited<ReturnType<typeof HackerNewsClient.getParsedHTML>>;
  setRefresh: (value: boolean) => void;
}> = ({ commentData, postId, postOP, parsedElement, setRefresh }) => {
  return (
    <View>
      <RecursiveComment
        commentData={commentData}
        postId={postId}
        postOP={postOP}
        parsedElement={parsedElement}
        setRefresh={setRefresh}
      />
    </View>
  );
};
export default CommentViewEntry;
