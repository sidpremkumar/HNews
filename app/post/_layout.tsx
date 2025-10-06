import { router, useSegments } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { PostStateReducer } from "../../Redux/postStateReducer";
import MainPostView from "./MainPostView";
import ChatScreen from "./chat";

export default function PostLayout() {
  const segments = useSegments();
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

  // Check if we're on the chat route
  const isChatRoute = segments.includes('chat');

  if (isChatRoute) {
    return <ChatScreen />;
  }

  if (currentlyViewingPost && postDataMapping[currentlyViewingPost]) {
    return <MainPostView />;
  } else {
    return <></>;
  }
}
