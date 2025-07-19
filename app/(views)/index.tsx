import { Link } from "expo-router";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropdownLanguageSelector from "../../src/components/DropdownLanguageSelector";
import { useLanguage } from "../../src/contexts/LanguageContext.tsx";

const { height: screenHeight } = Dimensions.get("window");

const Index = () => {
  const { t, getTranslationData, currentLanguage } = useLanguage();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          minHeight: screenHeight * 0.9,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="bg-gradient-to-br from-green-600 to-green-800 dark:from-green-700 dark:to-green-900 px-6 py-12">
          <View className="items-center mb-8">
            {/* Logo/Brand */}
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Text className="text-green-600 text-xl font-bold">🚁</Text>
              </View>
              <Text className="text-white text-2xl font-bold">{t("common.brand")}</Text>
            </View>

            {/* Hero Title */}
            <Text className="text-3xl font-bold text-white mb-4 text-center leading-tight">
              {t("Home.title")}
            </Text>

            {/* Hero Description */}
            <Text className="text-lg text-green-100 text-center mb-8 leading-relaxed">
              {t("Home.description")}
            </Text>

            {/* Upload Button */}
            <TouchableOpacity
              className="bg-white rounded-xl px-8 py-4 shadow-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Text className="text-green-600 text-lg font-semibold mr-2">
                  {t("Home.actionButton")}
                </Text>
                <Text className="text-green-600 text-xl">📤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Selector Section */}
        <View className="px-6 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            {t("common.selectLanguage")}
          </Text>
          <DropdownLanguageSelector />
        </View>

        {/* Process Flow Section */}
        <View className="px-6 py-8">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How It Works
          </Text>

          {/* Flow Steps */}
          <View className="space-y-6">
            {(() => {
              const steps = getTranslationData("Flow.steps");
              if (Array.isArray(steps)) {
                return steps.map((step: any, index: number) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-4 mt-1">
                      <Text className="text-white text-sm font-bold">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {step.title}
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step.text}
                      </Text>
                    </View>
                  </View>
                ));
              }
              
              // Fallback if translation fails
              return (
                <View className="flex-row items-start">
                  <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-4 mt-1">
                    <Text className="text-white text-sm font-bold">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Upload Drone Image
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Capture aerial images using a drone and upload them through the Drone Crop app.
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>

        {/* Services Section */}
        <View className="bg-gray-100 dark:bg-gray-800  py-8">
          {/* <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t("Carousel.title")}
          </Text> */}

                  {/* Services Carousel Section */}
        <View className=" py-8 bg-gray-50 dark:bg-gray-900 w-full">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t("Carousel.title")}
          </Text>
          
          <View className="space-y-6">
            {(() => {
              const items = getTranslationData("Carousel.items");
              if (Array.isArray(items)) {
                return items.map((item: any, index: number) => (
                  <View key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 m-3 ">
                    <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </Text>
                    {item.features && Array.isArray(item.features) && (
                      <View className="space-y-2">
                        {item.features.map((feature: string, featureIndex: number) => (
                          <Text key={featureIndex} className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            • {feature}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ));
              }
              
              // Fallback if translation fails
              return (
                <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Disease Detection
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Advanced AI-powered analysis to identify crop diseases early.
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 py-8 space-y-4">
          {/* Login Button */}
          <Link href={'/(auth)/login' as any} asChild>
            <TouchableOpacity
              className="bg-green-600 dark:bg-green-500 rounded-2xl p-4 shadow-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white text-lg font-semibold mr-2">
                  {t("common.login")}
                </Text>
                <Text className="text-white text-xl">🔐</Text>
              </View>
            </TouchableOpacity>
          </Link>

          {/* Dashboard Button */}
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-2 border-green-200 dark:border-green-700"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-green-600 dark:text-green-400 text-lg font-semibold mr-2">
                {t("common.dashboard")}
              </Text>
              <Text className="text-green-600 dark:text-green-400 text-xl">📊</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="bg-gray-900 dark:bg-black px-6 py-8">
          <View className="items-center mb-6">
            <Text className="text-green-400 text-2xl font-bold mb-2">
              {t("common.brand")}
            </Text>
            <Text className="text-gray-400 text-center">
              {t("Home.description")}
            </Text>
          </View>

          {/* Footer Links */}
          <View className="flex-row justify-around mb-6">
            <TouchableOpacity className="items-center">
              <Text className="text-gray-300 text-sm">{t("common.home")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Text className="text-gray-300 text-sm">{t("common.services")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Text className="text-gray-300 text-sm">{t("common.about")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Text className="text-gray-300 text-sm">{t("common.contact")}</Text>
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <Text className="text-center text-xs text-gray-500">
            © 2025 {t("common.brand")}. {t("common.rights")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
