import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { radius, shadows, spacing } from "@/src/theme/tokens";

interface BottomActionsProps {
  leftAction: ReactNode;
  rightAction: ReactNode;
  captureButton: ReactNode;
}

export function BottomActions({
  leftAction,
  rightAction,
  captureButton,
}: BottomActionsProps) {
  return (
    <View style={styles.wrapper} accessibilityRole="tablist">
      <View style={styles.side}>{leftAction}</View>
      <View style={styles.capture}>{captureButton}</View>
      <View style={styles.side}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  side: {
    flex: 1,
    alignItems: "center",
  },
  capture: {
    flex: 1.2,
    alignItems: "center",
  },
});
