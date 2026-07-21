import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

import { KPButton, KPCard, KPInput, KPText } from "@/components/ui";
import { useTheme } from "@/theme";
import { haptics } from "@/utils/haptics";

type Props = {
  visible: boolean;
  onClose: () => void;
  fromName: string;
  toName: string;
  // The amount the debt-simplification algorithm suggests — prefilled,
  // and the ceiling on what can be recorded, but not the only valid
  // amount. Real payments are often partial.
  suggestedAmount: number;
  onConfirm: (amount: number) => void;
};

// Lets the user record a real payment between two members instead of just
// looking at a suggested "who owes whom" number. Defaults to the full
// suggested amount for a quick tap-and-confirm, but the field is editable
// so a partial payment (e.g. "paid back ₹500 of the ₹800 owed") can be
// recorded accurately instead of forcing an all-or-nothing settle.
export default function KPSettleUpSheet({
  visible,
  onClose,
  fromName,
  toName,
  suggestedAmount,
  onConfirm,
}: Props) {
  const { colors } = useTheme();
  const [amountText, setAmountText] = useState(suggestedAmount.toFixed(2));
  const [error, setError] = useState<string | null>(null);

  // Reset the field to the current suggestion every time the sheet opens
  // for a (possibly different) pair — otherwise a stale amount from the
  // last settlement could linger.
  useEffect(() => {
    if (visible) {
      setAmountText(suggestedAmount.toFixed(2));
      setError(null);
    }
  }, [visible, suggestedAmount]);

  function handleConfirm() {
    const parsed = Number(amountText);

    if (!amountText.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (parsed > suggestedAmount + 0.01) {
      setError(`Can't exceed the ₹${suggestedAmount.toFixed(2)} owed.`);
      return;
    }

    haptics.success();
    onConfirm(Math.round(parsed * 100) / 100);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {visible ? (
          <Animated.View
            entering={ZoomIn.duration(180)}
            exiting={ZoomOut.duration(120)}
            style={styles.cardWrap}
          >
            <Pressable onPress={() => {}}>
              <KPCard>
                <KPText style={{ fontSize: 19, fontWeight: "700" }}>
                  Mark as Paid
                </KPText>

                <KPText
                  style={{
                    marginTop: 8,
                    color: colors.textSecondary,
                    lineHeight: 21,
                  }}
                >
                  {fromName} pays {toName}
                </KPText>

                <View style={{ height: 18 }} />

                <KPInput
                  keyboardType="decimal-pad"
                  value={amountText}
                  onChangeText={(text) => {
                    setAmountText(text);
                    setError(null);
                  }}
                  placeholder="0.00"
                  autoFocus
                />

                {error ? (
                  <KPText
                    style={{ marginTop: 8, color: colors.danger, fontSize: 13 }}
                  >
                    {error}
                  </KPText>
                ) : (
                  <KPText
                    style={{
                      marginTop: 8,
                      color: colors.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    Suggested: ₹{suggestedAmount.toFixed(2)}
                  </KPText>
                )}

                <View style={{ height: 22 }} />

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1 }}>
                    <KPButton
                      title="Cancel"
                      textColor={colors.text}
                      style={{
                        backgroundColor: colors.surfaceLight,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                      onPress={onClose}
                    />
                  </View>

                  <View style={{ width: 12 }} />

                  <View style={{ flex: 1 }}>
                    <KPButton
                      title="Confirm"
                      haptic="none"
                      textColor={colors.white}
                      style={{ backgroundColor: colors.primary }}
                      onPress={handleConfirm}
                    />
                  </View>
                </View>
              </KPCard>
            </Pressable>
          </Animated.View>
        ) : null}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 420,
  },
});
