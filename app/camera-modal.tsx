import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CameraScreen from "@/src/screens/CameraScreen";
import { useCameraModal } from "@/src/hooks/use-camera-modal";

export default function CameraModal() {
  const { close } = useCameraModal();

  return (
    <View style={styles.container}>
      <CameraScreen onClose={close} />
      <SafeAreaView pointerEvents="none" style={styles.safeArea} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 0,
  },
});
