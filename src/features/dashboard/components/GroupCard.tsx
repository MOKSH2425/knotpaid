import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";

import { KPCard, KPText } from "@/components/ui";
import KPAvatar from "@/components/ui/KPAvatar";
import KPBottomSheet from "@/components/common/KPBottomSheet";

import { useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";
import { useDialog } from "@/providers/DialogProvider";

import { deleteGroup } from "@/features/groups/services/group.service";

type Props = {
  id: string;
  name: string;
  members: number;
  expenses: number;
  total: number;
  // Position in the list — used to stagger the entrance animation so cards
  // cascade in one after another instead of all popping in at once.
  index?: number;
};

export default function GroupCard(props: Props) {
  const { colors } = useTheme();
  const dialog = useDialog();
  const [menuVisible, setMenuVisible] = useState(false);

  function openGroup() {
    haptics.light();
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

  async function removeGroup() {
    const confirmed = await dialog.confirm({
      title: "Delete Group",
      message: `Delete "${props.name}"? This can't be undone.`,
      confirmText: "Delete",
      destructive: true,
    });

    if (confirmed) {
      deleteGroup(props.id);
      router.replace("/");
    }
  }

  return (
    <Animated.View
      entering={FadeInDown.delay((props.index ?? 0) * 70)
        .springify()
        .damping(16)}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openGroup}
        onLongPress={() => {
          haptics.medium();
          setMenuVisible(true);
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

      <KPBottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={props.name}
        actions={[
          {
            label: "Rename Group",
            icon: "create-outline",
            onPress: renameGroup,
          },
          {
            label: "Delete Group",
            icon: "trash-outline",
            onPress: removeGroup,
            destructive: true,
          },
        ]}
      />
    </Animated.View>
  );
}
