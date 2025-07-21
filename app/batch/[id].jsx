import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useLanguage } from "../../src/contexts/LanguageContext";
import { useAuth } from "../../src/hooks/useAuth"; // Adjust path as needed

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants and Helper Components ---

const languageDisplay = {
  En: "English",
  Ta: "Tamil",
  Hi: "Hindi",
  Te: "Telugu",
  Ml: "Malayalam",
  Kn: "Kannada",
};

const getBatchStatus = (batch) => {
  if (!batch)
    return {
      labelKey: "status.loading",
      color: "bg-gray-400 dark:bg-gray-600",
      textColor: "text-white",
    };
  if (batch.hasExecutionFailed)
    return {
      labelKey: "status.failed",
      color: "bg-red-500",
      textColor: "text-white",
    };
  if (batch.isModelCompleted && batch.isDescCompleted && batch.isAudioCompleted)
    return {
      labelKey: "status.completed",
      color: "bg-green-500",
      textColor: "text-white",
    };
  if (batch.isModelCompleted)
    return {
      labelKey: "status.processing",
      color: "bg-yellow-400",
      textColor: "text-gray-800",
    };
  return {
    labelKey: "status.pending",
    color: "bg-gray-500",
    textColor: "text-white",
  };
};

const DetailRow = ({ icon, label, value }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <View className="flex-row items-center">
      <Feather name={icon} size={18} color="#9ca3af" />
      <Text className="text-gray-600 dark:text-gray-400 ml-4 text-base">
        {label}
      </Text>
    </View>
    <Text
      className="text-base font-semibold text-gray-900 dark:text-white text-right flex-1 ml-2"
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const AudioPlayer = ({ batchId, accessToken }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({
    positionMillis: 0,
    durationMillis: 1,
  });
  const { t } = useLanguage();

  const formatTime = (millis) => {
    if (!millis || !isFinite(millis)) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayback = async () => {
    if (isLoading) return;
    if (sound) {
      if (isPlaying) await sound.pauseAsync();
      else await sound.playAsync();
      return;
    }
    setIsLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: `${process.env.EXPO_PUBLIC_API_URL}/api/dashboard/audio/${batchId}`,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus({
            positionMillis: status.positionMillis,
            durationMillis: status.durationMillis || 1,
          });
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            sound?.setPositionAsync(0);
            sound?.pauseAsync();
            setIsPlaying(false);
          }
        }
      });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      Alert.alert("Error", t("batchDetailPage.error.couldNotPlayAudio"));
    } finally {
      setIsLoading(false);
    }
  };

  const onSliderValueChange = async (value) => {
    if (sound && playbackStatus.durationMillis) {
      await sound.setPositionAsync(value * playbackStatus.durationMillis);
    }
  };

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  return (
    <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-3">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handlePlayback}
          disabled={isLoading}
          className="bg-green-600 p-3 rounded-full w-12 h-12 items-center justify-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#fff"
            />
          )}
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={
              playbackStatus.durationMillis > 0
                ? playbackStatus.positionMillis / playbackStatus.durationMillis
                : 0
            }
            onSlidingComplete={onSliderValueChange}
            minimumTrackTintColor="#22c55e"
            maximumTrackTintColor="#4b5563"
            thumbTintColor="#22c55e"
          />
          <View className="flex-row justify-between px-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {formatTime(playbackStatus.positionMillis)}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {formatTime(playbackStatus.durationMillis)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// --- Main Component ---

const BatchDetailScreen = () => {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isJsonVisible, setIsJsonVisible] = useState(false);
  const { t } = useLanguage();

  const { id: batchId } = useLocalSearchParams();
  const router = useRouter();
  const { accessToken } = useAuth();

  const fetchBatchDetails = useCallback(
    async (silent = false) => {
      if (!accessToken || !batchId) return;
      if (!silent) setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/dashboard/batch/${batchId}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok)
          throw new Error(t("batchDetailPage.error.failedToFetch"));
        const data = await response.json();
        setBatch(data.batch);
      } catch (err) {
        if (!silent) setError(err.message || "An error occurred.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [accessToken, batchId, t]
  );

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]);

  useEffect(() => {
    let refreshInterval;
    if (
      batch &&
      !batch.hasExecutionFailed &&
      (!batch.isModelCompleted ||
        !batch.isDescCompleted ||
        !batch.isAudioCompleted)
    ) {
      refreshInterval = setInterval(() => {
        fetchBatchDetails(true);
      }, 30000);
    }
    return () => clearInterval(refreshInterval);
  }, [batch, fetchBatchDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBatchDetails().finally(() => setRefreshing(false));
  }, [fetchBatchDetails]);

  const toggleJsonView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsJsonVisible(!isJsonVisible);
  };

  const handleGeneratePdf = () => {
    Alert.alert(
      t("batchDetailPage.pdfAlert.title"),
      t("batchDetailPage.pdfAlert.message"),
      [{ text: "OK" }]
    );
  };

  const englishDescription = batch?.descriptions?.find(
    (desc) => desc.language === "En"
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center p-4">
        <Feather name="alert-triangle" size={32} color="#ef4444" />
        <Text className="text-red-500 text-lg mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={fetchBatchDetails}
          className="mt-6 bg-green-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">
            {t("batchDetailPage.tryAgain")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!batch) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center p-4">
        <Feather name="info" size={32} color="#3b82f6" />
        <Text className="text-blue-500 text-lg mt-4">
          {t("batchDetailPage.batchNotFound")}
        </Text>
      </View>
    );
  }

  const status = getBatchStatus(batch);

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 64 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
      >
        {/* Custom Header */}
        <View className="p-4 pt-16 bg-white dark:bg-gray-900 shadow-md">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Feather
                name="arrow-left"
                size={24}
                className="text-gray-800 dark:text-white"
                color={"#4b5563"}
              />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800 dark:text-white">
              {t("batchDetailPage.title")}
            </Text>
            <View className="w-10" />
          </View>
          <View className="pt-4">
            <Text
              className="text-3xl font-bold text-gray-900 dark:text-white"
              numberOfLines={2}
            >
              {batch.name}
            </Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-lg text-green-600 dark:text-green-400 font-semibold">
                {batch.cropType}
              </Text>
              <View className={`rounded-full px-3 py-1 ${status.color}`}>
                <Text
                  className={`text-xs font-bold uppercase ${status.textColor}`}
                >
                  {t(`batchDetailPage.${status.labelKey}`)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Body */}
        <View className="p-4 space-y-6 flex gap-3">
          {/* Batch Info */}
          <View className="bg-white dark:bg-gray-900 rounded-xl p-4">
            <DetailRow
              icon="hash"
              label={t("batchDetailPage.batchInfo.batchId")}
              value={batch.id}
            />
            <DetailRow
              icon="image"
              label={t("batchDetailPage.batchInfo.imageCount")}
              value={batch.imagesCount}
            />
            <DetailRow
              icon="globe"
              label={t("batchDetailPage.batchInfo.language")}
              value={languageDisplay[batch.preferredLanguage] || "N/A"}
            />
            <DetailRow
              icon="calendar"
              label={t("batchDetailPage.batchInfo.createdAt")}
              value={new Date(batch.createdAt).toLocaleString()}
            />
          </View>

          {/* Descriptions */}
          <View className="bg-white dark:bg-gray-900 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Feather
                  name="file-text"
                  size={20}
                  className="text-green-600 dark:text-green-400"
                  color={"#22c55e"}
                />
                <Text className="text-xl font-bold text-gray-900 dark:text-white ml-3">
                  {t("batchDetailPage.analysisTitle")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={toggleJsonView}
                className="bg-blue-200 dark:bg-blue-700 px-3 py-2 rounded-lg flex-row items-center"
              >
                <Feather
                  name="download"
                  size={16}
                  className="text-gray-600 dark:text-gray-300"
                  color={"#ffffff"}
                />
                <Text className="text-gray-600 dark:text-gray-300 ml-2 font-semibold">
                  {t("batchDetailPage.pdfButton")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* {isJsonVisible && englishDescription && (
              <View className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <Text className="text-gray-800 dark:text-gray-200 font-mono text-xs">
                  {JSON.stringify(englishDescription, null, 2)}
                </Text>
              </View>
            )} */}

            {batch.descriptions && batch.descriptions.length > 0 ? (
              batch.descriptions.map((desc, index) => (
                <View key={desc.id || index} className="mb-4 last:mb-0">
                  <View className="flex-row items-center mb-2 flex justify-between">
                    <Text className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {t("batchDetailPage.summaryLabel")}
                    </Text>
                    <Text className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {languageDisplay[desc.language] || desc.language}
                    </Text>
                  </View>
                  <Text className="text-gray-700 bg-gray-300 leading-6 dark:text-white dark:bg-gray-700 mb-2 p-2 rounded-lg">
                    {desc.shortDescription}
                  </Text>
                  <View className="flex-row items-center mb-2 flex justify-between">
                    <Text className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {t("batchDetailPage.briefLabel")}
                    </Text>
                    <Text className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {languageDisplay[desc.language] || desc.language}
                    </Text>
                  </View>
                  <Text className="text-gray-700 dark:text-gray-300 leading-6">
                    {desc.longDescription}
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <ActivityIndicator color="#22c55e" />
                <Text className="text-gray-500 dark:text-gray-400 mt-4">
                  {t("batchDetailPage.generatingAnalysis")}
                </Text>
              </View>
            )}
          </View>

          {/* Audio Files */}
          <View className="bg-white dark:bg-gray-900 rounded-xl p-4">
            <View className="flex-row items-center mb-4">
              <Feather
                name="volume-2"
                size={20}
                className="text-green-600 dark:text-green-400"
                color={"#22c55e"}
              />
              <Text className="text-xl font-bold text-gray-900 dark:text-white ml-3">
                {t("batchDetailPage.audioAnalysisTitle")}
              </Text>
            </View>
            {batch.audioURL ? (
              <AudioPlayer batchId={batch.id} accessToken={accessToken} />
            ) : (
              <View className="items-center py-8">
                <ActivityIndicator color="#22c55e" />
                <Text className="text-gray-500 dark:text-gray-400 mt-4">
                  {t("batchDetailPage.generatingAudio")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BatchDetailScreen;
