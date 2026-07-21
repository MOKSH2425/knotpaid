import { View } from "react-native";

import { KPText } from "@/components/ui";
import { useTheme } from "@/theme";

type Props = {
  groups: number;
  members: number;
  expenses: number;
};

function Item({ title, value }: { title: string; value: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
      }}
    >
      <KPText style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
        {value}
      </KPText>
      <KPText
        style={{ marginTop: 4, color: colors.textSecondary, fontSize: 12 }}
      >
        {title}
      </KPText>
    </View>
  );
}

export default function StatsRow(props: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        paddingVertical: 8,
      }}
    >
      <Item title="Groups" value={props.groups} />
      <Item title="Members" value={props.members} />
      <Item title="Expenses" value={props.expenses} />
    </View>
  );
}
