import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AlertBox from "../components/AlertBox";
import Loading from "../components/Loading";
import MapSelect from "../components/MapSelect";
import { useLanguage } from "../contexts/LanguageContext";
import { useAlert } from "../hooks/useAlert";
import { useAuth } from "../hooks/useAuth";

const Upload = () => {
  const { t } = useLanguage();
  const { alertConfig, showAlert, showError, showSuccess, showInfo } =
    useAlert();
  const { accessToken } = useAuth();

  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showMapSelect, setShowMapSelect] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showError(
            t("upload.form_error_media_permission") ||
              "Permission to access media library is required!"
          );
        }
      }
    })();
  }, []);

  const checkImageGeotags = async (uri) => {
    try {
      const imageInfo = await FileSystem.getInfoAsync(uri, {
        size: true,
      });

      // Try to get EXIF data if available
      const asset = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (asset.granted) {
        // For now, we'll assume images might not have geotags
        // In a real implementation, you'd use a library like expo-media-library
        // or react-native-image-picker with EXIF data extraction
        return {
          hasGeotag: false, // Default assumption
          coordinates: null,
        };
      }

      return {
        hasGeotag: false,
        coordinates: null,
      };
    } catch (error) {
      console.error("Error checking image geotags:", error);
      return {
        hasGeotag: false,
        coordinates: null,
      };
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = [];

        for (const asset of result.assets) {
          const geotagInfo = await checkImageGeotags(asset.uri);

          newImages.push({
            id: Date.now() + Math.random(),
            uri: asset.uri,
            filename: asset.filename || `image_${Date.now()}.jpg`,
            type: asset.type || "image/jpeg",
            fileSize: asset.fileSize,
            width: asset.width,
            height: asset.height,
            hasGeotag: geotagInfo.hasGeotag,
            coordinates: geotagInfo.coordinates,
          });
        }

        setSelectedImages((prev) => [...prev, ...newImages]);

        // Check if any images lack geotags
        const imagesWithoutGeotags = newImages.filter((img) => !img.hasGeotag);
        if (imagesWithoutGeotags.length > 0) {
          showInfo(
            t("upload.warning") ||
              `${imagesWithoutGeotags.length} image(s) don't have location data. You can set a location using the map below.`
          );
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
      showError(
        t("upload.form_error_upload_failed") ||
          "Failed to pick images. Please try again."
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showError(
          t("upload.form_error_camera_permission") ||
            "Permission to access camera is required!"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const geotagInfo = await checkImageGeotags(asset.uri);

        const newImage = {
          id: Date.now(),
          uri: asset.uri,
          filename: `photo_${Date.now()}.jpg`,
          type: "image/jpeg",
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          hasGeotag: geotagInfo.hasGeotag,
          coordinates: geotagInfo.coordinates,
        };

        setSelectedImages((prev) => [...prev, newImage]);

        if (!newImage.hasGeotag) {
          showInfo(
            t("upload.warning") ||
              "Photo taken without location data. You can set a location using the map below."
          );
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      showError(
        t("upload.form_error_upload_failed") ||
          "Failed to take photo. Please try again."
      );
    }
  };

  const removeImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const compressImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }], // Resize to max width of 1920px
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      return uri; // Return original if compression fails
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      showError(
        t("upload.form_error_select_image") ||
          "Please select at least one image to upload."
      );
      return;
    }

    // Check if images without geotags have a selected location
    const imagesWithoutGeotags = selectedImages.filter((img) => !img.hasGeotag);
    if (imagesWithoutGeotags.length > 0 && !selectedCoordinates) {
      showError(
        t("upload.warning") ||
          "Some images don't have location data. Please select a location on the map or remove those images."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];

        setUploadProgress((prev) => ({
          ...prev,
          [image.id]: 0,
        }));

        // Compress image before upload
        const compressedUri = await compressImage(image.uri);

        // Create FormData
        const formData = new FormData();

        // Add image file
        formData.append("image", {
          uri: compressedUri,
          type: image.type,
          name: image.filename,
        });

        // Add coordinates (either from image geotag or selected location)
        const coordinates = image.hasGeotag
          ? image.coordinates
          : selectedCoordinates;
        if (coordinates) {
          formData.append("latitude", coordinates.latitude.toString());
          formData.append("longitude", coordinates.longitude.toString());
        }

        // Add address if available
        if (selectedAddress) {
          formData.append("address", selectedAddress);
        }

        // Upload image
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/images/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
            body: formData,
          }
        );

        if (response.ok) {
          setUploadProgress((prev) => ({
            ...prev,
            [image.id]: 100,
          }));
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to upload ${image.filename}`
          );
        }
      }

      showSuccess(
        t("upload.success").replace("{count}", selectedImages.length) ||
          `Successfully uploaded ${selectedImages.length} image(s)!`
      );

      // Clear selected images after successful upload
      setSelectedImages([]);
      setSelectedCoordinates(null);
      setSelectedAddress("");
    } catch (error) {
      console.error("Upload error:", error);
      showError(
        error.message ||
          t("upload.form_error_upload_failed") ||
          "Failed to upload images. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const imagesWithoutGeotags = selectedImages.filter((img) => !img.hasGeotag);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <View className="space-y-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("upload.title") || "Upload Images"}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              {t("upload.upload_hint") ||
                "Select images from your gallery or take photos to upload"}
            </Text>
          </View>

          {/* Image Selection Buttons */}
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={pickImages}
              disabled={isUploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 py-3 px-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons
                name="images"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-medium">
                {t("common.pick_images") || "Pick Images"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePhoto}
              disabled={isUploading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 py-3 px-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons
                name="camera"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-medium">
                {t("upload.take_photo") || "Take Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t("upload.selected_images", {
                  count: selectedImages.length,
                }) || `Selected Images (${selectedImages.length})`}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="space-x-3"
              >
                {selectedImages.map((image) => (
                  <View key={image.id} className="relative">
                    <Image
                      source={{ uri: image.uri }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>

                    {/* Geotag indicator */}
                    <View className="absolute bottom-1 left-1">
                      <Ionicons
                        name={image.hasGeotag ? "location" : "location-outline"}
                        size={12}
                        color={image.hasGeotag ? "#10b981" : "#ef4444"}
                      />
                    </View>

                    {/* Upload progress */}
                    {isUploading && uploadProgress[image.id] !== undefined && (
                      <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
                        <Text className="text-white text-xs font-medium">
                          {uploadProgress[image.id]}%
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Location Selection */}
          {imagesWithoutGeotags.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t("uploadPage.setUpdateLocation") || "Set Location for Images"}
              </Text>

              <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                <View className="flex-row items-start">
                  <Ionicons
                    name="warning"
                    size={16}
                    color="#f59e0b"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <Text className="text-yellow-800 dark:text-yellow-200 text-sm flex-1">
                    {t("upload.warning") ||
                      `${imagesWithoutGeotags.length} image(s) don't have location data. Please select a location on the map below.`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowMapSelect(!showMapSelect)}
                className="bg-gray-100 dark:bg-gray-800 py-3 px-4 rounded-lg flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="map"
                    size={20}
                    color="#6b7280"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-gray-700 dark:text-gray-300">
                    {selectedCoordinates
                      ? t("mapSelect.selectedLocation") || "Location Selected"
                      : t("mapSelect.clickToSelect") ||
                        "Select Location on Map"}
                  </Text>
                </View>
                <Ionicons
                  name={showMapSelect ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {showMapSelect && (
                <View className="mt-3">
                  <MapSelect
                    setSelectedCoordinatesProp={setSelectedCoordinates}
                    setAddressProp={setSelectedAddress}
                    selectedCoordinatesProp={selectedCoordinates}
                    addressProp={selectedAddress}
                    onAlert={showAlert}
                  />
                </View>
              )}
            </View>
          )}

          {/* Upload Button */}
          {selectedImages.length > 0 && (
            <View className="space-y-3">
              {isUploading && (
                <View className="items-center py-4">
                  <Loading />
                  <Text className="text-gray-600 dark:text-gray-400 mt-2">
                    {t("upload.submit_uploading") || "Uploading images..."}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={uploadImages}
                disabled={
                  isUploading ||
                  (imagesWithoutGeotags.length > 0 && !selectedCoordinates)
                }
                className={`py-4 px-6 rounded-lg flex-row items-center justify-center ${
                  isUploading ||
                  (imagesWithoutGeotags.length > 0 && !selectedCoordinates)
                    ? "bg-gray-400 dark:bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Ionicons
                  name={isUploading ? "cloud-upload" : "cloud-upload-outline"}
                  size={24}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-lg font-semibold">
                  {isUploading
                    ? t("upload.submit_uploading") || "Uploading..."
                    : t("upload.submit").replace(
                        "{count}",
                        selectedImages.length
                      ) || `Upload ${selectedImages.length} Image(s)`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <AlertBox {...alertConfig} />
    </SafeAreaView>
  );
};

export default Upload;
