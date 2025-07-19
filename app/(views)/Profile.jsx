import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../src/contexts/LanguageContext";
import useAuth from "../../src/hooks/useAuth";

const Profile = () => {
  const { t } = useLanguage();
  const { logout, isAuthenticated, userData } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth guard in _layout.jsx
      Alert.alert(
        t("profile.logoutSuccess") || "Success",
        t("profile.logoutMessage") || "You have been logged out successfully"
      );
    } catch (error) {
      Alert.alert(
        t("profile.logoutError") || "Error",
        t("profile.logoutErrorMessage") || "Failed to logout. Please try again."
      );
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      t("profile.confirmLogout") || "Confirm Logout",
      t("profile.confirmLogoutMessage") || "Are you sure you want to logout?",
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("profile.logout") || "Logout",
          onPress: handleLogout,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            👤 {t("navigation.profile")}
          </Text>

          {/* User Info */}
          {userData && (
            <View className="space-y-3">
              <View className="border-b border-gray-200 dark:border-gray-600 pb-3">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {t("profile.userId") || "User ID"}
                </Text>
                <Text className="text-lg font-medium text-gray-900 dark:text-white">
                  {userData.userId || "N/A"}
                </Text>
              </View>

              <View className="border-b border-gray-200 dark:border-gray-600 pb-3">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {t("profile.email") || "Email"}
                </Text>
                <Text className="text-lg font-medium text-gray-900 dark:text-white">
                  {userData.email || "N/A"}
                </Text>
              </View>

              {userData.name && (
                <View className="pb-3">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {t("profile.name") || "Name"}
                  </Text>
                  <Text className="text-lg font-medium text-gray-900 dark:text-white">
                    {userData.name}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Account Status */}
        <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
          <Text className="text-green-800 dark:text-green-200 font-medium text-center">
            ✅ {t("profile.accountActive") || "Account Active"}
          </Text>
          <Text className="text-green-600 dark:text-green-300 text-sm text-center mt-1">
            {t("profile.loggedInAs") || "Logged in as"}{" "}
            {userData?.email || "user"}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={confirmLogout}
          className="bg-red-600 hover:bg-red-700 rounded-xl py-4 px-6 shadow-lg"
        >
          <Text className="text-white text-center font-semibold text-lg">
            🚪 {t("profile.logout") || "Logout"}
          </Text>
        </TouchableOpacity>

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <View className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Debug Info:
            </Text>
            <Text className="text-gray-500 dark:text-gray-500 text-xs">
              Authenticated: {isAuthenticated ? "Yes" : "No"}
            </Text>
            <Text className="text-gray-500 dark:text-gray-500 text-xs">
              User Data: {userData ? "Available" : "None"}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Profile;
