import { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, FlashMode, CameraType, useCameraPermissions } from "expo-camera";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";

import { BottomActions } from "@/src/components/BottomActions";
import { CaptureButton } from "@/src/components/CaptureButton";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import {
  LARGE_FILE_THRESHOLD,
  getFileSize,
  normalizeAndCompressImage,
} from "@/src/utils/image";

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const available =
          typeof CameraView.isAvailableAsync === "function"
            ? await CameraView.isAvailableAsync()
            : true;
        if (isMounted) {
          setCameraAvailable(available);
        }
      } catch {
        if (isMounted) {
          setCameraAvailable(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetryPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } finally {
      setIsRequestingPermission(false);
    }
  }, [requestPermission]);

  useEffect(() => {
    if (!permission) {
      void handleRetryPermission();
    }
  }, [handleRetryPermission, permission]);

  useFocusEffect(
    useCallback(() => {
      setFlashMode(FlashMode.off);
      setIsCameraReady(false);
    }, [])
  );

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      Alert.alert(
        "Không thể mở cài đặt",
        "Vui lòng mở phần Cài đặt hệ thống và cấp quyền camera cho ứng dụng."
      );
    });
  }, []);

  const handleToggleFlash = useCallback(() => {
    setFlashMode((current: FlashMode) =>
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  }, []);

  const handleSwitchCamera = useCallback(() => {
    setCameraType((current: CameraType) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: true,
        skipProcessing: true,
      });

      const originalSize = await getFileSize(photo.uri);

      if (originalSize > LARGE_FILE_THRESHOLD) {
        Alert.alert(
          "Ảnh lớn",
          "Ảnh vượt quá 10MB. Ứng dụng sẽ nén ảnh để tải lên nhanh hơn."
        );
      }

      const processed = await normalizeAndCompressImage(photo.uri);
      const previewParams = {
        uri: processed.uri,
        width: String(processed.width),
        height: String(processed.height),
        size: String(processed.size),
        originalSize: String(originalSize),
      };

      router.push({ pathname: "/preview", params: previewParams });
    } catch {
      Alert.alert("Không thể chụp ảnh", "Vui lòng thử lại.");
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, router]);

  const renderPermissionRequest = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.permissionText} accessibilityRole="text">
        Đang xin quyền truy cập camera...
      </Text>
    </View>
  );

  if (cameraAvailable === false) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Không tìm thấy camera</Text>
        <Text style={styles.bodyText}>
          Vui lòng thử trên thiết bị thật hoặc đảm bảo thiết bị của bạn có camera.
        </Text>
      </View>
    );
  }

  if (isRequestingPermission) {
    return renderPermissionRequest();
  }

  if (!permission?.granted) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Cần quyền truy cập camera</Text>
        <Text style={styles.bodyText}>
          Chúng tôi cần quyền để mở camera và chụp ảnh. Hãy cấp quyền trong Cài đặt.
        </Text>
        <View style={styles.permissionButtons}>
          {permission?.canAskAgain ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thử cấp quyền lại"
              onPress={() => {
                void handleRetryPermission();
              }}
              style={[styles.secondaryButton, styles.permissionAction]}
              hitSlop={spacing.sm}
            >
              <Text style={styles.secondaryButtonText}>Thử lại</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mở cài đặt"
            onPress={handleOpenSettings}
            style={[styles.primaryButton, styles.permissionAction]}
            hitSlop={spacing.sm}
          >
            <Text style={styles.primaryButtonText}>Mở cài đặt</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (cameraAvailable === null) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        onCameraReady={() => setIsCameraReady(true)}
        facing={cameraType}
        flash={flashMode}
      />

      <View style={styles.overlay} pointerEvents="none">
        {!isCameraReady ? (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={colors.surface} />
          </View>
        ) : null}
      </View>

      <View style={styles.bottomContainer} pointerEvents="box-none">
        <BottomActions
          leftAction={
            <Pressable
              accessibilityLabel="Bật hoặc tắt đèn flash"
              accessibilityRole="button"
              onPress={handleToggleFlash}
              style={styles.iconButton}
              hitSlop={spacing.sm}
              disabled={isCapturing}
            >
              <MaterialCommunityIcons
                name={flashMode === FlashMode.off ? "flash-off" : "flash"}
                size={28}
                color={colors.surface}
              />
              <Text style={styles.iconLabel} allowFontScaling>
                {flashMode === FlashMode.off ? "Flash tắt" : "Flash bật"}
              </Text>
            </Pressable>
          }
          captureButton={
            <CaptureButton
              onPress={handleCapture}
              disabled={!isCameraReady || isCapturing}
              loading={isCapturing}
            />
          }
          rightAction={
            <Pressable
              accessibilityLabel="Đổi camera trước sau"
              accessibilityRole="button"
              onPress={handleSwitchCamera}
              style={styles.iconButton}
              hitSlop={spacing.sm}
              disabled={isCapturing}
            >
              <MaterialCommunityIcons
                name="camera-switch"
                size={28}
                color={colors.surface}
              />
              <Text style={styles.iconLabel} allowFontScaling>
                Đổi camera
              </Text>
            </Pressable>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.select({ ios: spacing.lg, default: spacing.md }),
    paddingTop: spacing.lg,
    justifyContent: "flex-end",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  iconLabel: {
    marginTop: spacing.xs,
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    textAlign: "center",
  },
  bodyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  permissionText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    minWidth: 160,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    minWidth: 140,
    backgroundColor: colors.surface,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
  permissionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  permissionAction: {
    flex: 1,
  },
});
