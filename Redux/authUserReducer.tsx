import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetUserResponseRaw } from "../utils/HackerNewsClient/HackerNewsClient.types";

export interface AuthUserReducer {
  userLoggedIn: boolean;
  userName?: string;
  userInfo?: GetUserResponseRaw;
}
export const counterSlice = createSlice({
  name: "authUser",
  initialState: {
    userLoggedIn: false,
    userName: undefined,
    userInfo: undefined,
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
  },
  selectors: {},
});

export const { setUserLoggedIn, setUserName, setUserInfo } =
  counterSlice.actions;
export const {} = counterSlice.selectors;

export default counterSlice.reducer;
