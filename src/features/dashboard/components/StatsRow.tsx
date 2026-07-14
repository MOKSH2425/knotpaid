import { View, StyleSheet } from "react-native";

import { KPText } from "@/components/ui";
import { Colors } from "@/theme";

type Props = {
  groups: number;
  members: number;
  expenses: number;
};

function Item({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.item}>
      <KPText style={styles.value}>{value}</KPText>
      <KPText style={styles.title}>{title}</KPText>
    </View>
  );
}

export default function StatsRow(props: Props) {
  return (
    <View style={styles.row}>
      <Item title="Groups" value={props.groups} />
      <Item title="Members" value={props.members} />
      <Item title="Expenses" value={props.expenses} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingVertical: 8,
  },
  item: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  title: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
