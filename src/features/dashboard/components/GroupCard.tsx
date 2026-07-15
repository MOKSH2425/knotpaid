import { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { KPCard, KPText } from "@/components/ui";
import KPAvatar from "@/components/ui/KPAvatar";

import { useTheme } from "@/theme";

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
  const { colors } = useTheme();

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
      <KPCard style={{ marginBottom: 14, paddingVertical: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <KPAvatar name={props.name} />

          <View style={{ flex: 1, marginLeft: 14 }}>
            <KPText
              style={{ fontSize: 18, fontWeight: "700", color: colors.text }}
            >
              {props.name}
            </KPText>
            <KPText
              style={{
                marginTop: 4,
                color: colors.textSecondary,
                fontSize: 12,
              }}
            >
              {props.members} {props.members === 1 ? "member" : "members"} •{" "}
              {props.expenses} {props.expenses === 1 ? "expense" : "expenses"}
            </KPText>
          </View>

          <View style={{ alignItems: "flex-end", marginLeft: 10 }}>
            <KPText
              style={{ fontWeight: "800", fontSize: 17, color: colors.primary }}
            >
              ₹{props.total.toFixed(0)}
            </KPText>
            <KPText
              style={{
                marginTop: 2,
                color: colors.textSecondary,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              total
            </KPText>
          </View>
        </View>
      </KPCard>
    </TouchableOpacity>
  );
}
