import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { KPCard, KPText } from "@/components/ui";
import KPAvatar from "@/components/ui/KPAvatar";

import { Colors } from "@/theme";

import { deleteGroup } from "@/features/groups/services/group.service";

type Props = {
  id: string;
  name: string;
  members: number;
  expenses: number;
  total: number;
};

export default function GroupCard(props: Props) {
  const [loading, setLoading] = useState(false);

  function openGroup() {
    router.push({
      pathname: "/group",
      params: {
        groupId: props.id,
      },
    });
  }

  function renameGroup() {
    router.push({
      pathname: "/rename-group",
      params: {
        groupId: props.id,
        name: props.name,
      },
    });
  }

  function removeGroup() {
    Alert.alert("Delete Group", `Delete "${props.name}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setLoading(true);
          deleteGroup(props.id);
          router.replace("/");
        },
      },
    ]);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openGroup}
      onLongPress={() => {
        Alert.alert(props.name, "Choose an action", [
          {
            text: "Rename",
            onPress: renameGroup,
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: removeGroup,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]);
      }}
    >
      <KPCard style={styles.card}>
        <View style={styles.row}>
          <KPAvatar name={props.name} />

          <View style={styles.center}>
            <KPText style={styles.name}>{props.name}</KPText>
            <KPText style={styles.subtitle}>
              {props.members} {props.members === 1 ? "member" : "members"} •{" "}
              {props.expenses} {props.expenses === 1 ? "expense" : "expenses"}
            </KPText>
          </View>

          <View style={styles.totalWrap}>
            <KPText style={styles.amount}>₹{props.total.toFixed(0)}</KPText>
            <KPText style={styles.totalLabel}>total</KPText>
          </View>
        </View>
      </KPCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    paddingVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  totalWrap: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  amount: {
    fontWeight: "800",
    fontSize: 17,
    color: Colors.primary,
  },
  totalLabel: {
    marginTop: 2,
    color: Colors.textSecondary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
