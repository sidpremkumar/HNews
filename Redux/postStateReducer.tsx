import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  GetCommentResponseRaw,
  GetStoryResponseRaw,
} from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface PostStateReducer {
  currentlyViewingPost: number | undefined;
  postDataMapping: {
    [key: number]: {
      storyData: GetStoryResponseRaw | undefined;
      commentData: GetCommentResponseRaw[];
    };
  };
}
export const counterSlice = createSlice({
  name: "postState",
  initialState: {
    postDataMapping: {},
    currentlyViewingPost: undefined,
  } as PostStateReducer,
  reducers: {
    setCurrentlyViewingPost: (
      state,
      action: PayloadAction<{ newState: number }>
    ) => {
      state.currentlyViewingPost = action.payload.newState;
    },
    setStoryResponseRaw: (
      state,
      action: PayloadAction<{
        storyData?: GetStoryResponseRaw;
        commentData: GetCommentResponseRaw[];
        postId: number;
      }>
    ) => {
      state.postDataMapping[action.payload.postId] = {
        storyData: action.payload.storyData,
        commentData: action.payload.commentData,
      };
    },
  },
  selectors: {},
});

export const { setStoryResponseRaw, setCurrentlyViewingPost } =
  counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
