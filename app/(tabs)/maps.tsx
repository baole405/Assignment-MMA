import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MapsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maps</Text>
      <Text style={styles.subtitle}>
        Tính năng bản đồ sẽ được bổ sung ở bước tiếp theo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});
