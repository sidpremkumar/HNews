import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import aiSummaryCacheReducer from "./aiSummaryCacheReducer";
import authUserReducer from "./authUserReducer";
import homeScreenReducer from "./homeScreenReducer";
import postStateReducer from "./postStateReducer";
import settingsReducer from "./settingsReducer";
import userStateReducer from "./userStateReducer";

const appReducer = combineReducers({
  postState: postStateReducer,
  userState: userStateReducer,
  homeScreen: homeScreenReducer,
  authUser: authUserReducer,
  settings: settingsReducer,
  aiSummaryCache: aiSummaryCacheReducer,
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
