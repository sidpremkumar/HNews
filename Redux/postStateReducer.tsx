import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  AlgoliaGetPostRaw,
  GetCommentResponseRaw,
  GetStoryResponseRaw,
} from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface PostStateReducer {
  currentlyViewingPost: number | undefined;
  postDataMapping: {
    [key: number]: {
      storyData: AlgoliaGetPostRaw | undefined;
    };
  };
}
export const counterSlice = createSlice({
  name: "postState",
  initialState: {
    postDataMapping: {},
    currentlyViewingPost: undefined,
    commentData: undefined,
  } as PostStateReducer,
  reducers: {
    setCurrentlyViewingPost: (
      state,
      action: PayloadAction<{ newState: number }>
    ) => {
      state.currentlyViewingPost = action.payload.newState;
    },
    increaseUpvoteNumber: (
      state,
      action: PayloadAction<{ postId: number }>
    ) => {
      if (
        state.postDataMapping[action.payload.postId] !== undefined &&
        state.postDataMapping[action.payload.postId].storyData !== undefined
      ) {
        // @ts-ignore
        state.postDataMapping[action.payload.postId].storyData.score += 1;
      }
    },
    decreaseUpvoteNumber: (
      state,
      action: PayloadAction<{ postId: number }>
    ) => {
      if (
        state.postDataMapping[action.payload.postId] !== undefined &&
        state.postDataMapping[action.payload.postId].storyData !== undefined
      ) {
        // @ts-ignore
        state.postDataMapping[action.payload.postId].storyData.score -= 1;
      }
    },
    setStoryResponseRaw: (
      state,
      action: PayloadAction<{
        storyData?: AlgoliaGetPostRaw;
        postId: number;
      }>
    ) => {
      state.postDataMapping[action.payload.postId] = {
        storyData: action.payload.storyData,
      };
    },
  },
  selectors: {},
});

export const {
  setStoryResponseRaw,
  setCurrentlyViewingPost,
  increaseUpvoteNumber,
  decreaseUpvoteNumber,
} = counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
