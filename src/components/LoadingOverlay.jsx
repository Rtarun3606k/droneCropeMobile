import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const LoadingOverlay = ({
  visible = false,
  message = "Loading...",
  transparent = true,
  cancelable = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  return (
    <Modal
      transparent={transparent}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        if (cancelable) {
          // Handle back button on Android
        }
      }}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.7)"
              : "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
            },
          ]}
        >
          <ActivityIndicator
            size="large"
            color="#16a34a"
            style={styles.spinner}
          />
          <Text
            style={[styles.message, { color: isDark ? "#f3f4f6" : "#374151" }]}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    minWidth: 120,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default LoadingOverlay;
