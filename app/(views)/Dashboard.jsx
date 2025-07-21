import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useLanguage } from "../../src/contexts/LanguageContext";
import { useAuth } from "../../src/hooks/useAuth";

// Constants for UI and logic
const languageDisplay = {
  En: "English",
  Ta: "Tamil",
  Hi: "Hindi",
  Te: "Telugu",
  Ml: "Malayalam",
  Kn: "Kannada",
};

const cropOptions = [
  "All Crops",
  "Soybean",
  "Rice",
  "Wheat",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Potato",
  "Tomato",
  "Chili",
  "Other",
];

// Helper component for dropdowns
const CustomDropdown = ({ options, selectedValue, onSelect, placeholder }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  const getDisplayLabel = () => {
    if (typeof options[0] === "object") {
      // For sortOptions
      return (
        options.find((opt) => opt.value === selectedValue)?.label || placeholder
      );
    }
    // For cropOptions
    return selectedValue === "All Crops"
      ? t("batchesPage.filters.allCrops")
      : selectedValue;
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="flex-1 flex-row items-center justify-between bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2"
      >
        <Text
          className="text-gray-800 dark:text-white text-sm"
          numberOfLines={1}
        >
          {getDisplayLabel()}
        </Text>
        <Feather name="chevron-down" size={16} color="#a1a1aa" />
      </TouchableOpacity>
      <Modal visible={visible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setVisible(false)}
          className="bg-black/80 items-center justify-center"
        >
          <View className="bg-gray-800 border border-green-500 rounded-xl w-4/5">
            {options.map((option) => {
              const value = typeof option === "object" ? option.value : option;
              const label =
                typeof option === "object"
                  ? option.label
                  : option === "All Crops"
                    ? t("batchesPage.filters.allCrops")
                    : option;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    onSelect(value);
                    setVisible(false);
                  }}
                  className="px-4 py-3 border-b border-gray-700 last:border-b-0"
                >
                  <Text className="text-white text-center text-base">
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const BatchesScreen = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useLanguage();

  const navigation = useNavigation();
  const { isAuthenticated, accessToken } = useAuth();

  const sortOptions = useMemo(
    () => [
      { label: t("batchesPage.sortOptions.newest"), value: "desc" },
      { label: t("batchesPage.sortOptions.oldest"), value: "asc" },
    ],
    [t]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
    }
  }, [isAuthenticated, navigation]);

  const fetchBatches = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/dashboard/batches`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBatches(data.batches || []);
      setError("");
    } catch (err) {
      setError(t("batchesPage.error.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, t]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBatches();
    }
  }, [isAuthenticated, fetchBatches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBatches();
    setRefreshing(false);
  }, [fetchBatches]);

  const filteredBatches = useMemo(() => {
    return batches
      .filter(
        (batch) =>
          batch.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedCrop === "All Crops" || batch.cropType === selectedCrop)
      )
      .sort((a, b) =>
        sortOrder === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [batches, searchTerm, selectedCrop, sortOrder]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getBatchStatus = (batch) => {
    if (batch.execFailed)
      return {
        labelKey: "status.failed",
        color: "bg-red-500",
        textColor: "text-white",
      };
    if (
      batch.isModelCompleted &&
      batch.isDescCompleted &&
      batch.isAudioCompleted
    )
      return {
        labelKey: "status.completed",
        color: "bg-green-500",
        textColor: "text-white",
      };
    if (batch.isModelCompleted)
      return {
        labelKey: "status.processing",
        color: "bg-yellow-500",
        textColor: "text-black",
      };
    return {
      labelKey: "status.pending",
      color: "bg-gray-600",
      textColor: "text-white",
    };
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black pt-6">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 64 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
      >
        <View className="flex-row items-center justify-between mb-4 mt-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("batchesPage.title")}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
          >
            <Feather name="refresh-cw" size={18} color="#22c55e" />
          </TouchableOpacity>
        </View>
        {/* Filters and search */}
        <View className="bg-white dark:bg-gray-900 p-3 rounded-xl mb-6">
          <View
            className={`flex-row items-center bg-gray-100 dark:bg-gray-800 border rounded-lg px-3 transition-all duration-300 ${isFocused ? "border-green-500" : "border-gray-300 dark:border-gray-700"}`}
          >
            <Feather name="search" size={18} color="#a1a1aa" />
            <TextInput
              className="flex-1 text-gray-900 dark:text-white px-2 py-2 text-base"
              placeholder={t("batchesPage.searchPlaceholder")}
              placeholderTextColor="#71717a"
              value={searchTerm}
              onChangeText={setSearchTerm}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
          <View className="flex-row gap-2 mt-2">
            <CustomDropdown
              options={cropOptions}
              selectedValue={selectedCrop}
              onSelect={setSelectedCrop}
              placeholder={t("batchesPage.filters.cropPlaceholder")}
            />
            <CustomDropdown
              options={sortOptions}
              selectedValue={sortOrder}
              onSelect={setSortOrder}
              placeholder={t("batchesPage.filters.sortPlaceholder")}
            />
          </View>
        </View>
        {loading ? (
          <View className="flex items-center py-12">
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : error ? (
          <View className="items-center py-12 bg-white dark:bg-gray-900 rounded-lg">
            <Feather name="alert-triangle" size={32} color="#f87171" />
            <Text className="text-red-500 dark:text-red-400 text-lg mt-4">
              {error}
            </Text>
          </View>
        ) : filteredBatches.length > 0 ? (
          filteredBatches.map((batch) => {
            const status = getBatchStatus(batch);
            return (
              <Link key={batch.id} href={`/batch/${batch.id}`} asChild>
                <TouchableOpacity className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-lg active:border-green-500 active:scale-[0.98]">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text
                        className="text-lg font-bold text-gray-900 dark:text-white"
                        numberOfLines={1}
                      >
                        {batch.name}
                      </Text>
                      <Text className="text-sm text-green-600 dark:text-green-400">
                        {batch.cropType}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-3 py-1 ${status.color} shadow-md`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase ${status.textColor}`}
                      >
                        {t(`batchesPage.${status.labelKey}`)}
                      </Text>
                    </View>
                  </View>
                  <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(batch.createdAt)}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        <Text className="font-bold">{batch.imagesCount}</Text>{" "}
                        {t("batchesPage.batchCard.imagesLabel")}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {t("batchesPage.batchCard.languageLabel")}{" "}
                        <Text className="font-bold">
                          {languageDisplay[batch.preferredLanguage] || "N/A"}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            );
          })
        ) : (
          <View className="items-center py-12 bg-white dark:bg-gray-900 rounded-lg">
            <Feather name="info" size={32} color="#60a5fa" />
            <Text className="text-blue-500 dark:text-blue-300 text-lg mt-4 text-center px-4">
              {searchTerm || selectedCrop !== "All Crops"
                ? t("batchesPage.emptyState.noMatches")
                : t("batchesPage.emptyState.noBatches")}
            </Text>
            {!(searchTerm || selectedCrop !== "All Crops") && (
              <TouchableOpacity
                className="flex-row items-center bg-green-600 rounded-md px-4 py-2 mt-6"
                onPress={() => navigation.navigate("UploadBatch")}
              >
                <Feather name="upload-cloud" size={18} color="#fff" />
                <Text className="text-white ml-2 font-semibold">
                  {t("batchesPage.emptyState.uploadFirstBatchButton")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default BatchesScreen;
