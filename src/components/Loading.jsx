import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Text,
  useColorScheme,
  View,
} from "react-native";

const Loading = ({
  visible = false,
  message = "Loading...",
  showSpinner = true,
  showPulse = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Staggered dot animations
      const dotAnimations = dotAnims.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );

      dotAnimations.forEach((anim) => anim.start());
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
        }}
        className="flex-1 justify-center items-center"
      >
        {/* Dim Background Overlay */}
        <View
          className={`absolute inset-0 ${
            isDark ? "bg-black/70" : "bg-black/50"
          }`}
        />

        {/* Simple Loading Content */}
        <View className="items-center">
          {/* Three Pulsing Dots */}
          <View className="flex-row items-center justify-center mb-6">
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={{
                  marginHorizontal: 6,
                  opacity: dotAnims[index],
                  transform: [
                    {
                      scale: dotAnims[index].interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            ))}
          </View>

          {/* Loading Text */}
          <Text
            className={`text-center text-lg font-medium ${
              isDark ? "text-white" : "text-white"
            }`}
          >
            {message}
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default Loading;
