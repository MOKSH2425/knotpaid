import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { KPText } from "@/components/ui";
import { useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";

export type BottomSheetAction = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  // Renders the row in the danger color — use for delete/remove actions.
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  // Small uppercase label above the actions, e.g. the group's name.
  title?: string;
  actions: BottomSheetAction[];
};

export default function KPBottomSheet({
  visible,
  onClose,
  title,
  actions,
}: Props) {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.duration(220)}
          exiting={SlideOutDown.duration(160)}
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
              borderColor: colors.border,
              borderWidth: isDark ? 0 : 1,
            },
          ]}
        >
          {/* Swallow taps inside the sheet so they don't bubble to the
              overlay's onClose. */}
          <Pressable onPress={() => {}}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.border },
              ]}
            />

            {title ? (
              <KPText
                style={[styles.title, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {title}
              </KPText>
            ) : null}

            {actions.map((action, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  haptics.light();
                  onClose();
                  // Give the sheet's close animation a beat before firing
                  // the action — matters when the action itself opens
                  // another modal (e.g. a delete confirmation).
                  setTimeout(action.onPress, 80);
                }}
                style={({ pressed }) => [
                  styles.row,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                {action.icon ? (
                  <Ionicons
                    name={action.icon}
                    size={20}
                    color={action.destructive ? colors.danger : colors.text}
                    style={{ marginRight: 14 }}
                  />
                ) : null}
                <KPText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: action.destructive ? colors.danger : colors.text,
                  }}
                >
                  {action.label}
                </KPText>
              </Pressable>
            ))}

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelRow,
                {
                  backgroundColor: colors.surfaceLight,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <KPText
                style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
              >
                Cancel
              </KPText>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    padding: 20,
    paddingBottom: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelRow: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
});
