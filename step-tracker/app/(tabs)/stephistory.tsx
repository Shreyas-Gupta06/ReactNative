import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StepHistory() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Working on this feature...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23272f",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    opacity: 0.8,
  },
});
