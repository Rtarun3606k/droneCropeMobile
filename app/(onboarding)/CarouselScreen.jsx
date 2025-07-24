import { useRouter } from "expo-router";
import "nativewind";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import AnalysisAnimation from "../../src/components/AnalysisAnimation";
import FarmerAnimation from "../../src/components/FarmerAnimation";
import { useLanguage } from "../../src/contexts/LanguageContext"; // Make sure this path is correct

const { width } = Dimensions.get("window");

// Base structure of slides with animations
const slideAnimations = [
  {
    key: "slide1",
    animation: <FarmerAnimation />,
  },
  {
    key: "slide2",
    animation: <AnalysisAnimation />,
  },
];

const SlideItem = ({ item, isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [isActive]);

  return (
    <View
      className="flex-1 items-center justify-start pt-24 px-8"
      style={{ width }}
    >
      <View
        style={{ width: width * 0.7, height: width * 0.7, marginBottom: 40 }}
      >
        {item.animation}
      </View>
      <Animated.View
        className="items-center"
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Text className="text-3xl font-extrabold text-white mb-4 text-center">
          {item.title}
        </Text>
        <Text className="text-lg text-gray-300 text-center leading-relaxed">
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
};

const CarouselScreen = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { t } = useLanguage(); // Use your language hook

  // Create the slides array dynamically based on the current language
  const slides = useMemo(() => {
    // t('slides') should return the array of slides for the current language
    // e.g., [{"title": "...", "description": "..."}, {"title": "...", "description": "..."}]
    const translatedSlides = t("slides");

    // Check if the translation is available and is an array
    if (Array.isArray(translatedSlides)) {
      // Combine the translated text with the predefined animations
      return slideAnimations.map((animSlide, index) => ({
        ...animSlide,
        title: translatedSlides[index]?.title || "", // Fallback to empty string
        description: translatedSlides[index]?.description || "",
      }));
    }
    // Fallback to English or an empty array if translations are not ready
    return [];
  }, [t]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current.scrollToIndex({ index: nextIndex });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current.scrollToIndex({ index: prevIndex });
    } else {
      router.replace("FirstScreen");
    }
  };

  const handleGetStarted = () => {
    router.replace("/login");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // If slides are not loaded yet, show a loading indicator
  if (slides.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item, index }) => (
          <SlideItem item={item} isActive={index === currentIndex} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <View className="flex-row justify-center my-4">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 transition-all duration-300 ${
              currentIndex === index ? "w-6 bg-green-500" : "w-2 bg-gray-600"
            }`}
          />
        ))}
      </View>

      <View className="flex-row justify-between items-center px-6 pb-8">
        <TouchableOpacity className="py-4 px-8" onPress={handlePrev}>
          <Text className="text-gray-400 text-lg font-bold">
            {t("common.previous") || "Prev"}
          </Text>
        </TouchableOpacity>

        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity
            className="bg-green-500 py-4 px-10 rounded-full shadow-lg"
            onPress={handleNext}
          >
            <Text className="text-white text-lg font-bold">
              {t("common.next") || "Next"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-blue-600 py-4 px-10 rounded-full shadow-lg"
            onPress={handleGetStarted}
          >
            <Text className="text-white text-lg font-bold">
              {t("common.getStarted") || "Get Started"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CarouselScreen;
