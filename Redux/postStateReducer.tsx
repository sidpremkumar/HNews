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
      commentData: GetCommentResponseRaw[] | undefined;
      moreComments?: boolean;
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
    addToCommentData: (
      state,
      action: PayloadAction<{
        postId: number;
        commentData: GetCommentResponseRaw;
      }>
    ) => {
      if (state.postDataMapping[action.payload.postId] !== undefined) {
        state.postDataMapping[action.payload.postId].commentData?.push(
          action.payload.commentData
        );
      }
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
        storyData?: GetStoryResponseRaw;
        commentData?: GetCommentResponseRaw[];
        moreComments?: boolean;
        postId: number;
      }>
    ) => {
      state.postDataMapping[action.payload.postId] = {
        storyData: action.payload.storyData,
        commentData: action.payload.commentData,
        moreComments: action.payload.moreComments,
      };
    },
  },
  selectors: {},
});

export const {
  setStoryResponseRaw,
  setCurrentlyViewingPost,
  addToCommentData,
  increaseUpvoteNumber,
  decreaseUpvoteNumber,
} = counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
