// src/components/HomeLocationInfo.jsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";

const HomeLocationInfo = ({ onAlert, refreshTrigger, onUseAsDefault }) => {
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const [homeLocation, setHomeLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadHomeLocation = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/get-home-location`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.coordinates) {
          setHomeLocation(data.coordinates);
        } else {
          setHomeLocation(null);
        }
      }
    } catch (error) {
      console.error("Error loading home location:", error);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    if (!hasLoaded || refreshTrigger > 0) {
      loadHomeLocation();
    }
  }, [refreshTrigger]);

  const handleUseAsDefault = () => {
    if (homeLocation && onUseAsDefault) {
      onUseAsDefault(homeLocation);
      if (onAlert) {
        onAlert("Default location applied for this upload session.", "success");
      }
    }
  };

  if (loading) {
    return (
      <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <ActivityIndicator size="small" color="#10b981" />
        <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
          Loading location...
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
      <View className="flex-row items-start space-x-3">
        <Ionicons name="information-circle" size={16} color="#3b82f6" />
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="text-gray-900 dark:text-white font-semibold ml-2">
              {t("homeLocation.title") || "Default Location"}
            </Text>
          </View>

          {homeLocation ? (
            <View>
              <Text className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                {t("homeLocation.hasLocationDesc") ||
                  "You have a default location set."}
              </Text>
              <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="home" size={14} color="#10b981" />
                    <Text className="text-green-800 dark:text-green-200 font-medium text-sm ml-1">
                      Current Location
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleUseAsDefault}
                    className="bg-green-600 rounded px-3 py-1"
                  >
                    <Text className="text-white text-xs">Use for Upload</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-green-700 dark:text-green-300 text-sm">
                  {homeLocation.address}
                </Text>
                <Text className="text-green-600 dark:text-green-400 text-xs mt-1">
                  {homeLocation.lat?.toFixed(6)}, {homeLocation.lng?.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-2">
                No Default Location Set
              </Text>
              <Text className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Set a default location to use for images without GPS data.
              </Text>
              <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                <Text className="text-yellow-800 dark:text-yellow-200 text-xs">
                  💡 <Text className="font-medium">Tip:</Text> Use the map below
                  to set your farm location.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default HomeLocationInfo;
