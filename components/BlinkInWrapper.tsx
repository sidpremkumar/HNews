import React from "react";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function BlinkInWrapper({
  children,
  flex = 1,
}: {
  children: React.ReactNode;
  flex?: number;
}) {
  const opacity = useSharedValue(0);
  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withSpring(1, { duration: 750 });
  }, []);

  return (
    <Animated.View
      style={{
        flex: flex,
        ...opacityStyle,
      }}
    >
      {children}
    </Animated.View>
  );
}
