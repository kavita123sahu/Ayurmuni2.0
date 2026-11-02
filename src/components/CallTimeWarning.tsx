import React, { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '../common/Vector';
import * as _CONSULT_SERVICE from '../services/ConsultServce';
import {
  formatAppointmentTimeLabel,
  getAppointmentSlotMs,
  resolveAppointmentSlot,
} from '../utils/appointmentUtils';

type Slot = { date?: string; startTime?: string; endTime?: string };

type Props = {
  appointmentId?: string;
  consultationId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  /** Minutes before end_time when the warning appears. */
  warnMinutes?: number;
};

const TICK_MS = 15_000;

const readDetailSlot = (data: any): Slot => {
  const row = Array.isArray(data)
    ? data[0]
    : Array.isArray(data?.results)
      ? data.results[0]
      : data;
  return resolveAppointmentSlot(row);
};

/** "Only X min remaining" strip shown during the last minutes of the appointment slot. */
const CallTimeWarning = ({
  appointmentId,
  consultationId,
  appointmentDate,
  startTime,
  endTime,
  warnMinutes = 10,
}: Props) => {
  const [slot, setSlot] = useState<Slot>({
    date: appointmentDate,
    startTime,
    endTime,
  });
  const [now, setNow] = useState(Date.now());
  const [dismissedStage, setDismissedStage] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentDate && endTime) {
      setSlot({ date: appointmentDate, startTime, endTime });
      return;
    }
    const lookupId = consultationId || appointmentId;
    if (!lookupId) return;
    let cancelled = false;
    _CONSULT_SERVICE
      .getAppointmentDetail(lookupId)
      .then((res: any) => {
        if (cancelled || !res?.success) return;
        const fetched = readDetailSlot(res?.data);
        console.log('CALL_TIME_WARNING_SLOT =>', fetched);
        setSlot(prev => ({
          date: prev.date || fetched.date,
          startTime: prev.startTime || fetched.startTime,
          endTime: prev.endTime || fetched.endTime,
        }));
      })
      .catch((e: any) => console.log('CALL_TIME_WARNING_SLOT_ERROR', e));
    return () => {
      cancelled = true;
    };
  }, [appointmentId, consultationId, appointmentDate, startTime, endTime]);

  const { endMs } = getAppointmentSlotMs(slot.date, slot.startTime, slot.endTime);

  useEffect(() => {
    if (endMs == null) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [endMs]);

  if (endMs == null) return null;

  const msLeft = endMs - now;
  if (msLeft > warnMinutes * 60 * 1000) return null;

  const minutesLeft = Math.ceil(msLeft / 60000);
  const stage = minutesLeft <= 0 ? 'over' : minutesLeft <= 5 ? '5' : String(warnMinutes);
  if (dismissedStage === stage) return null;

  const isOver = minutesLeft <= 0;
  const endLabel = formatAppointmentTimeLabel(slot.endTime);
  const title = isOver
    ? 'Appointment time is over'
    : `You have only ${minutesLeft} min remaining`;
  const subtitle = isOver
    ? 'Please wrap up the consultation with the doctor.'
    : `Please complete your consultation${endLabel ? ` by ${endLabel}` : ''}.`;

  return (
    <View style={[styles.wrap, isOver && styles.wrapOver]}>
      <View style={[styles.iconWrap, isOver && styles.iconWrapOver]}>
        <MaterialIcons name="timer" size={18} color={isOver ? '#B91C1C' : '#B45309'} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, isOver && styles.titleOver]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setDismissedStage(stage)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="close" size={18} color="#78716C" />
      </TouchableOpacity>
    </View>
  );
};

export default memo(CallTimeWarning);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  wrapOver: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOver: {
    backgroundColor: '#FECACA',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
  titleOver: {
    color: '#B91C1C',
  },
  subtitle: {
    color: '#57534E',
    fontSize: 11.5,
    marginTop: 1,
  },
});
