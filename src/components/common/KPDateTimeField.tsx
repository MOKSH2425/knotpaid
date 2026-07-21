import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { KPText } from "@/components/ui";
import { useTheme } from "@/theme";
import { formatDatePart, formatTimePart } from "@/utils/formatDate";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

// Two tappable fields (date, time) that each open the platform's native
// picker. Android's picker is its own modal and closes itself; iOS's
// "default" display is a compact inline picker, so we hide it ourselves
// once a value is picked.
export function KPDateTimeField({ value, onChange }: Props) {
  const { colors } = useTheme();
  const [activePicker, setActivePicker] = useState<"date" | "time" | null>(
    null,
  );

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    const pickerType = activePicker;

    if (Platform.OS === "android") {
      setActivePicker(null);
    }

    if (event.type === "dismissed" || !selected) {
      if (Platform.OS === "ios") setActivePicker(null);
      return;
    }

    const next = new Date(value);

    if (pickerType === "date") {
      next.setFullYear(selected.getFullYear());
      next.setMonth(selected.getMonth());
      next.setDate(selected.getDate());
    } else {
      next.setHours(selected.getHours());
      next.setMinutes(selected.getMinutes());
    }

    onChange(next);

    if (Platform.OS === "ios") setActivePicker(null);
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={[
          styles.field,
          { backgroundColor: colors.surfaceLight, borderColor: colors.border },
        ]}
        onPress={() => setActivePicker("date")}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={colors.textSecondary}
        />
        <KPText style={{ marginLeft: 8, color: colors.text, fontSize: 15 }}>
          {formatDatePart(value)}
        </KPText>
      </Pressable>

      <View style={{ width: 12 }} />

      <Pressable
        style={[
          styles.field,
          { backgroundColor: colors.surfaceLight, borderColor: colors.border },
        ]}
        onPress={() => setActivePicker("time")}
      >
        <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
        <KPText style={{ marginLeft: 8, color: colors.text, fontSize: 15 }}>
          {formatTimePart(value)}
        </KPText>
      </Pressable>

      {activePicker ? (
        <DateTimePicker
          value={value}
          mode={activePicker}
          display="default"
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
});
