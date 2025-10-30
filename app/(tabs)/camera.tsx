import React, { useCallback, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useCameraPermissions } from "expo-camera";

import { openCameraModal } from "@/src/hooks/use-camera-modal";

const PURPLE = "#5B4BDF";

export default function CameraTab() {
  const [permission, requestPermission] = useCameraPermissions();

  const permissionLabel = useMemo(() => {
    if (!permission) return "Đang kiểm tra quyền truy cập";
    if (!permission.granted) return "Chưa cấp quyền camera";
    return "Sẵn sàng chụp ảnh";
  }, [permission]);

  const handleOpenCamera = useCallback(async () => {
    const granted =
      permission?.granted || (await requestPermission())?.granted || false;

    if (granted) {
      openCameraModal();
    } else {
      Alert.alert(
        "Cần quyền truy cập",
        "Ứng dụng cần quyền camera để mở chế độ chụp ảnh."
      );
    }
  }, [permission?.granted, requestPermission]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>Camera</Text>
        <Text style={styles.title}>Chụp nhanh những ý tưởng mới</Text>
        <Text style={styles.subtitle}>
          {permissionLabel}. Nhấn nút bên dưới để mở camera toàn màn hình, tránh
          che khuất bởi thanh điều hướng.
        </Text>
        <Pressable style={styles.primaryButton} onPress={handleOpenCamera}>
          <Text style={styles.primaryText}>Mở camera</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F2FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: PURPLE,
    borderRadius: 28,
    padding: 28,
    gap: 16,
    shadowColor: "#311B92",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    color: "#ECE7FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#E6E2FF",
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "700",
  },
});
