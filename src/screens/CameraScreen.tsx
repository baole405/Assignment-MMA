import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";

import { useCameraModal } from "@/src/hooks/use-camera-modal";
import { getFileSize, normalizeAndCompressImage } from "@/src/utils/image";

const PURPLE = "#5B4BDF";
const PURPLE_DARK = "#372C7B";
const SURFACE = "#F4F2FF";
const OVERLAY_DARK = "rgba(11, 9, 30, 0.48)";

type Facing = "back" | "front";
type FlashSetting = "off" | "on";

type CameraScreenProps = {
  onClose?: () => void;
};

export default function CameraScreen({ onClose }: CameraScreenProps) {
  const { close } = useCameraModal();
  const dismiss = onClose ?? close;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<Facing>("back");
  const [flash, setFlash] = useState<FlashSetting>("off");
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!permission) {
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      setIsReady(false);
      setIsBusy(false);
    }, [])
  );

  const ensurePermission = useCallback(async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result?.granted ?? false;
  }, [permission?.granted, requestPermission]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      Alert.alert(
        "Không thể mở cài đặt",
        "Hãy mở thủ công phần Cài đặt hệ thống để cấp quyền camera."
      );
    });
  }, []);

  const handleToggleFlash = useCallback(() => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  }, []);

  const handleSwitchFacing = useCallback(() => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isBusy) {
      return;
    }

    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert(
        "Chưa cấp quyền",
        "Ứng dụng cần quyền camera để tiếp tục chụp ảnh."
      );
      return;
    }

    try {
      setIsBusy(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      const originalSize = photo?.uri
        ? await getFileSize(photo.uri)
        : undefined;

      const processed = photo?.uri
        ? await normalizeAndCompressImage(photo.uri)
        : undefined;

      if (!processed) {
        throw new Error("Không thể xử lý ảnh");
      }

      router.replace({
        pathname: "/preview",
        params: {
          uri: processed.uri,
          width: String(processed.width),
          height: String(processed.height),
          size: String(processed.size),
          originalSize: originalSize ? String(originalSize) : undefined,
        },
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    } finally {
      setIsBusy(false);
    }
  }, [ensurePermission, isBusy, router]);

  const permissionState = useMemo(() => {
    if (!permission) return "checking";
    if (!permission.granted) return "denied";
    return "granted";
  }, [permission]);

  if (permissionState === "checking") {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.bodyText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  if (permissionState === "denied") {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Cần quyền truy cập camera</Text>
        <Text style={styles.bodyText}>
          Cấp quyền camera để chụp, lưu và cập nhật hình ảnh cho bộ sưu tập của bạn.
        </Text>
        <View style={styles.permissionActions}>
          <Pressable
            style={[styles.secondaryButton, styles.permissionButton]}
            onPress={() => requestPermission()}
          >
            <Text style={styles.secondaryButtonText}>Thử lại</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, styles.permissionButton]}
            onPress={handleOpenSettings}
          >
            <Text style={styles.primaryButtonText}>Mở cài đặt</Text>
          </Pressable>
        </View>
        <Pressable onPress={dismiss} style={styles.dismissLink}>
          <Text style={styles.dismissText}>Đóng</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsReady(true)}
      />

      <View style={styles.overlay} pointerEvents="none">
        {!isReady ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      <View
        style={[styles.topBar, { paddingTop: insets.top + 12 }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.closeButton}
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel="Đóng camera"
        >
          <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={handleToggleFlash}
            disabled={isBusy}
          >
            <MaterialCommunityIcons
              name={flash === "off" ? "flash-off" : "flash"}
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.actionLabel}>
              {flash === "off" ? "Flash tắt" : "Flash bật"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={!isReady || isBusy}
          >
            <View style={styles.captureOuter}>
              {isBusy ? (
                <ActivityIndicator color={PURPLE} />
              ) : (
                <View style={styles.captureInner} />
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={handleSwitchFacing}
            disabled={isBusy}
          >
            <MaterialCommunityIcons
              name="camera-sync"
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.actionLabel}>Đổi camera</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: OVERLAY_DARK,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  captureButton: {
    padding: 4,
  },
  captureOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: PURPLE_DARK,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6F79A8",
    textAlign: "center",
  },
  permissionActions: {
    flexDirection: "row",
    gap: 12,
  },
  permissionButton: {
    minWidth: 140,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: PURPLE,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#ECE7FF",
  },
  secondaryButtonText: {
    color: PURPLE_DARK,
    fontWeight: "700",
    fontSize: 15,
  },
  dismissLink: {
    marginTop: 16,
  },
  dismissText: {
    color: PURPLE,
    fontWeight: "700",
    fontSize: 15,
  },
});
