import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { KPText } from "@/components/ui";
import { Colors } from "@/theme";

export default function DashboardHeader() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <View style={styles.container}>
      <View>
        <KPText style={styles.greeting}>👋 {greeting}</KPText>
        <KPText style={styles.title}>Welcome Back</KPText>
      </View>

      <Image
        source={require("../../../assets/branding/logo.png")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 55,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  title: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },

  logo: {
    width: 54,
    height: 54,
  },
});