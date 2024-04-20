import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const TabBarBottom: React.FC<{
  color: string;
  focused: boolean;
  icon: React.JSX.Element;
  onPress?: () => void;
}> = ({ color, focused, icon, onPress }) => {
  const scaleAdjustment = useRef(
    new Animated.Value(focused === true ? 1.2 : 1)
  ).current;
  // const [startAnimation, setStartAnimation] = useState(false);

  const totalAnimationTime = 250;
  async function startAnimate() {
    return new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.timing(scaleAdjustment, {
          toValue: 1.1,
          duration: totalAnimationTime / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAdjustment, {
          toValue: focused === true ? 1.2 : 1,
          duration: totalAnimationTime / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        resolve();
      });
    });
  }

  if (focused) startAnimate();

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAdjustment }],
      }}
    >
      <TouchableOpacity
        onPress={async () => {
          /**
           * This doesnt work and idk why
           */
          startAnimate();
          if (onPress) {
            onPress();
          }
        }}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TabBarBottom;
