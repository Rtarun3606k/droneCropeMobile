import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const AlertBox = ({
  visible = false,
  type = "info", // 'info', 'error', 'warning', 'success'
  title = "Alert",
  message = "",
  showCancel = true,
  okText = "OK",
  cancelText = "Cancel",
  onOk = () => {},
  onCancel = () => {},
  onClose = () => {},
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Get alert configuration based on type
  const getAlertConfig = () => {
    switch (type) {
      case "error":
        return {
          icon: "close-circle",
          iconColor: "#ef4444",
          borderColor: "#fecaca",
          backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
          titleColor: "#dc2626",
        };
      case "warning":
        return {
          icon: "warning",
          iconColor: "#f59e0b",
          borderColor: "#fed7aa",
          backgroundColor: isDark ? "#78350f" : "#fffbeb",
          titleColor: "#d97706",
        };
      case "success":
        return {
          icon: "checkmark-circle",
          iconColor: "#10b981",
          borderColor: "#bbf7d0",
          backgroundColor: isDark ? "#064e3b" : "#f0fdf4",
          titleColor: "#059669",
        };
      default: // info
        return {
          icon: "information-circle",
          iconColor: "#3b82f6",
          borderColor: "#bfdbfe",
          backgroundColor: isDark ? "#1e3a8a" : "#eff6ff",
          titleColor: "#2563eb",
        };
    }
  };

  const config = getAlertConfig();

  const handleOk = () => {
    onOk();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleCancel}
    >
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 justify-center items-center px-6"
      >
        {/* Background Overlay */}
        <View
          className={`absolute inset-0 ${isDark ? "bg-black/70" : "bg-black/50"}`}
        />

        {/* Alert Container */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            maxWidth: screenWidth - 48,
            minWidth: screenWidth * 0.7,
          }}
          className={`${
            isDark ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-2xl border ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Header with Icon and Title */}
          <View
            className="px-6 py-4 rounded-t-2xl border-b"
            style={{
              backgroundColor: config.backgroundColor,
              borderBottomColor: config.borderColor,
              borderBottomWidth: 1,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={config.icon}
                size={28}
                color={config.iconColor}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{ color: config.titleColor }}
                className="text-lg font-bold flex-1"
              >
                {title}
              </Text>
            </View>
          </View>

          {/* Message Content */}
          <View className="px-6 py-6">
            <Text
              className={`text-base leading-6 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-6">
            <View className={`flex-row ${showCancel ? "space-x-3" : ""}`}>
              {showCancel && (
                <TouchableOpacity
                  onPress={handleCancel}
                  className={`flex-1 py-3 px-4 rounded-xl border ${
                    isDark
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleOk}
                className={`${showCancel ? "flex-1" : "w-full"} py-3 px-4 rounded-xl`}
                style={{ backgroundColor: config.iconColor }}
              >
                <Text className="text-center font-semibold text-white">
                  {okText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AlertBox;
