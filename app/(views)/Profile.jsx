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
  const { logout, isAuthenticated, userData, isLoading, accessToken } =
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

  const getUser = useCallback(async () => {
    try {
      if (!accessToken) {
        showInfo(
          t("alerts.authRequiredTitle"),
          t("alerts.authRequiredMessage"),
          { showCancel: false, okText: t("common.ok") }
        );
        return null;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/get-user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGetData(data.user || data);
      showSuccess(t("alerts.successTitle"), t("alerts.dataLoadedSuccess"), {
        showCancel: false,
        okText: t("common.great"),
      });
      return data.user || data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      showError(t("alerts.errorTitle"), t("alerts.fetchError"), {
        showCancel: true,
        okText: t("common.retry"),
        cancelText: t("common.cancel"),
        onOk: () => getUser(),
      });
      return null;
    }
  }, [accessToken, t, showInfo, showSuccess, showError]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && accessToken && !isLoading) {
        setIsLoadingData(true);
        try {
          await getUser();
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    fetchUserData();
  }, [isAuthenticated, accessToken, isLoading, getUser]);

  const handleLogout = async () => {
    try {
      await logout();
      showWarning(t("profile.logoutSuccess"), t("profile.logoutMessage"), {
        showCancel: false,
        okText: t("common.ok"),
      });
    } catch (error) {
      showError(t("profile.logoutError"), t("profile.logoutErrorMessage"), {
        showCancel: false,
        okText: t("common.ok"),
      });
    }
  };

  const confirmLogout = () => {
    Alert.alert(t("profile.confirmLogout"), t("profile.confirmLogoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        onPress: handleLogout,
        style: "destructive",
      },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    await getUser();
    setRefresh(false);
  }, [getUser]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {(isLoading || isLoadingData) && (
        <Loading visible={true} message={t("loading.userData")} />
      )}
      <ScrollView
        className="flex-1 mb-20"
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor={"#10b981"}
          />
        }
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <View className="flex items-center justify-center flex-row space-x-4 mb-4 gap-4">
              <Image
                source={
                  userData?.image ||
                  "https://placehold.co/60x60/22c55e/FFFFFF?text=P"
                }
                alt="image"
                style={{ width: 48, height: 48, borderRadius: 24 }}
                contentFit="cover"
              />
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                {t("profile.title")}
              </Text>
            </View>

            <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
              <Text className="text-green-800 dark:text-green-200 font-medium text-center">
                ✅ {t("profile.accountActive")}
              </Text>
              <Text className="text-green-600 dark:text-green-300 text-sm text-center mt-1">
                {t("profile.loggedInAs")} {userData?.email || "user"}
              </Text>
            </View>

            {userData && (
              <View className="space-y-3">
                <View className="border-b border-gray-200 dark:border-gray-600 pb-3">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {t("profile.userId")}
                  </Text>
                  <Text className="text-lg font-medium text-gray-900 dark:text-white">
                    {userData.mobileId || "N/A"}
                  </Text>
                </View>
                <View className="border-b border-gray-200 dark:border-gray-600 pb-3">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {t("profile.email")}
                  </Text>
                  <Text className="text-lg font-medium text-gray-900 dark:text-white">
                    {userData.email || "N/A"}
                  </Text>
                </View>
                {userData.name && (
                  <View className="pb-3">
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {t("profile.name")}
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
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name="location"
                  size={24}
                  color="#16a34a"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("profile.defaultLocation")}
                </Text>
              </View>
              {typeof getData.metadata.homeLocation === "object" ? (
                <View className="space-y-3">
                  {getData.metadata.homeLocation.coordinates && (
                    <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("profile.coordinates")}
                      </Text>
                      <Text className="text-gray-900 dark:text-white font-mono text-sm">
                        {getData.metadata.homeLocation.coordinates.latitude?.toFixed(
                          6
                        )}
                        ,{" "}
                        {getData.metadata.homeLocation.coordinates.longitude?.toFixed(
                          6
                        )}
                      </Text>
                    </View>
                  )}
                  {getData.metadata.homeLocation.address && (
                    <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("profile.address")}
                      </Text>
                      <Text className="text-gray-900 dark:text-white leading-5">
                        {String(getData.metadata.homeLocation.address)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row space-x-3">
                    {getData.metadata.homeLocation.setAt && (
                      <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <Text className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          {t("profile.setAt")}
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
                          {t("profile.updatedAt")}
                        </Text>
                        <Text className="text-gray-900 dark:text-white text-xs">
                          {new Date(
                            getData.metadata.homeLocation.updatedAt
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
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
            className="bg-red-600 active:bg-red-700 rounded-xl py-4 px-6 shadow-lg flex-row gap-3 items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text className="text-white text-center font-semibold text-lg">
              {t("profile.logout")}
            </Text>
          </TouchableOpacity>
        </View>
        <AlertBox {...alertConfig} onClose={hideAlert} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
