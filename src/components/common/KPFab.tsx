import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";

type Props = {
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function KPFab({ onPress }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      onPress={() => {
        haptics.medium();
        onPress();
      }}
      style={[
        {
          position: "absolute",
          right: 22,
          bottom: 30,
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name="add" size={30} color={colors.onPrimary} />
    </AnimatedPressable>
  );
}
