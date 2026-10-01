import React, { memo, useEffect, useMemo, useState } from 'react';
import { AppState, View, FlatList, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';
import JoinCallBanner from './JoinCallBanner';
import RenderAppoint from './RenderAppoint';
import { HorizontalAppointmentSkeleton } from '../simmerScreen/ShimmerHook';
import {
  getJoinableAppointment,
  isActiveAppointmentStatus,
  isAppointmentInPast,
  sortAppointmentsByDateTime,
} from '../utils/appointmentUtils';
import { requireAuth } from '../services/guestAuth';
import { HOME_SECTION_GAP } from '../constants/layout';

type Props = {
  appointments: any[];
  endedCallIds: Set<string>;
  loading: boolean;
  navigation: any;
  /** Called when the app returns to foreground (refresh call_status). */
  onResume?: () => void;
};

/** Owns its own timer so HomePage is not re-rendered every few seconds. */
const HomeJoinAppointmentsSection = ({
  appointments,
  endedCallIds,
  loading,
  navigation,
  onResume,
}: Props) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 15_000);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setTick(t => t + 1);
        onResume?.();
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [onResume]);

  const sortedUpcoming = useMemo(
    () =>
      sortAppointmentsByDateTime(
        (appointments || []).filter(item => {
          const callLive =
            String(item?.call_status || '').toLowerCase() === 'in_progress';
          return (
            (callLive || isActiveAppointmentStatus(item?.status)) &&
            !isAppointmentInPast(item)
          );
        }),
      ),
    // tick drops appointments whose end_time has passed while Home stays open
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, tick],
  );

  const joinableAppointment = useMemo(() => {
    const bannerSource = sortedUpcoming.map(item => {
      const candidateIds = [
        item?.appointment_id,
        item?.consultation_id,
        item?.rawData?.id,
        item?.rawData?.appointment?.id,
        item?.rawData?.consultation_id,
      ]
        .map(v => String(v || '').trim())
        .filter(Boolean);
      const wasEnded = candidateIds.some(id => endedCallIds.has(id));
      if (!wasEnded) return item;
      return {
        ...item,
        call_status: 'ended',
        rawData: {
          ...(item.rawData ?? item),
          call_status: 'ended',
          appointment: {
            ...((item.rawData ?? item)?.appointment ?? {}),
            call_status: 'ended',
          },
        },
      };
    });
    const joinable = getJoinableAppointment(bannerSource, 5);
    console.log(
      'HOME_JOIN_BANNER =>',
      joinable
        ? `${joinable.item.doctorName} ${joinable.item.date} ${joinable.item.time} live=${joinable.isLive}`
        : 'none',
      '| upcoming =>',
      bannerSource.map(item => ({
        date: item?.date,
        time: item?.time,
        end: item?.endTime,
        status: item?.status,
        call: item?.call_status,
      })),
    );
    return joinable;
    // tick re-checks the ≤5 min join window without refreshing the whole home feed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedUpcoming, endedCallIds, tick]);

  const list = useMemo(() => {
    if (!joinableAppointment) return sortedUpcoming;
    const joinId = joinableAppointment.item.consultation_id;
    return sortedUpcoming.filter(item => item.consultation_id !== joinId);
  }, [sortedUpcoming, joinableAppointment]);

  if (!joinableAppointment && !loading && list.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        home
        title="Upcoming Appointments"
        actionText={!loading && sortedUpcoming.length > 1 ? 'View all' : ''}
        onPress={async () => {
          if (await requireAuth('Please login to view appointments')) {
            navigation.navigate('Appointments', { mode: 'upcoming' });
          }
        }}
      />
      {loading ? (
        <HorizontalAppointmentSkeleton />
      ) : (
        <>
          {joinableAppointment ? (
            <JoinCallBanner
              joinable={joinableAppointment}
              navigation={navigation}
            />
          ) : null}
          {list.length > 0 ? (
            <FlatList
              horizontal
              data={list}
              keyExtractor={(item, index) =>
                `${item?.consultation_id || index}`
              }
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <RenderAppoint
                  item={item}
                  navigation={navigation}
                  isHorizontal
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
    // marginBottom: HOME_SECTION_GAP,
  },
  horizontalList: {
    paddingRight: 8,
    paddingBottom: 1,
  },
});

export default memo(HomeJoinAppointmentsSection);
