import { useRootNavigationState } from "expo-router";

export function useIsNavigationReady() {
  const rootNavigationState = useRootNavigationState();
  return rootNavigationState?.key != null;
}
