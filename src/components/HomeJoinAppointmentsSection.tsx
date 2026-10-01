import React, { memo, useEffect, useMemo, useState } from 'react';
import { AppState, View, FlatList, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';
import JoinCallBanner from './JoinCallBanner';
import RenderAppoint from './RenderAppoint';
import { HorizontalAppointmentSkeleton } from '../simmerScreen/ShimmerHook';
import {
  getJoinableAppointment,
  getMsUntilJoinWindowChange,
  isActiveAppointmentStatus,
  isAppointmentInPast,
  sortAppointmentsByDateTime,
} from '../utils/appointmentUtils';
import { requireAuth } from '../services/guestAuth';
import { HOME_SECTION_GAP } from '../constants/layout';

type Props = {
  appointments: any[];
  /** Kept for API compatibility; the banner is now removed only by end_time. */
  endedCallIds?: Set<string>;
  loading: boolean;
  navigation: any;
  /** Called when the app returns to foreground (refresh call_status). */
  onResume?: () => void;
};

/** Owns its own timer so HomePage is not re-rendered every few seconds. */
const HomeJoinAppointmentsSection = ({
  appointments,
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

  // Banner keeps a just-completed slot until its end_time; the list does not
  const bannerCandidates = useMemo(
    () =>
      sortAppointmentsByDateTime(
        (appointments || []).filter(item => {
          const callLive =
            String(item?.call_status || '').toLowerCase() === 'in_progress';
          const completed =
            String(item?.status || '').toLowerCase() === 'completed';
          return (
            (callLive || completed || isActiveAppointmentStatus(item?.status)) &&
            !isAppointmentInPast(item)
          );
        }),
      ),
    // tick drops appointments whose end_time has passed while Home stays open
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, tick],
  );

  const sortedUpcoming = useMemo(
    () =>
      bannerCandidates.filter(
        item =>
          String(item?.call_status || '').toLowerCase() === 'in_progress' ||
          isActiveAppointmentStatus(item?.status),
      ),
    [bannerCandidates],
  );

  // Re-render exactly when the next banner window opens (start − 5 min) or closes (end_time)
  useEffect(() => {
    const waits = bannerCandidates
      .map(item => getMsUntilJoinWindowChange(item, 5))
      .filter((ms): ms is number => ms != null && ms > 0);
    if (!waits.length) return;
    const timer = setTimeout(
      () => setTick(t => t + 1),
      Math.min(Math.min(...waits) + 300, 55_000),
    );
    return () => clearTimeout(timer);
  }, [bannerCandidates, tick]);

  const joinableAppointment = useMemo(() => {
    const bannerSource = bannerCandidates;
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
  }, [bannerCandidates, tick]);

  const list = sortedUpcoming;

  if (!joinableAppointment && !loading && list.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      {!loading && joinableAppointment ? (
        <JoinCallBanner joinable={joinableAppointment} navigation={navigation} />
      ) : null}
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
