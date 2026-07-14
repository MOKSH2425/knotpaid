import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { KPText } from "@/components/ui";
import { Colors } from "@/theme";

export default function DashboardHeader() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <KPText style={styles.greeting}>👋 {greeting}</KPText>
        <KPText style={styles.title}>Welcome Back</KPText>
      </View>

      <View style={styles.logoWrap}>
        <Image
          source={require("../../../assets/branding/logo.png")}
          style={styles.logo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },
  logoWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 38,
    height: 38,
  },
});
