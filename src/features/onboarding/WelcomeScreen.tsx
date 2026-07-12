import { View, StyleSheet } from "react-native";
import { KPButton, KPText } from "@/components/ui";
import { Colors } from "@/theme";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <KPText style={styles.logo}>💸</KPText>
      <KPText style={styles.title}>KnotPaid</KPText>
      <KPText style={styles.subtitle}>
        Split bills. {"\n"}
        Track expenses. {"\n"}
        Settle instantly.
      </KPText>

      <View style={{ height: 40 }} />

      <KPButton
        title="Get Started"
        onPress={() => {
          console.log("Next Screen");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontSize: 72,
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.text,
  },
  subtitle: {
    marginTop: 18,
    fontSize: 17,
    textAlign: "center",
    color: Colors.textSecondary,
    lineHeight: 28,
  },
});
