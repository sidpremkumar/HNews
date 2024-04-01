import { router } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { PostStateReducer } from "../../Redux/postStateReducer";
import UserView from "./UserView";
import { ReduxStoreInterface } from "../../Redux/store";

export default function PostLayout() {
  const currentlyViewingUser = useSelector(
    (state: ReduxStoreInterface) => state.userState.currentlyViewingUser
  );

  useEffect(() => {
    if (!currentlyViewingUser) {
      router.back();
    }
  }, []);

  if (currentlyViewingUser) {
    return <UserView userId={currentlyViewingUser} />;
  } else {
    <></>;
  }
}
