import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// You will need to add a zipping library to your project
// Run: npm install react-native-zip-archive
// Then create a development build: npx expo run:android or npx expo run:ios
import * as FileSystem from "expo-file-system";
import { zip } from "react-native-zip-archive";

import AlertBox from "../../src/components/AlertBox";
import HomeLocationInfo from "../../src/components/HomeLocationInfo";
import Loading from "../../src/components/Loading";
import MapSelect from "../../src/components/MapSelect";
import { useLanguage } from "../../src/contexts/LanguageContext";
import useAlert from "../../src/hooks/useAlert";
import { useAuth } from "../../src/hooks/useAuth";
import GeotagChecker from "../../src/utils/GeotagChecker";

const { width: screenWidth } = Dimensions.get("window");

// List of crops for dropdown
const cropOptions = [
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

const Upload = () => {
  const [batchName, setBatchName] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [formError, setFormError] = useState("");
  const [geotagResults, setGeotagResults] = useState(null);
  const [isCheckingGeotags, setIsCheckingGeotags] = useState(false);
  const [geotagProgress, setGeotagProgress] = useState(0);
  const [checkingFileName, setCheckingFileName] = useState("");
  const [selectedCoordinatesProp, setSelectedCoordinatesProp] = useState(null);
  const [addressProp, setAddressProp] = useState("");
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [homeLocationRefresh, setHomeLocationRefresh] = useState(0);
  const [showCropPicker, setShowCropPicker] = useState(false);

  const { t } = useLanguage();
  const { isAuthenticated, userData, accessToken } = useAuth();
  const {
    alertConfig,
    hideAlert,
    showInfo,
    showError,
    showSuccess,
    showWarning,
  } = useAlert();

  // Check geotags for files
  const checkGeotagsForFiles = async (filesToCheck) => {
    if (filesToCheck.length === 0) return;

    setIsCheckingGeotags(true);
    setGeotagProgress(0);
    setCheckingFileName("");

    try {
      const checker = new GeotagChecker();

      const onProgress = (progress, filename) => {
        setGeotagProgress(progress);
        setCheckingFileName(filename);
      };

      const results = await checker.checkGeotagsInFiles(
        filesToCheck,
        onProgress
      );
      setGeotagResults(results);

      if (results.success) {
        console.log("Geotag check completed:", results.summary);
      } else {
        console.warn("Geotag check failed:", results.message);
      }
    } catch (error) {
      console.error("Error checking geotags:", error);
    } finally {
      setIsCheckingGeotags(false);
      setGeotagProgress(0);
      setCheckingFileName("");
    }
  };

  // Handle image selection
  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
          size: asset.fileSize,
        }));

        const updatedFiles = [...selectedFiles, ...newFiles];
        setSelectedFiles(updatedFiles);

        // Create preview images
        const newPreviewImages = newFiles.map((file) => ({
          file,
          preview: file.uri,
        }));

        setPreviewImages((prev) => [...prev, ...newPreviewImages]);
        setFormError("");

        // Reset geotag results
        setGeotagResults(null);

        // Check geotags
        setTimeout(() => {
          checkGeotagsForFiles(updatedFiles);
        }, 100);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      showError("Error", "Failed to select images. Please try again.");
    }
  };

  // Remove a selected file
  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);

    setGeotagResults(null);
    if (updatedFiles.length > 0) {
      setTimeout(() => {
        checkGeotagsForFiles(updatedFiles);
      }, 100);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Form validation
    if (!batchName.trim()) {
      setFormError("Please enter a batch name");
      return;
    }

    if (selectedFiles.length === 0) {
      setFormError("Please select at least one image");
      return;
    }

    // Warning for large batches
    if (selectedFiles.length > 100) {
      showWarning(
        "Large Batch Warning",
        `You are uploading ${selectedFiles.length} images. This may take a while. Continue?`,
        {
          onOk: () => processUpload(),
          onCancel: () => console.log("Upload cancelled"),
        }
      );
      return;
    }

    await processUpload();
  };

  const processUpload = async () => {
    setIsUploading(true);

    try {
      // ** FIX: Add a check to ensure the native module is linked **
      // This error occurs if the app is running in Expo Go or if the native module
      // is not correctly linked in a development build.
      if (typeof zip !== "function") {
        throw new Error(
          "Zipping library not found. Please ensure 'react-native-zip-archive' is installed and you are running a development build (not Expo Go)."
        );
      }

      // Step 1 - Create a ZIP file from the selected images
      const imageUris = selectedFiles.map((file) =>
        file.uri.replace("file://", "")
      );
      const targetZipPath = `${FileSystem.cacheDirectory}images.zip`;

      const zipPath = await zip(imageUris, targetZipPath);
      console.log(`ZIP file created at: ${zipPath}`);

      // Step 2 - Create FormData and append the single ZIP file
      const formData = new FormData();
      formData.append("batchName", batchName);
      formData.append("cropType", selectedCrop);
      formData.append("imagesCount", selectedFiles.length.toString());
      formData.append(
        "metadata",
        JSON.stringify({
          selectedCoordinates: selectedCoordinatesProp,
          address: addressProp,
        })
      );

      formData.append("imagesZip", {
        uri: `file://${zipPath}`,
        name: "images.zip",
        type: "application/zip",
      });

      // Step 3 - Send the request
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/dashboard/upload-batch`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Upload failed response:", errorData);
        throw new Error(errorData?.message || "Upload failed");
      }

      const result = await response.json();
      console.log("Upload response:", result);

      showSuccess("Success", "Images uploaded successfully!");

      // Reset form
      setBatchName("");
      setSelectedCrop("Soybean");
      setSelectedFiles([]);
      setPreviewImages([]);
      setFormError("");
      setGeotagResults(null);
    } catch (error) {
      console.error("Upload failed:", error);
      showError("Upload Failed", `Failed to upload images. ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            📤 {t("upload.title") || "Upload Images"}
          </Text>

          {/* Geotag Notice */}
          <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
              <Text className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                {t("upload.geotagNoticeTitle") || "Geotagged Images Required"}
              </Text>
            </View>
            <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
              {t("upload.geotagNoticeDesc") ||
                "For accurate analysis, please ensure your images contain GPS location data."}
            </Text>
            <TouchableOpacity
              onPress={() => {
                showInfo(
                  "How to Enable Geotagging",
                  "iPhone: Settings > Privacy & Security > Location Services > Camera > While Using App\n\nAndroid: Camera settings > Location tags > On",
                  { showCancel: false }
                );
              }}
              className="mt-2"
            >
              <Text className="text-blue-600 dark:text-blue-400 text-sm underline">
                {t("upload.learnMore") || "Learn more"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Error */}
        {formError ? (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <Text className="text-red-800 dark:text-red-200">{formError}</Text>
          </View>
        ) : null}

        {/* Batch Name Field */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t("upload.batchNameLabel") || "Batch Name"}
          </Text>
          <TextInput
            value={batchName}
            onChangeText={setBatchName}
            placeholder={t("upload.batchNamePlaceholder") || "Enter batch name"}
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3"
          />
        </View>

        {/* Crop Selection */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t("upload.cropTypeLabel") || "Crop Type"}
          </Text>
          <TouchableOpacity
            onPress={() => setShowCropPicker(true)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-gray-900 dark:text-white">
              {selectedCrop}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Location Section */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("upload.locationSettings") || "Location Settings"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationSection(!showLocationSection)}
            >
              <Text className="text-green-600 dark:text-green-400 underline">
                {showLocationSection ? "Hide Map" : "Set Location"}
              </Text>
            </TouchableOpacity>
          </View>

          <HomeLocationInfo
            onAlert={showInfo}
            refreshTrigger={homeLocationRefresh}
            onUseAsDefault={(location) => {
              setSelectedCoordinatesProp({
                latitude: location.lat,
                longitude: location.lng,
              });
              setAddressProp(location.address);
            }}
          />

          {/* Current location display */}
          {selectedCoordinatesProp && addressProp && (
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="location" size={16} color="#3b82f6" />
                <Text className="text-blue-800 dark:text-blue-200 font-medium ml-2">
                  Location for Upload
                </Text>
              </View>
              <Text className="text-blue-700 dark:text-blue-300 text-sm">
                {addressProp}
              </Text>
            </View>
          )}

          {/* Map section */}
          {showLocationSection && (
            <View className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 mt-4">
              <MapSelect
                setSelectedCoordinatesProp={setSelectedCoordinatesProp}
                setAddressProp={setAddressProp}
                selectedCoordinatesProp={selectedCoordinatesProp}
                addressProp={addressProp}
                onAlert={(message, type) => {
                  if (type === "success") {
                    showSuccess("Success", message);
                    setTimeout(() => {
                      setHomeLocationRefresh((prev) => prev + 1);
                    }, 1000);
                  } else if (type === "error") {
                    showError("Error", message);
                  }
                }}
              />
            </View>
          )}
        </View>

        {/* Image Upload Section */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t("upload.uploadLabel") || "Upload Images"}
          </Text>

          <TouchableOpacity
            onPress={handleImagePicker}
            className="border-2 border-dashed border-green-500 rounded-lg p-8 items-center"
          >
            <Ionicons name="cloud-upload-outline" size={48} color="#10b981" />
            <Text className="text-gray-900 dark:text-white mt-2 text-center">
              {t("upload.uploadHint") || "Tap to select images"}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
              {t("upload.uploadFormats") || "JPG, PNG, TIFF supported"}
            </Text>
            {selectedFiles.length > 0 && (
              <Text className="text-green-600 font-medium mt-2">
                {selectedFiles.length} images selected
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Preview Images */}
        {previewImages.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Selected Images ({previewImages.length})
            </Text>
            <View className="flex-row flex-wrap">
              {previewImages.slice(0, 6).map((image, index) => (
                <View key={index} className="w-1/3 p-1">
                  <View className="relative">
                    <Image
                      source={{ uri: image.preview }}
                      className="w-full aspect-square rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {previewImages.length > 6 && (
                <View className="w-1/3 p-1">
                  <View className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-600 items-center justify-center">
                    <Text className="text-gray-600 dark:text-gray-300 text-center font-medium">
                      +{previewImages.length - 6} more
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Geotag Analysis Progress */}
        {isCheckingGeotags && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Checking Geotags...
            </Text>
            <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <View
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${geotagProgress}%` }}
              />
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {checkingFileName && `Processing: ${checkingFileName}`}
            </Text>
          </View>
        )}

        {/* Geotag Warning */}
        {selectedFiles.length > 0 &&
          geotagResults &&
          !isCheckingGeotags &&
          geotagResults.success &&
          geotagResults.summary.geotaggedCount <
            geotagResults.summary.successfulChecks && (
            <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <Text className="text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ Some images don't have location data. Please set a location
                below.
              </Text>
            </View>
          )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isUploading || selectedFiles.length === 0}
          className={`rounded-xl py-4 px-6 mb-36 items-center ${
            isUploading || selectedFiles.length === 0
              ? "bg-gray-300 dark:bg-gray-600"
              : "bg-green-600"
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            {isUploading ? "Uploading..." : "Upload Images"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Crop Picker Modal */}
      {showCropPicker && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mx-4 w-full max-w-sm">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Crop Type
            </Text>
            <ScrollView className="max-h-60">
              {cropOptions.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  onPress={() => {
                    setSelectedCrop(crop);
                    setShowCropPicker(false);
                  }}
                  className="py-3 border-b border-gray-200 dark:border-gray-600"
                >
                  <Text className="text-gray-900 dark:text-white">{crop}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowCropPicker(false)}
              className="mt-4 bg-gray-500 rounded-lg py-2 px-4"
            >
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Loading Component */}
      <Loading visible={isUploading} message="Uploading images..." />

      {/* Alert Component */}
      <AlertBox {...alertConfig} onClose={hideAlert} />
    </SafeAreaView>
  );
};

export default Upload;
