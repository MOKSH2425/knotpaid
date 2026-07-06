import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>KnotPaid</Text>
      <Text style={styles.subtitle}>
        Untangling shared expenses.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0B0B",
  },

  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 10,
    color: "#8E8E93",
    fontSize: 16,
  },
});