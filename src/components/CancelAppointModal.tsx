import React, { useEffect, useState } from 'react';
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

const REASONS = [
  'Scheduling conflict',
  'Feeling better / no longer needed',
  'Booked by mistake',
  'Found another doctor',
  'Personal emergency',
];

const CANCEL_NOTES = [
  'Free cancellation up to 6 hours before the scheduled consultation.',
  'Cancellations within 6 hours may be non-refundable, except when the doctor or Ayurmuni cannot provide the consultation.',
  'Approved refunds are usually started within 72 hours and may take 5–7 business days to reflect.',
  'You can rebook another slot anytime from Appointments.',
];

const CancelAppointmentModal = ({ visible, onClose, onSubmit }: any) => {
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (!visible) {
      setReason('');
      setSelected('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.handle} />

              <Text style={styles.title}>Cancel Appointment</Text>
              <Text style={styles.warning}>
                Please review the cancellation notes before confirming.
              </Text>

              <View style={styles.notesBox}>
                {CANCEL_NOTES.map(item => (
                  <View key={item} style={styles.noteRow}>
                    <View style={styles.bullet}>
                      <TablerIcon name="check" size={11} color={Colors.primaryColor} />
                    </View>
                    <Text style={styles.noteText}>{item}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.reasonTitle}>Reason for cancellation</Text>

              {REASONS.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor:
                        selected === item ? Colors.primaryColor : '#FAFAFA',
                      borderColor:
                        selected === item ? Colors.primaryColor : '#E5E7EB',
                    },
                  ]}
                  onPress={() => setSelected(item)}
                >
                  <Text
                    style={{
                      color: selected === item ? Colors.white : Colors.black,
                      fontFamily: Fonts.PoppinsMedium,
                      fontSize: 13,
                    }}
                  >
                    {selected === item ? '◉' : '○'} {item}
                  </Text>
                </TouchableOpacity>
              ))}

              <TextInput
                placeholder="Additional note (optional)..."
                value={reason}
                onChangeText={setReason}
                multiline
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                onSubmit({
                  action: 'cancel',
                  cancellation_reason: reason || selected,
                })
              }
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
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  reasonItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 8,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
    color: '#111827',
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: '#EF4444',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  keepBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  keepText: {
    color: Colors.primaryColor,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
