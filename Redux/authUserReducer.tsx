import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  AlgoliaCommentRaw,
  GetUserResponseRaw,
} from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface AuthUserReducer {
  userLoggedIn: boolean;
  userName?: string;
  userInfo?: GetUserResponseRaw;
  /**
   * Algolia takes a sec to update
   * When a user comments, we want it to show up immdielty, so save
   * the comment data in memory for the duration of the session
   */
  inMemoryUserComments: { [key: number]: AlgoliaCommentRaw[] };
}
export const counterSlice = createSlice({
  name: "authUser",
  initialState: {
    userLoggedIn: false,
    userName: undefined,
    userInfo: undefined,
    inMemoryUserComments: {},
  } as AuthUserReducer,
  reducers: {
    setUserLoggedIn: (state, action: PayloadAction<{ newState: boolean }>) => {
      state.userLoggedIn = action.payload.newState;

      if (action.payload.newState === false) {
        state.userName = undefined;
        state.userInfo = undefined;
      }
    },
    setUserName: (state, action: PayloadAction<{ newState: string }>) => {
      state.userName = action.payload.newState;
    },

    setUserInfo: (
      state,
      action: PayloadAction<{ newState: GetUserResponseRaw }>
    ) => {
      state.userInfo = action.payload.newState;
    },

    addToInMemoryUserComment: (
      state,
      action: PayloadAction<{
        itemId: number;
        comment: AlgoliaCommentRaw;
      }>
    ) => {
      state.inMemoryUserComments[action.payload.itemId] = [
        ...(state.inMemoryUserComments[action.payload.itemId] || []),
        action.payload.comment,
      ];
    },
  },
  selectors: {},
});

export const {
  setUserLoggedIn,
  setUserName,
  setUserInfo,
  addToInMemoryUserComment,
} = counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
