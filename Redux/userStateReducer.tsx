import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetUserResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface UserStateReducer {
  currentlyViewingUser: string | undefined;
  userData: GetUserResponseRaw | undefined;
}
export const counterSlice = createSlice({
  name: "postState",
  initialState: {
    currentlyViewingUser: undefined,
    userData: undefined,
  } as UserStateReducer,
  reducers: {
    setCurrentlyViewingUser: (
      state,
      action: PayloadAction<{ newState: string }>
    ) => {
      state.currentlyViewingUser = action.payload.newState;
      /**
       * Clear out user data as well so we are forced to refresh
       */
      state.userData = undefined;
    },
    setUserData: (
      state,
      action: PayloadAction<{ newState: GetUserResponseRaw }>
    ) => {
      state.userData = action.payload.newState;
    },
  },
  selectors: {},
});

export const { setCurrentlyViewingUser, setUserData } = counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
