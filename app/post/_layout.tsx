import { router } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { PostStateReducer } from "../../Redux/postStateReducer";
import StoryView from "./StoryView";

export default function PostLayout() {
  const postDataMapping = useSelector(
    (state: { postState: PostStateReducer }) => state.postState.postDataMapping
  );
  const currentlyViewingPost = useSelector(
    (state: { postState: PostStateReducer }) =>
      state.postState.currentlyViewingPost
  );
  useEffect(() => {
    if (!currentlyViewingPost || !postDataMapping[currentlyViewingPost]) {
      router.back();
    }
  }, []);

  if (currentlyViewingPost && postDataMapping[currentlyViewingPost]) {
    return <StoryView />;
  } else {
    <></>;
  }
}
