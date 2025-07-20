import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";

const SetAsHome = ({
  setSelectedCoordinatesProp,
  setAddressProp,
  selectedCoordinatesProp,
  addressProp,
  onAlert,
}) => {
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const [isSettingHome, setIsSettingHome] = useState(false);

  const handleSetAsHome = async () => {
    if (!selectedCoordinatesProp || !accessToken) {
      onAlert(
        t("setAsHome.alerts.selectLocationFirst") ||
          "Please select a location first",
        "error"
      );
      return;
    }

    try {
      setIsSettingHome(true);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/set-home-location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            latitude: selectedCoordinatesProp.latitude,
            longitude: selectedCoordinatesProp.longitude,
            address:
              addressProp ||
              `${selectedCoordinatesProp.latitude.toFixed(6)}, ${selectedCoordinatesProp.longitude.toFixed(6)}`,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        onAlert(
          result.message ||
            t("setAsHome.alerts.homeLocationSet") ||
            "Home location saved successfully!",
          "success"
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            t("setAsHome.alerts.setHomeFailed") ||
            "Failed to save home location"
        );
      }
    } catch (error) {
      console.error("Error setting home location:", error);
      onAlert(
        error.message ||
          t("setAsHome.alerts.setHomeFailed") ||
          "Failed to save home location. Please try again.",
        "error"
      );
    } finally {
      setIsSettingHome(false);
    }
  };

  const confirmSetAsHome = () => {
    Alert.alert(
      t("setAsHome.confirmTitle") || "Set as Home Location",
      t("setAsHome.confirmMessage") ||
        `Do you want to set this location as your default home location?\n\n${addressProp || "Selected coordinates"}`,
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("setAsHome.setAsHome") || "Set as Home",
          onPress: handleSetAsHome,
          style: "default",
        },
      ]
    );
  };

  if (!selectedCoordinatesProp) {
    return null;
  }

  return (
    <View className="space-y-3">
      <View className="border-t border-gray-200 dark:border-gray-600 pt-3">
        <TouchableOpacity
          onPress={confirmSetAsHome}
          disabled={isSettingHome}
          className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${
            isSettingHome
              ? "bg-gray-400 dark:bg-gray-600"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          <Ionicons
            name={isSettingHome ? "sync" : "home"}
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-medium">
            {isSettingHome
              ? t("setAsHome.setting") || "Setting as Home..."
              : t("setAsHome.setAsHome") || "Set as Home Location"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <View className="flex-row items-start">
          <Ionicons
            name="information-circle"
            size={16}
            color="#f59e0b"
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <View className="flex-1">
            <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
              <Text className="font-medium">
                {t("homeLocationInfo.title") || "What is Home Location?"}
              </Text>
            </Text>
            <Text className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              {t("homeLocationInfo.hasLocation.description") ||
                "Your home location will be used as the default coordinates for images that don't have GPS data embedded in them."}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SetAsHome;
