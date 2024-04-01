import { Reducer, combineReducers, configureStore } from "@reduxjs/toolkit";
import postStateReducer from "./postStateReducer";
import { useDispatch } from "react-redux";
import homeScreenReducer from "./homeScreenReducer";
import userStateReducer from "./userStateReducer";

const appReducer = combineReducers({
  postState: postStateReducer,
  userState: userStateReducer,
  homeScreen: homeScreenReducer,
});

// @ts-ignore
const rootReducer = (state, action) => {
  if (action.type === "USER_LOGOUT") {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export type ReduxStoreInterface = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});
export default store;

/**
 * App dispatch
 */
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
