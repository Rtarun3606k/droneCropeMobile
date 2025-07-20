import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertBox from "../../src/components/AlertBox";
import Loading from "../../src/components/Loading";
import { useLanguage } from "../../src/contexts/LanguageContext";
import useAlert from "../../src/hooks/useAlert";
import useAuth from "../../src/hooks/useAuth";
const Profile = () => {
  const { login, logout, isAuthenticated, userData, isLoading, accessToken } =
    useAuth();

  const {
    alertConfig,
    hideAlert,
    showError,
    showSuccess,
    showInfo,
    showWarning,
  } = useAlert();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [getData, setGetData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const { t } = useLanguage();
  // const { logout, isAuthenticated, userData } = useAuth();
  const getUser = async () => {
    try {
      if (!accessToken) {
        console.log("No access token available");
        // Show info alert for no token
        showInfo(
          "Authentication Required",
          "Please login to access your profile data.",
          {
            showCancel: false,
            okText: "OK",
          }
        );
        return null;
      }

      console.log("Fetching user data with access token:", accessToken);

      const response = await fetch(
        process.env.EXPO_PUBLIC_API_URL + "/api/user/get-user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Check if response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("User data fetched successfully:", data);

      // Set the user data from the response
      setGetData(data.user || data);

      // Show success alert
      showSuccess("Success", "User data loaded successfully!", {
        showCancel: false,
        okText: "Great!",
      });

      return data.user || data;
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Custom error alert instead of Alert.alert
      showError("Error", "Failed to fetch user data. Please try again.", {
        showCancel: true,
        okText: "Retry",
        cancelText: "Cancel",
        onOk: () => {
          // Retry the request
          getUser();
        },
        onCancel: () => {
          console.log("User cancelled retry");
        },
      });

      return null;
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && accessToken && !isLoading) {
        setIsLoadingData(true);
        try {
          await getUser(); // getUser() already handles setGetData
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, accessToken, isLoading]); // Added proper dependencies

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth guard in _layout.jsx
      // Alert.alert(
      //   t("profile.logoutSuccess") || "Success",
      //   t("profile.logoutMessage") || "You have been logged out successfully"
      // );
      showWarning(
        t("profile.logoutSuccess") || "Success",
        t("profile.logoutMessage") || "You have been logged out successfully",
        {
          showCancel: false,
          okText: "OK",
        }
      );
    } catch (error) {
      // Alert.alert(
      //   t("profile.logoutError") || "Error",
      //   t("profile.logoutErrorMessage") || "Failed to logout. Please try again."
      // );
      showError(
        t("profile.logoutError") || "Error",
        t("profile.logoutErrorMessage") ||
          "Failed to logout. Please try again.",
        {
          showCancel: false,
          okText: "OK",
        }
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

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    await getUser();
    setRefresh(false);
  }, [getUser]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {(isLoading || isLoadingData) && (
        <Loading visible={true} message="Loading user data..." />
      )}
      {/* <Loading visible={true} message="Uploading images..." /> */}
      <ScrollView
        className="flex-1 mb-20"
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={onRefresh}
            colors={["#10b981"]} // for Android
            tintColor={"#10b981"} // for iOS
          />
        }
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 ">
            <View className="flex items-center justify-center flex-row space-x-4 mb-4 gap-4">
              <Image
                source={
                  userData && userData
                    ? userData.image
                    : "https://lh3.googleusercontent.com/a/ACg8ocI2qSlFSG1Jqn97mu963OaXFT4B1ppSFalHTNP1Gqk4MsY_tQ=s96-c"
                }
                alt="image"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 12 / 2, // Make it circular
                }}
                resizeMode="cover"
              />
              <Text className="text-2xl font-bold text-gray-900 dark:text-white  text-center">
                {t("navigation.profile")}
              </Text>
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

            {userData && (
              <View className="space-y-3">
                <View className="border-b border-gray-200 dark:border-gray-600 pb-3">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {t("profile.userId") || "User ID"}
                  </Text>
                  <Text className="text-lg font-medium text-gray-900 dark:text-white">
                    {userData.mobileId || "N/A"}
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

          {/* Default Location Section */}
          {getData?.metadata?.homeLocation && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Section Header */}
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name="location"
                  size={24}
                  color="#16a34a"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Default Location
                </Text>
              </View>

              {/* Location Details */}
              {typeof getData.metadata.homeLocation === "object" ? (
                <View className="space-y-3">
                  {/* Coordinates */}
                  {getData.metadata.homeLocation.coordinates && (
                    <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        📍 Coordinates
                      </Text>
                      <Text className="text-gray-900 dark:text-white font-mono text-sm">
                        {Array.isArray(
                          getData.metadata.homeLocation.coordinates
                        )
                          ? `${getData.metadata.homeLocation.coordinates[1]?.toFixed(6)}, ${getData.metadata.homeLocation.coordinates[0]?.toFixed(6)}`
                          : String(getData.metadata.homeLocation.coordinates)}
                      </Text>
                    </View>
                  )}

                  {/* Address */}
                  {getData.metadata.homeLocation.address && (
                    <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        🏠 Address
                      </Text>
                      <Text className="text-gray-900 dark:text-white leading-5">
                        {String(getData.metadata.homeLocation.address)}
                      </Text>
                    </View>
                  )}

                  {/* Created/Updated Dates */}
                  <View className="flex-row space-x-3">
                    {getData.metadata.homeLocation.setAt && (
                      <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <Text className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          📅 Set At
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-xs">
                          {new Date(
                            getData.metadata.homeLocation.setAt
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    {getData.metadata.homeLocation.updatedAt && (
                      <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <Text className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          🔄 Updated
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-xs">
                          {new Date(
                            getData.metadata.homeLocation.updatedAt
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Any other properties */}
                  {Object.entries(getData.metadata.homeLocation)
                    .filter(
                      ([key]) =>
                        ![
                          "coordinates",
                          "address",
                          "setAt",
                          "updatedAt",
                        ].includes(key)
                    )
                    .map(([key, value]) => (
                      <View
                        key={key}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                        <Text className="text-gray-900 dark:text-white">
                          {String(value)}
                        </Text>
                      </View>
                    ))}
                </View>
              ) : (
                <Text className="text-gray-900 dark:text-white">
                  {String(getData.metadata.homeLocation)}
                </Text>
              )}
            </View>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={confirmLogout}
            className="bg-red-600 hover:bg-red-700 rounded-xl py-4 px-6 shadow-lg flex flex-row gap-3 items-center justify-center space-x-2"
          >
            <Ionicons name="log-out" size={32} color="white" />
            <Text className="text-white text-center font-semibold text-lg">
              {t("profile.logout") || "Logout"}
            </Text>
          </TouchableOpacity>

          {/* <Button title="Get User Data" onPress={getUser} /> */}
        </View>
        <AlertBox {...alertConfig} onClose={hideAlert} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
