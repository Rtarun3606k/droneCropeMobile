import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Polyline,
  Rect,
  Stop,
} from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnalysisAnimation = () => {
  const sequenceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationLoop = () => {
      sequenceAnim.setValue(0);
      Animated.sequence([
        Animated.timing(sequenceAnim, {
          toValue: 1,
          duration: 5000, // Slower, more detailed animation
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(1000), // Pause before looping
      ]).start(() => animationLoop());
    };
    animationLoop();
  }, []);

  // --- Interpolations ---

  // AI Core pulsing
  const coreScale = sequenceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  // Data particles flowing from image to core
  const particle1Y = sequenceAnim.interpolate({
    inputRange: [0.1, 0.4],
    outputRange: [0, -40],
  });
  const particle1Opacity = sequenceAnim.interpolate({
    inputRange: [0.1, 0.35, 0.4],
    outputRange: [0, 1, 0],
  });

  const particle2Y = sequenceAnim.interpolate({
    inputRange: [0.2, 0.5],
    outputRange: [0, -35],
  });
  const particle2Opacity = sequenceAnim.interpolate({
    inputRange: [0.2, 0.45, 0.5],
    outputRange: [0, 1, 0],
  });

  // Orbiting and fading insights
  const insightOrbit = sequenceAnim.interpolate({
    inputRange: [0.5, 1],
    // FIX: Use numbers for rotation to prevent native crash
    outputRange: [0, 360],
  });

  const textInsightOpacity = sequenceAnim.interpolate({
    inputRange: [0.5, 0.6, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });
  const graphInsightOpacity = sequenceAnim.interpolate({
    inputRange: [0.55, 0.65, 0.95, 1],
    outputRange: [0, 1, 1, 0],
  });

  // Internal "thinking" animation for the AI core
  const thinkingPath = sequenceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
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
          <LinearGradient id="coreGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#4ade80" />
            <Stop offset="100%" stopColor="#16a34a" />
          </LinearGradient>
          <LinearGradient id="insightGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#a78bfa" />
            <Stop offset="100%" stopColor="#f472b6" />
          </LinearGradient>
        </Defs>

        {/* --- Animated Elements --- */}

        {/* Image Icon at the bottom */}
        <G y="80">
          <Rect x="42" y="0" width="16" height="12" rx="2" fill="#60a5fa" />
          <Circle cx="47" cy="5" r="1.5" fill="#fff" />
          <Path
            d="M44 9 L 47 7 L 51 9"
            stroke="#fff"
            strokeWidth="1"
            fill="none"
          />
        </G>

        {/* Data Particles */}
        <AnimatedG translateY={particle1Y} opacity={particle1Opacity}>
          <Circle cx="48" cy="80" r="2.5" fill="#a7f3d0" />
        </AnimatedG>
        <AnimatedG translateY={particle2Y} opacity={particle2Opacity}>
          <Circle cx="52" cy="80" r="2.5" fill="#a7f3d0" />
        </AnimatedG>

        {/* AI Core */}
        <AnimatedG scale={coreScale} originX="50" originY="45">
          <Circle cx="50" cy="45" r="22" fill="url(#coreGradient)" />
          <Circle
            cx="50"
            cy="45"
            r="18"
            fill="none"
            stroke="#fff"
            strokeWidth="0.2"
            strokeOpacity="0.7"
          />
          {/* "Thinking" path */}
          <AnimatedPath
            d="M40 45 C 45 35, 55 35, 60 45 C 55 55, 45 55, 40 45"
            stroke="#fff"
            strokeWidth="1"
            fill="none"
            strokeDasharray="100"
            strokeDashoffset={thinkingPath}
            strokeOpacity="0.5"
          />
        </AnimatedG>

        {/* Emerging & Orbiting Insights */}
        <AnimatedG rotation={insightOrbit} originX="50" originY="45">
          {/* Text Insight */}
          <AnimatedG x="20" y="38" opacity={textInsightOpacity}>
            <Rect width="15" height="10" rx="2" fill="url(#insightGradient)" />
            <Path
              d="M 2 3 H 13"
              stroke="#fff"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <Path
              d="M 2 7 H 10"
              stroke="#fff"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </AnimatedG>
          {/* Graph Insight */}
          <AnimatedG x="65" y="38" opacity={graphInsightOpacity}>
            <Rect width="15" height="10" rx="2" fill="url(#insightGradient)" />
            <Polyline
              points="2,8 5,4 8,6 11,2"
              stroke="#fff"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AnimatedG>
        </AnimatedG>
      </Svg>
    </View>
  );
};

export default AnalysisAnimation;
