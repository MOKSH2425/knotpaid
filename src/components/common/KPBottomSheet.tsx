import { Modal, Pressable, StyleSheet, View } from "react-native";

import { KPButton } from "@/components/ui";

type Props = {
  visible: boolean;
  onClose: () => void;

  onRename: () => void;
  onDelete: () => void;
};

export default function KPBottomSheet({
  visible,
  onClose,
  onRename,
  onDelete,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <KPButton
            title="✏ Rename Group"
            onPress={onRename}
          />

          <View style={{ height: 12 }} />

          <KPButton
            title="🗑 Delete Group"
            onPress={onDelete}
          />

          <View style={{ height: 12 }} />

          <KPButton
            title="Cancel"
            onPress={onClose}
          />
        </View>
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
    backgroundColor: "#fff",

    padding: 22,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
});