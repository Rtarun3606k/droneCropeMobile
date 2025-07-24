import { useRouter } from "expo-router";
import "nativewind";
import { useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "slide1",
    title: "Analyze Your Fields",
    description: "Get smart insights for your crops using drone imagery.",
  },
  {
    key: "slide2",
    title: "Easy Uploads",
    description: "Upload images and get instant analysis results.",
  },
];

const CarouselScreen = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
    } else {
      // If on first slide, go to FirstScreen
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

  return (
    <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View className="justify-center items-center px-10" style={{ width }}>
            <Text className="text-2xl font-bold text-white mb-5 text-center">
              {item.title}
            </Text>
            <Text className="text-lg text-gray-400 text-center">
              {item.description}
            </Text>
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      <View className="flex-row justify-center mt-10 mb-20">
        <TouchableOpacity
          className="bg-gray-500 py-4 px-8 rounded-full self-center mr-2"
          onPress={handlePrev}
        >
          <Text className="text-white text-lg font-bold">Previous</Text>
        </TouchableOpacity>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity
            className="bg-green-500 py-4 px-10 rounded-full self-center"
            onPress={handleNext}
          >
            <Text className="text-white text-lg font-bold">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-blue-600 py-4 px-10 rounded-full self-center"
            onPress={handleGetStarted}
          >
            <Text className="text-white text-lg font-bold">Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CarouselScreen;
