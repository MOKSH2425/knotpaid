import { View, StyleSheet } from "react-native";

import { KPText } from "@/components/ui";
import { Colors } from "@/theme";

export default function KPHeader() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  return (
    <View style={styles.container}>
      <KPText style={styles.greeting}>
        👋 {greeting}
      </KPText>

      <KPText style={styles.name}>
        Moksh
      </KPText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    marginBottom: 30,
  },

  greeting: {
    color: Colors.textSecondary,
    fontSize: 16,
  },

  name: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
  },
});