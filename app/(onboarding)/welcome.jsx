import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

const OnboardingScreen = () => {
  const router = useRouter();

  const handleFinishOnboarding = async () => {
    try {
      // Set the flag in AsyncStorage so this screen doesn't show again
      await AsyncStorage.setItem("hasViewedOnboarding", "true");

      // Navigate to the main app and replace the onboarding stack
      router.replace("/(app)");
    } catch (error) {
      console.error("Failed to save onboarding status", error);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111827",
      }}
    >
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "white",
            marginBottom: 20,
          }}
        >
          Welcome to DroneCrop
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "gray",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Your smart solution for agricultural analysis.
        </Text>
        <TouchableOpacity
          onPress={handleFinishOnboarding}
          style={{
            backgroundColor: "#22c55e",
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderRadius: 30,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
