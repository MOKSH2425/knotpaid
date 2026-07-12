import { View, StyleSheet } from "react-native";

import { KPText } from "@/components/ui";

type Props = {
  groups: number;
  members: number;
  expenses: number;
};

function Item({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
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
    marginBottom: 25,
  },

  item: {
    alignItems: "center",
    flex: 1,
  },

  value: {
    fontSize: 24,
    fontWeight: "800",
  },

  title: {
    marginTop: 5,
  },
});