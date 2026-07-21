import { View } from "react-native";
import { KPButton } from "@/components/ui";
import { useTheme } from "@/theme";

type Member = { id: string; name: string };

type Props = {
  members: Member[];
  selectedIds: string[];
  onToggle: (memberId: string) => void;
};

// Multi-select version of the single-select "Paid By" pill list — tapping
// a member toggles them in/out of the split instead of picking exactly one.
export function KPParticipantSelector({
  members,
  selectedIds,
  onToggle,
}: Props) {
  const { colors } = useTheme();

  return (
    <View>
      {members.map((member) => {
        const selected = selectedIds.includes(member.id);

        return (
          <View key={member.id} style={{ marginBottom: 10 }}>
            <KPButton
              title={selected ? `✓ ${member.name}` : member.name}
              onPress={() => onToggle(member.id)}
              textColor={selected ? colors.onPrimary : colors.text}
              style={{
                backgroundColor: selected
                  ? colors.primary
                  : colors.surfaceLight,
                borderWidth: selected ? 0 : 1,
                borderColor: colors.border,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
