import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetStoryResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface PostStateReducer {
  topStories?: number[];
}
export const counterSlice = createSlice({
  name: "homeScreenReducer",
  initialState: {
    topStories: undefined,
  } as PostStateReducer,
  reducers: {
    setTopStories: (
      state,
      action: PayloadAction<{
        newState?: number[];
      }>
    ) => {
      state.topStories = action.payload.newState;
    },
  },
  selectors: {},
});

export const { setTopStories } = counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
