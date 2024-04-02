import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetStoryResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface FilterData {
  title: string;
  defaultSelected?: boolean;
}
export interface PostStateReducer {
  topStories?: number[];
  homeScreenRefreshing: boolean;
  filterSelected?: FilterData;
}
export const counterSlice = createSlice({
  name: "homeScreenReducer",
  initialState: {
    topStories: undefined,
    homeScreenRefreshing: false,
    filterSelected: undefined,
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
    setFilterSelected: (
      state,
      action: PayloadAction<{
        newState?: FilterData;
      }>
    ) => {
      state.filterSelected = action.payload.newState;
    },
    setHomeScreenRefreshing: (
      state,
      action: PayloadAction<{
        newState: boolean;
      }>
    ) => {
      state.homeScreenRefreshing = action.payload.newState;
    },
  },
  selectors: {},
});

export const { setTopStories, setFilterSelected, setHomeScreenRefreshing } =
  counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
