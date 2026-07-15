import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";

import { useTheme } from "@/theme";
import { KPText } from "@/components/ui";

export default function SplashScreen() {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.Image
        entering={FadeIn.duration(900)}
        source={require("../../../assets/branding/logo.png")}
        style={styles.logo}
      />

      <Animated.View entering={FadeInDown.delay(500)}>
        <KPText style={[styles.title, { color: colors.text }]}>
          KnotPaid
        </KPText>

        <KPText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Split smarter. Settle easier.
        </KPText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 140,
    height: 140,
    marginBottom: 30,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 16,
  },
});
