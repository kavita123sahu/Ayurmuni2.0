import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { getDoctorSlots } from '../services/ConsultServce';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { isSlotBookable } from '../utils/slotAvailabilityUtils';
import {
  formatAppointmentDateFull,
  formatAppointmentTimeLabel,
} from '../utils/appointmentUtils';
import TablerIcon from './TablerIcon';

const GREEN = Colors.primaryColor;
const GREEN_SOFT = '#EAF8F4';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#D7E8E1';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    action: string;
    availability: string;
    reschedule_reason?: string;
  }) => void;
  isRescheduleRequest: boolean;
  appointment: any;
}

const RescheduleModal = ({
  visible,
  onClose,
  onSubmit,
  isRescheduleRequest,
  appointment,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [slotsData, setSlotsData] = useState<
    { id: number; start_time: string; status?: string }[]
  >([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);
  const cacheRef = useRef<Map<string, { id: number; start_time: string; status?: string }[]>>(
    new Map(),
  );

  const doctorInfo = useMemo(() => {
    const root = appointment?.rawData ?? appointment;
    const doctor = root?.doctor ?? appointment?.doctor ?? {};
    return {
      id:
        doctor?.doctor_id ||
        doctor?.id ||
        appointment?.doctor_id ||
        root?.doctor_id,
      name:
        appointment?.doctorName ||
        doctor?.doctor_name ||
        doctor?.full_name ||
        doctor?.name ||
        'Doctor',
      specialty:
        appointment?.specialty ||
        doctor?.doctor_specialization ||
        '',
      date: appointment?.date || root?.appointment?.appointment_date,
      time: appointment?.time || root?.appointment?.start_time,
    };
  }, [appointment]);

  useEffect(() => {
    if (!visible || !appointment) return;
    setSelectedDate(String(appointment.date || doctorInfo.date || ''));
    setSelectedSlot(null);
    setReason('');
    setSlotsError(null);
  }, [visible, appointment, doctorInfo.date]);

  const fetchSlotsForDate = useCallback(
    async (date: string) => {
      if (!doctorInfo?.id || !date) return;

      const cacheKey = `${doctorInfo.id}_${date}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setSlotsData(cached);
        setLoadingSlots(false);
        setSlotsError(null);
        return;
      }

      const requestId = ++fetchIdRef.current;
      setLoadingSlots(true);
      setSlotsError(null);

      try {
        const resp = await getDoctorSlots({
          id: doctorInfo.id,
          date,
        });
        if (requestId !== fetchIdRef.current) return;
        const slots = Array.isArray(resp?.data?.slots) ? resp.data.slots : [];
        cacheRef.current.set(cacheKey, slots);
        setSlotsData(slots);
      } catch {
        if (requestId !== fetchIdRef.current) return;
        setSlotsData([]);
        setSlotsError('Could not load slots. Try again.');
      } finally {
        if (requestId === fetchIdRef.current) {
          setLoadingSlots(false);
        }
      }
    },
    [doctorInfo?.id],
  );

  useEffect(() => {
    if (visible && doctorInfo?.id && selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [visible, selectedDate, doctorInfo?.id, fetchSlotsForDate]);

  const availableSlots = useMemo(
    () => (slotsData || []).filter(slot => isSlotBookable(slot)),
    [slotsData],
  );

  const canSubmit =
    Boolean(selectedSlot?.id) &&
    (isRescheduleRequest || reason.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit || !selectedSlot?.id) return;
    onSubmit({
      action: isRescheduleRequest ? 'confirm_reschedule' : 'reschedule',
      availability: String(selectedSlot.id),
      ...(!isRescheduleRequest && {
        reschedule_reason: reason.trim(),
      }),
    });
  };

  const currentDateLabel = formatAppointmentDateFull(selectedDate) || selectedDate;
  const currentTimeLabel = formatAppointmentTimeLabel(doctorInfo?.time);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <Pressable style={styles.overlay} onPress={onClose} />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>ONE-TIME CHANGE</Text>
              <Text style={styles.title}>
                {isRescheduleRequest ? 'Confirm new slot' : 'Reschedule visit'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <TablerIcon name="x" size={18} color={MUTED} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.doctorCard}>
              <Text style={styles.doctorName} numberOfLines={1}>
                {doctorInfo?.name}
              </Text>
              {doctorInfo?.specialty ? (
                <Text style={styles.doctorSpeciality} numberOfLines={1}>
                  {doctorInfo.specialty}
                </Text>
              ) : null}
              <View style={styles.currentChip}>
                <TablerIcon name="calendar" size={14} color={GREEN} />
                <Text style={styles.currentChipText}>
                  Current · {formatAppointmentDateFull(doctorInfo?.date) || doctorInfo?.date}
                  {currentTimeLabel ? ` · ${currentTimeLabel}` : ''}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>NEW DATE</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.88}
            >
              <TablerIcon name="calendar" size={18} color={GREEN} />
              <Text style={styles.dateText}>
                {currentDateLabel || 'Pick a date'}
              </Text>
              <TablerIcon name="chevron-down" size={16} color={MUTED} />
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>AVAILABLE SLOTS</Text>
              {loadingSlots ? (
                <ActivityIndicator size="small" color={GREEN} />
              ) : (
                <Text style={styles.slotCount}>
                  {availableSlots.length} open
                </Text>
              )}
            </View>

            {slotsError ? (
              <TouchableOpacity
                style={styles.retryBox}
                onPress={() => fetchSlotsForDate(selectedDate)}
              >
                <Text style={styles.retryText}>{slotsError}</Text>
                <Text style={styles.retryAction}>Tap to retry</Text>
              </TouchableOpacity>
            ) : loadingSlots && availableSlots.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={GREEN} />
                <Text style={styles.loadingText}>Loading slots…</Text>
              </View>
            ) : availableSlots.length > 0 ? (
              <View style={styles.slotContainer}>
                {availableSlots.map(slot => {
                  const selected = selectedSlot?.id === slot.id;
                  return (
                    <TouchableOpacity
                      key={String(slot.id)}
                      onPress={() => setSelectedSlot(slot)}
                      activeOpacity={0.88}
                      style={[
                        styles.slotButton,
                        selected && styles.selectedSlot,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          selected && styles.selectedSlotText,
                        ]}
                      >
                        {formatAppointmentTimeLabel(slot?.start_time) ||
                          slot?.start_time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No open slots on this day</Text>
                <Text style={styles.emptyHint}>Try another date</Text>
              </View>
            )}

            {!isRescheduleRequest ? (
              <>
                <Text style={[styles.sectionLabel, styles.reasonLabel]}>
                  REASON
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Why do you need a new time?"
                  placeholderTextColor="#94A3B8"
                  multiline
                  style={styles.input}
                />
              </>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            disabled={!canSubmit}
            activeOpacity={0.9}
            style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
          >
            <Text style={styles.primaryText}>
              {isRescheduleRequest ? 'Confirm slot' : 'Confirm reschedule'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryText}>Close</Text>
          </TouchableOpacity>

          <DateTimePicker
            isVisible={showCalendar}
            mode="date"
            minimumDate={new Date()}
            date={
              selectedDate
                ? new Date(`${selectedDate}T12:00:00`)
                : new Date()
            }
            onConfirm={date => {
              setShowCalendar(false);
              const next = date.toISOString().split('T')[0];
              setSelectedDate(next);
              setSelectedSlot(null);
            }}
            onCancel={() => setShowCalendar(false)}
          />
        </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default React.memo(RescheduleModal);

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1DED8',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerCopy: { flex: 1, paddingRight: 10 },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: GREEN,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Fonts.PoppinsSemiBold,
    color: INK,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 12,
  },
  doctorCard: {
    backgroundColor: GREEN_SOFT,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: LINE,
    marginBottom: 18,
  },
  doctorName: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: INK,
  },
  doctorSpeciality: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
  },
  currentChip: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentChipText: {
    flex: 1,
    fontSize: 12,
    color: GREEN,
    fontFamily: Fonts.PoppinsMedium,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: MUTED,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotCount: {
    fontSize: 11,
    color: MUTED,
    fontFamily: Fonts.PoppinsMedium,
  },
  dateSelector: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FAFCFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 18,
  },
  dateText: {
    flex: 1,
    color: INK,
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },
  loadingBox: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: MUTED,
  },
  retryBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    padding: 14,
    marginBottom: 8,
  },
  retryText: {
    fontSize: 13,
    color: '#B91C1C',
    fontFamily: Fonts.PoppinsMedium,
  },
  retryAction: {
    marginTop: 4,
    fontSize: 12,
    color: GREEN,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: INK,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
  },
  emptyHint: {
    marginTop: 4,
    color: MUTED,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  slotButton: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  slotText: {
    color: INK,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
  },
  selectedSlotText: {
    color: '#FFFFFF',
  },
  reasonLabel: {
    marginTop: 14,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 14,
    padding: 12,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 14,
    color: INK,
    textAlignVertical: 'top',
    backgroundColor: '#FAFCFB',
  },
  primaryBtn: {
    backgroundColor: GREEN,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
  },
  secondaryBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 6,
  },
  secondaryText: {
    color: MUTED,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
  },
});
