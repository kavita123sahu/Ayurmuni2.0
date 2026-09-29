import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';

/** API cancellation_reason enum values */
export const APPOINTMENT_CANCEL_REASONS: {
  value: string;
  label: string;
}[] = [
    {
      value: 'professional_or_medical_exigency',
      label: 'Professional or medical exigency',
    },
    {
      value: 'personal_or_unforeseen_circumstance',
      label: 'Personal or unforeseen circumstance',
    },
    {
      value: 'unavailability',
      label: 'Unavailability',
    },
    {
      value: 'technical_difficulty',
      label: 'Technical difficulty',
    },
    {
      value: 'unable_to_conduct_consultation',
      label: 'Unable to conduct consultation',
    },
    {
      value: 'requires_user_in_person_care',
      label: 'Requires in-person care',
    },
    {
      value: 'other_reasonable_circumstance',
      label: 'Other reasonable circumstance',
    },
  ];

const CANCEL_NOTES = [
  'Free cancellation up to 3 hours before the scheduled consultation.',
  'Cancellations within 3 hours may be non-refundable, except when the doctor or Ayurmuni cannot provide the consultation.',
  'Approved refunds are usually started within 72 hours and may take 5–7 business days to reflect.',
  'You can rebook another slot anytime from Appointments.',
];

export type CancelAppointmentPayload = {
  action: 'cancel';
  cancellation_reason: string;
  cancellation_reason_detail?: string;
};

const CancelAppointmentModal = ({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CancelAppointmentPayload) => void;
}) => {
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelected('');
      setDetail('');
    }
  }, [visible]);

  const needsDetail = selected === 'other_reasonable_circumstance';
  const canSubmit = useMemo(() => {
    if (!selected) return false;
    if (needsDetail && !detail.trim()) return false;
    return true;
  }, [selected, needsDetail, detail]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload: CancelAppointmentPayload = {
      action: 'cancel',
      cancellation_reason: selected,
    };
    if (needsDetail) {
      payload.cancellation_reason_detail = detail.trim();
    }
    onSubmit(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.handle} />

              <Text style={styles.title}>Cancel Appointment</Text>
              <Text style={styles.warning}>
                Please review the cancellation notes before confirming.
              </Text>

              <View style={styles.notesBox}>
                {CANCEL_NOTES.map(item => (
                  <View key={item} style={styles.noteRow}>
                    <View style={styles.bullet}>
                      <TablerIcon
                        name="check"
                        size={11}
                        color={Colors.primaryColor}
                      />
                    </View>
                    <Text style={styles.noteText}>{item}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.reasonTitle}>Reason for cancellation</Text>

              {APPOINTMENT_CANCEL_REASONS.map(item => {
                const active = selected === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.reasonItem,
                      {
                        backgroundColor: active
                          ? Colors.primaryColor
                          : '#FAFAFA',
                        borderColor: active
                          ? Colors.primaryColor
                          : '#E5E7EB',
                      },
                    ]}
                    onPress={() => setSelected(item.value)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={{
                        color: active ? Colors.white : Colors.black,
                        fontFamily: Fonts.PoppinsMedium,
                        fontSize: 13,
                      }}
                    >
                      {active ? '◉' : '○'} {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {needsDetail ? (
                <TextInput
                  placeholder="Please describe the circumstance..."
                  value={detail}
                  onChangeText={setDetail}
                  multiline
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                />
              ) : null}
            </ScrollView>

            <TouchableOpacity
              style={[styles.cancelBtn, !canSubmit && styles.cancelBtnDisabled]}
              disabled={!canSubmit}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>Cancel Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.keepBtn} onPress={onClose}>
              <Text style={styles.keepText}>Keep Appointment</Text>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '92%',
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
    textAlign: 'center',
  },
  warning: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 18,
  },
  notesBox: {
    backgroundColor: '#F0FAF7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  reasonTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
    marginBottom: 10,
  },
  reasonItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    textAlignVertical: 'top',
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 13,
    color: '#111827',
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnDisabled: {
    opacity: 0.45,
  },
  cancelText: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
  },
  keepBtn: {
    marginTop: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },
});
