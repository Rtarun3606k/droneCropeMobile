import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useLanguage } from "../../src/contexts/LanguageContext";

const TabsLayout = () => {
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#16a34a", // green-600
          tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6b7280", // gray-400 dark, gray-500 light
          tabBarBackground: () => (
            <BlurView
              intensity={50} // Maximum blur intensity
              tint={isDark ? "dark" : "light"} // Blur tint based on theme
              experimentalBlurMethod="dimezisBlurView" // Enhanced blur method (if available)
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                borderRadius: 25, // Match the tab bar border radius
                overflow: "hidden",
              }}
            />
          ),
          tabBarStyle: {
            borderTopWidth: 0, // Remove default border
            paddingBottom: 12,
            paddingTop: 12,
            paddingHorizontal: 16,
            marginHorizontal: 20, // Side margins for floating effect
            marginBottom: 55, // Bottom margin for floating effect
            height: 70,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 25, // Rounded corners for floating effect
            overflow: "hidden", // Important for blur effect
            // Shadow for iOS
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            // Shadow for Android
            elevation: 8,
            // Border for better definition
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#f3f4f6", // subtle border
            // Remove backgroundColor since BlurView handles it
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 4,
            color: isDark ? "#f3f4f6" : "#374151", // gray-100 dark, gray-700 light
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("common.home"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Upload"
          options={{
            title: t("common.upload"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "cloud-upload" : "cloud-upload-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Dashboard"
          options={{
            title: t("common.dashboard"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: t("common.profile"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
};

export default TabsLayout;
