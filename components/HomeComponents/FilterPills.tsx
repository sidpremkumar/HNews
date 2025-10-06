import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { FilterData, setFilterSelected } from "../../Redux/homeScreenReducer";
import { ReduxStoreInterface } from "../../Redux/store";
import { mainPurple } from "../../utils/main.styles";

const FilterPill: React.FC<{
  data: FilterData;
}> = ({ data }) => {
  const filteredSelected = useSelector(
    (state: ReduxStoreInterface) => state.homeScreen.filterSelected
  );
  const dispatch = useDispatch();

  const selected = filteredSelected?.title === data.title;

  /* Animation values */
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundColorAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const textColorAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const shadowAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  /* Handle selection animation */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(backgroundColorAnim, {
        toValue: selected ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(textColorAnim, {
        toValue: selected ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(shadowAnim, {
        toValue: selected ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [selected, backgroundColorAnim, textColorAnim, shadowAnim]);

  /* Handle press animation */
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    // Add a subtle bounce animation when switching tabs
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    dispatch(setFilterSelected({ newState: data }));
  };

  /* Interpolate colors and effects */
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', mainPurple],
  });

  const textColor = textColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1d1d1f', '#ffffff'],
  });

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.25],
  });

  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 8],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginHorizontal: 4,
        marginVertical: 2,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            backgroundColor,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 18,
            shadowColor: selected ? mainPurple : '#000',
            shadowOffset: {
              width: 0,
              height: selected ? 4 : 2,
            },
            shadowOpacity: shadowOpacity,
            shadowRadius: shadowRadius,
            elevation: selected ? 8 : 2,
            borderWidth: selected ? 0 : 0.5,
            borderColor: 'rgba(0, 0, 0, 0.08)',
            minWidth: 60,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Ripple Effect Overlay */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              opacity: rippleOpacity,
              borderRadius: 18,
            }}
          />
          <Animated.Text
            style={{
              color: textColor,
              fontSize: 13,
              fontWeight: selected ? '600' : '500',
              textAlign: 'center',
              letterSpacing: 0.1,
              numberOfLines: 1,
            }}
          >
            {data.title}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FilterPill;
