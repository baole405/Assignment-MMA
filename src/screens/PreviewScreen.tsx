import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { formatBytes } from "@/src/utils/image";
import { uploadImage } from "@/src/services/upload";

type PreviewSearchParams = {
  uri?: string | string[];
  width?: string | string[];
  height?: string | string[];
  size?: string | string[];
  originalSize?: string | string[];
};

const extractSingle = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const parseSize = (value?: string | string[]) => {
  const parsedValue = extractSingle(value);
  if (!parsedValue) {
    return undefined;
  }
  const numeric = Number(parsedValue);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export function PreviewScreen() {
  const params = useLocalSearchParams() as PreviewSearchParams;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const uri = extractSingle(params.uri) ?? "";
  const processedSize = parseSize(params.size);
  const originalSize = parseSize(params.originalSize);

  const sizeLabel = useMemo(() => {
    if (!processedSize) {
      return "";
    }
    return formatBytes(processedSize);
  }, [processedSize]);

  const handleRetake = useCallback(async () => {
    if (uri) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // ignore deletion errors
      }
    }
    router.back();
  }, [router, uri]);

  const ensureMediaPermission = useCallback(async () => {
    if (mediaPermission?.granted) {
      return true;
    }

    const response = await requestMediaPermission();
    return response?.granted ?? false;
  }, [mediaPermission?.granted, requestMediaPermission]);

  const handleSave = useCallback(async () => {
    if (!uri) {
      return;
    }
    try {
      setSaving(true);
      const granted = await ensureMediaPermission();
      if (!granted) {
        Alert.alert(
          "Không thể lưu ảnh",
          "Bạn cần cấp quyền truy cập thư viện ảnh để lưu."
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Đã lưu", "Ảnh đã được lưu vào thư viện của bạn.");
    } catch {
      Alert.alert("Lưu ảnh thất bại", "Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }, [ensureMediaPermission, uri]);

  const handleUpload = useCallback(async () => {
    if (!uri) {
      return;
    }

    try {
      setUploading(true);
      await uploadImage(uri);
      Alert.alert("Upload thành công", "Ảnh của bạn đã được tải lên.");
    } catch {
      Alert.alert(
        "Upload thất bại",
        "Không thể tải ảnh lên. Bạn có thể thử lại hoặc lưu ảnh để xử lý sau.",
        [
          {
            text: "Thử lại",
            onPress: () => handleUpload(),
          },
          {
            text: "Lưu ảnh",
            onPress: () => {
              void handleSave();
            },
          },
          {
            text: "Đóng",
            style: "cancel",
          },
        ]
      );
    } finally {
      setUploading(false);
    }
  }, [handleSave, uri]);

  if (!uri) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>Không tìm thấy ảnh</Text>
        <Pressable
          style={styles.primaryButton}
          accessibilityRole="button"
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri }}
            style={styles.previewImage}
            contentFit="contain"
            accessibilityLabel="Ảnh vừa chụp"
          />
        </View>
        <View style={styles.metaContainer}>
          {originalSize ? (
            <Text style={styles.metaText}>
              Kích thước ban đầu: {formatBytes(originalSize)}
            </Text>
          ) : null}
          {sizeLabel ? (
            <Text style={styles.metaText}>Sau nén: {sizeLabel}</Text>
          ) : null}
        </View>
        <View style={styles.actionsContainer}>
          <Pressable
            accessibilityLabel="Chụp lại"
            accessibilityRole="button"
            style={[styles.secondaryButton, styles.actionButton]}
            onPress={handleRetake}
            hitSlop={spacing.sm}
          >
            <Text style={styles.secondaryButtonText}>Chụp lại</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Lưu ảnh"
            accessibilityRole="button"
            style={[
              styles.secondaryButton,
              styles.actionButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            hitSlop={spacing.sm}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.secondaryButtonText}>Lưu</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityLabel="Tải ảnh lên"
            accessibilityRole="button"
            style={[
              styles.primaryButton,
              styles.actionButton,
              uploading && styles.disabledButton,
            ]}
            onPress={handleUpload}
            hitSlop={spacing.sm}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Upload</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  imageContainer: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#000",
    aspectRatio: 3 / 4,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  metaContainer: {
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
