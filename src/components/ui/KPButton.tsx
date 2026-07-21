import { Pressable, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Radius, useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  // Optional explicit text color override — use this for buttons whose
  // background isn't colors.primary/colors.secondary (e.g. a neutral
  // surfaceLight "list item" style button), since onPrimary/onSecondary
  // are only guaranteed to contrast against primary/secondary fills.
  textColor?: string;
  // Haptic fired the instant the button is pressed. Defaults to "light"
  // for ordinary buttons. Use "warning" for destructive actions (Delete),
  // "medium" for the one or two most prominent create/save actions on a
  // screen, or "none" to opt out entirely.
  haptic?: "light" | "medium" | "warning" | "none";
  style?: ViewStyle | ViewStyle[];
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function KPButton({
  title,
  onPress,
  variant = "primary",
  textColor,
  haptic = "light",
  style,
}: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const bg = variant === "primary" ? colors.primary : colors.secondary;
  const defaultTextColor =
    variant === "primary" ? colors.onPrimary : colors.onSecondary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    if (haptic === "light") haptics.light();
    else if (haptic === "medium") haptics.medium();
    else if (haptic === "warning") haptics.warning();

    onPress?.();
  }

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      onPress={handlePress}
      style={[
        {
          height: 56,
          borderRadius: Radius.full,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
          elevation: 3,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={{
          color: textColor ?? defaultTextColor,
          fontSize: 17,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}
