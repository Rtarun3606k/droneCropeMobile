import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
} from "react-native-svg";

// Create an animatable Svg Group component
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const DroneAnimation = () => {
  // Animation values for different movements
  const loopAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // A single, continuous loop for all movements
    Animated.loop(
      Animated.timing(loopAnim, {
        toValue: 1,
        duration: 4000, // Slower, more deliberate loop
        easing: Easing.easeInOut,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // --- Interpolations for Drone Animation ---

  // Drone hovers up and down
  const droneHoverY = loopAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -5, 0], // Moves up by 5 units
  });

  // Drone moves left and right across the screen
  const droneScanX = loopAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-20, 20, -20], // Scans from left to right and back
  });

  // Scanning beam opacity
  const scanBeamOpacity = loopAnim.interpolate({
    inputRange: [0, 0.1, 0.4, 0.5, 0.6, 0.9, 1],
    outputRange: [0, 1, 1, 0, 1, 1, 0], // Fades in and out
  });

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width="180" height="180" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#FFA500" />
          </RadialGradient>
          <LinearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Circle cx="85" cy="20" r="10" fill="url(#sunGradient)" />

        <Path d="M0 85 Q 50 80, 100 85 L 100 100 L 0 100 Z" fill="#8c6d62" />
        <Path d="M0 90 Q 50 85, 100 90 L 100 100 L 0 100 Z" fill="#5a4d46" />

        {/* Crops */}
        <G>
          <Path d="M15 90 V 80" stroke="#6b8e23" strokeWidth="2" />
          <Circle cx="15" cy="78" r="4" fill="#8fbc8f" />
          <Path d="M25 90 V 82" stroke="#6b8e23" strokeWidth="2" />
          <Circle cx="25" cy="80" r="4" fill="#8fbc8f" />
          <Path d="M75 90 V 80" stroke="#6b8e23" strokeWidth="2" />
          <Circle cx="75" cy="78" r="4" fill="#8fbc8f" />
          <Path d="M85 90 V 82" stroke="#6b8e23" strokeWidth="2" />
          <Circle cx="85" cy="80" r="4" fill="#8fbc8f" />
          <Path d="M45 90 V 80" stroke="#6b8e23" strokeWidth="2" />
          <Circle cx="45" cy="78" r="4" fill="#8fbc8f" />
          <Path d="M55 90 V 82" stroke="#6b8e23" strokeWidth="2" />
          <Circle cx="55" cy="80" r="4" fill="#8fbc8f" />
        </G>

        {/* Drone Group (Animated) */}
        <AnimatedG
          style={{
            transform: [
              { translateX: droneScanX },
              { translateY: droneHoverY },
            ],
          }}
        >
          {/* Drone Body */}
          <Path d="M40 40 Q 50 35, 60 40 L 65 50 L 35 50 Z" fill="#d1d5db" />
          <Circle cx="50" cy="40" r="4" fill="#22c55e" />
          {/* Propellers */}
          <Path
            d="M30 48 L 20 45"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Path
            d="M70 48 L 80 45"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Circle cx="20" cy="45" r="2" fill="#6b7280" />
          <Circle cx="80" cy="45" r="2" fill="#6b7280" />

          {/* Scanning Beam */}
          <AnimatedPolygon
            points="45,50 55,50 75,80 25,80"
            fill="url(#scanGradient)"
            opacity={scanBeamOpacity}
          />
        </AnimatedG>
      </Svg>
    </View>
  );
};

export default DroneAnimation;
