import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import SetAsHome from "./SetAsHome";

const { width: screenWidth } = Dimensions.get("window");

const MapSelect = ({
  setSelectedCoordinatesProp,
  setAddressProp,
  selectedCoordinatesProp,
  addressProp,
  onAlert,
  skipHomeLoad = false,
}) => {
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const mapRef = useRef(null);

  const [existingHome, setExistingHome] = useState(null);
  const [hasLoadedHome, setHasLoadedHome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 23.512, // Default to India center
    longitude: 80.329,
    latitudeDelta: 15,
    longitudeDelta: 15,
  });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const loadedRef = useRef(false);

  // Load existing home location
  useEffect(() => {
    if (skipHomeLoad) {
      setHasLoadedHome(true);
      setIsLoading(false);
      return;
    }

    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadExistingHome = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/user/set-home-location`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.coordinates) {
            setExistingHome(data.coordinates);

            // Update map region to show existing home
            setMapRegion({
              latitude: data.coordinates.lat,
              longitude: data.coordinates.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });

            // Show alert about existing home location
            if (onAlert && !hasLoadedHome) {
              onAlert(
                `Found existing home location: ${
                  data.coordinates.address ||
                  `${data.coordinates.lat.toFixed(6)}, ${data.coordinates.lng.toFixed(6)}`
                }`,
                "info"
              );
            }

            // If no coordinates are set yet, use existing home as default
            if (!selectedCoordinatesProp) {
              setSelectedCoordinatesProp({
                latitude: data.coordinates.lat,
                longitude: data.coordinates.lng,
              });
              setAddressProp(
                data.coordinates.address ||
                  `${data.coordinates.lat.toFixed(6)}, ${data.coordinates.lng.toFixed(6)}`
              );
              setSelectedMarker({
                latitude: data.coordinates.lat,
                longitude: data.coordinates.lng,
              });
            }
          } else {
            // No existing home location
            if (onAlert && !hasLoadedHome) {
              onAlert(
                "No home location set. Click on the map to select a location.",
                "info"
              );
            }
          }
        }
      } catch (error) {
        console.error("Error loading existing home location:", error);
        if (onAlert && !hasLoadedHome) {
          onAlert("Error loading home location", "error");
        }
      } finally {
        setHasLoadedHome(true);
        setIsLoading(false);
      }
    };

    loadExistingHome();
  }, [skipHomeLoad, accessToken]);

  // Fetch address from coordinates using OpenStreetMap Nominatim
  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          // ✅ ADD THIS HEADERS OBJECT
          headers: {
            "User-Agent": "YourAppName/1.0 (yourname@example.com)", // Customize for your app
          },
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        // Log the error text from the server to see what went wrong
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Body: ${errorText}`
        );
      }

      const data = await response.json();

      if (data && data.display_name) {
        setAddressProp(data.display_name);
      } else {
        // Handle cases where geocoding finds no result
        setAddressProp("No address found for these coordinates.");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressProp("Could not fetch address."); // Provide a user-friendly error
    }
  };
  // Handle map press to select coordinates
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const coordinateData = {
      latitude,
      longitude,
    };

    setSelectedCoordinatesProp(coordinateData);
    setSelectedMarker({ latitude, longitude });
    fetchAddressFromCoords(latitude, longitude);
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        onAlert("Location permission denied", "error");
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Update map region
      setMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Set selected coordinates
      setSelectedCoordinatesProp(coords);
      setSelectedMarker(coords);

      // Fetch address
      await fetchAddressFromCoords(coords.latitude, coords.longitude);

      onAlert("Current location set successfully", "success");
    } catch (error) {
      console.error("Error getting current location:", error);
      onAlert("Failed to get current location", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Center map on existing home
  const centerOnHome = () => {
    if (existingHome && mapRef.current) {
      const region = {
        latitude: existingHome.lat,
        longitude: existingHome.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      mapRef.current.animateToRegion(region, 1000);
      setMapRegion(region);
    }
  };

  if (isLoading) {
    return (
      <View className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 dark:text-gray-400 mt-2">
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-3">
      {/* Map Container */}
      <View className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: 300 }}
          region={mapRegion}
          onPress={handleMapPress}
          onRegionChangeComplete={setMapRegion}
          provider={PROVIDER_DEFAULT}
          mapType="standard"
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* Selected location marker */}
          {selectedMarker && (
            <Marker
              coordinate={selectedMarker}
              title="Selected Location"
              description={addressProp || "Selected coordinates"}
              pinColor="#ef4444"
            />
          )}

          {/* Existing home marker */}
          {existingHome && (
            <Marker
              coordinate={{
                latitude: existingHome.lat,
                longitude: existingHome.lng,
              }}
              title="Home Location"
              description={existingHome.address || "Home"}
              pinColor="#10b981"
            />
          )}
        </MapView>

        {/* Map Controls Overlay */}
        <View className="absolute top-2 right-2 space-y-2">
          <TouchableOpacity
            onPress={getCurrentLocation}
            className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
          >
            <Ionicons name="locate" size={24} color="#3b82f6" />
          </TouchableOpacity>

          {existingHome && (
            <TouchableOpacity
              onPress={centerOnHome}
              className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
            >
              <Ionicons name="home" size={24} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={getCurrentLocation}
          disabled={isLoading}
          className="flex-1 bg-blue-600 rounded-lg py-3 px-4 flex-row items-center justify-center"
        >
          <Ionicons
            name="location"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-medium">Current Location</Text>
        </TouchableOpacity>

        {existingHome && (
          <TouchableOpacity
            onPress={centerOnHome}
            className="flex-1 bg-green-600 rounded-lg py-3 px-4 flex-row items-center justify-center"
          >
            <Ionicons
              name="home"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-medium">Go to Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Location Info */}
      <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        {selectedCoordinatesProp ? (
          <View>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t("mapSelect.selectedLocation") || "Selected Location"}
            </Text>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">
                  <Text className="font-medium">Latitude:</Text>{" "}
                  {selectedCoordinatesProp.latitude?.toFixed(6)}°
                </Text>
                <Text className="text-gray-600 dark:text-gray-400">
                  <Text className="font-medium">Longitude:</Text>{" "}
                  {selectedCoordinatesProp.longitude?.toFixed(6)}°
                </Text>
              </View>

              {addressProp && (
                <View>
                  <Text className="text-gray-600 dark:text-gray-400">
                    <Text className="font-medium">Address:</Text>
                  </Text>
                  <Text className="text-gray-800 dark:text-gray-200 text-sm mt-1">
                    {addressProp}
                  </Text>
                </View>
              )}
            </View>

            {/* Set as Home Component */}
            <View className="mt-4">
              <SetAsHome
                setSelectedCoordinatesProp={setSelectedCoordinatesProp}
                setAddressProp={setAddressProp}
                selectedCoordinatesProp={selectedCoordinatesProp}
                addressProp={addressProp}
                onAlert={onAlert}
              />
            </View>
          </View>
        ) : (
          <View className="items-center py-4">
            <Ionicons name="map-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
              {t("mapSelect.clickToSelect") ||
                "Tap on the map to select a location"}
            </Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <View className="flex-row items-start">
          <Ionicons
            name="information-circle"
            size={16}
            color="#3b82f6"
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <View className="flex-1">
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              <Text className="font-medium">Instructions:</Text>
            </Text>
            <Text className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              • Tap anywhere on the map to select coordinates{"\n"}• Use
              "Current Location" to get your GPS position{"\n"}• Red pin shows
              selected location, green pin shows home location{"\n"}• Use "Set
              as Home" to save location as default
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MapSelect;
