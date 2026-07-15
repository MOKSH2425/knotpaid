import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { KPText } from "@/components/ui";
import { useTheme } from "@/theme";

export default function DashboardHeader() {
  const { colors } = useTheme();
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <View
      style={{
        marginTop: 48,
        marginBottom: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <KPText
          style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}
        >
          👋 {greeting}
        </KPText>
        <KPText style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
          Welcome Back
        </KPText>
      </View>

      <Pressable onPress={() => router.push("/settings")}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../../assets/branding/logo.png")}
            style={{ width: 38, height: 38 }}
          />
        </View>
      </Pressable>
    </View>
  );
}
