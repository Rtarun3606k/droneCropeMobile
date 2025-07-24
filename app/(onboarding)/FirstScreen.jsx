import { Image } from "expo-image";
import { useRouter } from "expo-router";
import "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DropdownLanguageSelector from "../../src/components/DropdownLanguageSelector";
import useTranslation from "../../src/hooks/useTranslation";

const languageArray = [
  { brand: "DroneCrop", ln: "English" },
  { brand: "ಡ್ರೋನ್‌ಕ್ರಾಪ್ಸ್", ln: "Kannada" },
  { brand: "ड्रोनक्रॉप", ln: "Hindi" },
  { brand: "ட்ரோன் க்ராப்", ln: "Tamil" },
  { brand: "డ్రోన్ క్రాప్", ln: "Telugu" },
  { brand: "ഡ്രോൺക്രാപ്പ്", ln: "Malayalam" },
  // Add the first item again at the end for a seamless loop
  { brand: "DroneCrop", ln: "English" },
];

// Define the height of each text item for animation calculation
const ITEM_HEIGHT = 40;

const FirstScreen = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { currentLanguage, t } = useTranslation();

  const handleNext = () => {
    router.replace("CarouselScreen");
  };

  useEffect(() => {
    // This interval updates the current index every 2 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 2000); // Change language every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // This effect triggers the animation whenever the index changes
    const toValue = -currentIndex * ITEM_HEIGHT;

    // When we reach the end of the list (the duplicate last item)
    if (currentIndex === languageArray.length - 1) {
      // Animate to the last item
      Animated.timing(scrollY, {
        toValue,
        duration: 400, // Animation duration
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // After the animation, instantly jump back to the start without animation
        scrollY.setValue(0);
        setCurrentIndex(0);
      });
    } else {
      // Regular animation for all other items
      Animated.timing(scrollY, {
        toValue,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex]);

  return (
    <SafeAreaView className="flex-1 justify-center bg-gray-900 w-full">
      <View className="items-center mb-10">
        <Image
          style={{ height: 120, width: 200 }}
          source={require("../../assets/images/logo.png")}
          contentFit="contain"
        />
        {/* This view acts as a container or "mask" for the scrolling text */}
        <View
          style={{ height: ITEM_HEIGHT, overflow: "hidden", marginTop: 12 }}
        >
          <Animated.View style={{ transform: [{ translateY: scrollY }] }}>
            {languageArray.map((item, index) => (
              <Text
                key={index}
                className="text-3xl font-bold text-white text-center"
                style={{ height: ITEM_HEIGHT, lineHeight: ITEM_HEIGHT }}
              >
                {item.brand}
              </Text>
            ))}
          </Animated.View>
        </View>
      </View>
      <View className="items-center mb-10">
        <Text className="text-xl font-semibold text-gray-100 mb-4 text-center">
          Select Your Language
        </Text>

        <Text className="text-lg  text-gray-300 mb-4 text-center italic">
          Current Selected Language: {currentLanguage}
        </Text>
        <View className="w-full p-4">
          <DropdownLanguageSelector />
        </View>
      </View>

      <TouchableOpacity
        className="mt-10 bg-green-500 py-4 px-10 rounded-full self-center active:bg-green-600"
        onPress={handleNext}
      >
        <Text className="text-white text-lg font-bold">{t("common.next")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FirstScreen;
