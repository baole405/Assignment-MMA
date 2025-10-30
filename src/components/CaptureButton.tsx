import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { colors, spacing } from "@/src/theme/tokens";

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export function CaptureButton({
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel = "Chụp ảnh",
}: CaptureButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled || loading}
      hitSlop={spacing.sm}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && !disabled && !loading ? styles.pressed : undefined,
        (disabled || loading) && styles.disabled,
      ]}
    >
      <View style={styles.innerCircle}>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 88,
    height: 88,
    borderRadius: 88 / 2,
    borderWidth: 4,
    borderColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
