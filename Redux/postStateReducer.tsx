import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AlgoliaGetPostRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";

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

      // Limit the size of postDataMapping to prevent memory issues
      const maxEntries = 1000;
      const entries = Object.keys(state.postDataMapping);
      if (entries.length > maxEntries) {
        // Remove oldest entries (keep the most recent ones)
        const sortedEntries = entries
          .map(key => ({ key, postId: parseInt(key) }))
          .sort((a, b) => b.postId - a.postId)
          .slice(0, maxEntries);

        const newMapping: { [key: number]: { storyData: AlgoliaGetPostRaw | undefined } } = {};
        sortedEntries.forEach(entry => {
          newMapping[entry.postId] = state.postDataMapping[entry.postId];
        });
        state.postDataMapping = newMapping;
      }
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
export const { } = counterSlice.selectors;

export default counterSlice.reducer;
