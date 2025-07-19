import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../src/contexts/LanguageContext";

const { height: screenHeight } = Dimensions.get("window");

const Login = () => {
  const { t, currentLanguage } = useLanguage();
  const [credentials, setCredentials] = useState({
    userId: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateCredentials = () => {
    if (!credentials.userId.trim()) {
      Alert.alert(t("common.error"), t("login.errorUserId"), [
        { text: t("common.ok") },
      ]);
      return false;
    }

    if (!credentials.password.trim()) {
      Alert.alert(t("common.error"), t("login.errorPassword"), [
        { text: t("common.ok") },
      ]);
      return false;
    }

    if (credentials.password.length < 6) {
      Alert.alert(t("common.error"), t("login.errorPasswordLength"), [
        { text: t("common.ok") },
      ]);
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateCredentials()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock validation - replace with actual API call
      if (
        credentials.userId === "demo123" &&
        credentials.password === "password123"
      ) {
        Alert.alert(t("common.success"), t("messages.loginSuccess"), [
          {
            text: t("common.ok"),
            onPress: () => router.replace("/(views)"),
          },
        ]);
      } else {
        Alert.alert(t("common.error"), t("login.errorInvalidCredentials"), [
          { text: t("common.ok") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("messages.networkError"), [
        { text: t("common.ok") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openDroneCropWebsite = () => {
    Alert.alert(t("login.websiteTitle"), t("login.websiteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("login.openWebsite"),
        onPress: () => Linking.openURL("https://dronecrop.com/profile"),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            minHeight: screenHeight * 0.9,
            paddingBottom: Platform.OS === "android" ? 20 : 0,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-8 flex-1">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t("login.welcomeBack")}
              </Text>
              <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
                {t("login.signInMessage")}
              </Text>
            </View>

            {/* Login Form */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-700 mb-6">
              {/* User ID Field */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("login.userIdLabel")} *
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t("login.userIdPlaceholder")}
                  placeholderTextColor="#9CA3AF"
                  value={credentials.userId}
                  onChangeText={(text) =>
                    setCredentials({ ...credentials, userId: text })
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Password Field */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("login.passwordLabel")} *
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                    placeholder={t("login.passwordPlaceholder")}
                    placeholderTextColor="#9CA3AF"
                    value={credentials.password}
                    onChangeText={(text) =>
                      setCredentials({ ...credentials, password: text })
                    }
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3"
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Text className="text-green-600 dark:text-green-400 text-lg">
                      {showPassword ? "🙈" : "👁️"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center justify-center ${
                  isLoading
                    ? "bg-gray-400 dark:bg-gray-600"
                    : "bg-green-600 dark:bg-green-500"
                }`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-semibold ml-2">
                      {t("login.signingIn")}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-lg font-semibold">
                    {t("common.login")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* User ID Information */}
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Text className="text-blue-600 dark:text-blue-400 text-xl mr-3">
                  ℹ️
                </Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    {t("login.userIdInfoTitle")}
                  </Text>
                  <Text className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                    {t("login.userIdInfoMessage")}
                  </Text>
                  <TouchableOpacity
                    className="bg-blue-600 dark:bg-blue-500 px-4 py-2 rounded-lg self-start"
                    onPress={openDroneCropWebsite}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-sm font-medium">
                      {t("login.visitWebsite")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Demo Credentials */}
            <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Text className="text-yellow-600 dark:text-yellow-400 text-xl mr-3">
                  🔑
                </Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    {t("login.demoCredentials")}
                  </Text>
                  <Text className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t("login.demoUserId")}: demo123{"\n"}
                    {t("login.demoPassword")}: password123
                  </Text>
                </View>
              </View>
            </View>

            {/* Navigation */}
            <View className="items-center">
              <Link href="/" asChild>
                <TouchableOpacity className="flex-row items-center py-3 px-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <Text className="text-gray-700 dark:text-gray-300 mr-2">
                    ←
                  </Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-medium">
                    {t("common.home")}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
