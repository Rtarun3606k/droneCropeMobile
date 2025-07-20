import { useCallback, useState } from "react";

const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "info",
    title: "Alert",
    message: "",
    showCancel: true,
    okText: "OK",
    cancelText: "Cancel",
    onOk: () => {},
    onCancel: () => {},
  });

  const showAlert = useCallback((config) => {
    setAlertConfig({
      visible: true,
      type: config.type || "info",
      title: config.title || "Alert",
      message: config.message || "",
      showCancel: config.showCancel !== false,
      okText: config.okText || "OK",
      cancelText: config.cancelText || "Cancel",
      onOk: config.onOk || (() => {}),
      onCancel: config.onCancel || (() => {}),
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods for different alert types
  const showInfo = useCallback(
    (title, message, options = {}) => {
      showAlert({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [showAlert]
  );

  const showError = useCallback(
    (title, message, options = {}) => {
      showAlert({
        type: "error",
        title,
        message,
        ...options,
      });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (title, message, options = {}) => {
      showAlert({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [showAlert]
  );

  const showSuccess = useCallback(
    (title, message, options = {}) => {
      showAlert({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (title, message, onConfirm, options = {}) => {
      showAlert({
        type: "warning",
        title,
        message,
        showCancel: true,
        onOk: onConfirm,
        ...options,
      });
    },
    [showAlert]
  );

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showInfo,
    showError,
    showWarning,
    showSuccess,
    showConfirm,
  };
};

export default useAlert;
