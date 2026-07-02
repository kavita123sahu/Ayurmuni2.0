import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";

const REASONS = [
  "Scheduling Conflict",
  "Not Available",
  "Feeling Better",
  "Booked By Mistake",
  "Found Another Doctor",
];

const CancelAppointmentModal = ({
  visible,
  onClose,
  onSubmit,
}: any) => {
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState("");


  useEffect(() => {
    if (!visible) {
      setReason("");

      setSelected("");
    }
  }, [visible]);


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <View style={styles.handle} />

              <Text style={styles.title}>
                Cancel Appointment
              </Text>

              <Text style={styles.warning}>
                Are you sure you want to cancel?
              </Text>


              {REASONS.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.reasonItem, {
                    backgroundColor:
                      selected === item ? Colors.primaryColor : "#FAFAFA",
                  }]}
                  onPress={() => setSelected(item)}
                >
                  <Text
                    style={{
                      color:
                        selected === item
                          ? Colors.white
                          : Colors.black,
                    }}
                  >
                    {selected === item ? "◉" : "○"} {item}
                  </Text>
                </TouchableOpacity>
              ))}

              <TextInput
                placeholder="Additional note..."
                value={reason}
                onChangeText={setReason}
                multiline
                style={styles.input}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                onSubmit({
                  action: "cancel",
                  cancellation_reason:
                    reason || selected,
                })
              }
            >
              <Text style={styles.cancelText}>
                Cancel Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepBtn}
              onPress={onClose}
            >
              <Text style={styles.keepText}>
                Keep Appointment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CancelAppointmentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },

  handle: {
    width: 60,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontFamily: Fonts.PoppinsSemiBold,
    color: "#111827",
    textAlign: "center",
  },

  warning: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: Fonts.PoppinsMedium,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },

  reasonItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 14,
    fontFamily: Fonts.PoppinsMedium,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },

  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 16,
    textAlignVertical: "top",
    backgroundColor: "#FAFAFA",
    color: "#111827",
  },

  cancelBtn: {
    backgroundColor: "#EF4444",
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  cancelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },

  keepBtn: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  keepText: {
    color: Colors.primaryColor,
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },
});