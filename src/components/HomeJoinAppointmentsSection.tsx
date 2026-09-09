import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';
import JoinCallBanner from './JoinCallBanner';
import RenderAppoint from './RenderAppoint';
import { HorizontalAppointmentSkeleton } from '../simmerScreen/ShimmerHook';
import {
  getJoinableAppointment,
  sortAppointmentsByDateTime,
} from '../utils/appointmentUtils';
import { requireAuth } from '../services/guestAuth';
import { HOME_SECTION_GAP } from '../constants/layout';

type Props = {
  appointments: any[];
  endedCallIds: Set<string>;
  loading: boolean;
  navigation: any;
};

/** Owns its own timer so HomePage is not re-rendered every few seconds. */
const HomeJoinAppointmentsSection = ({
  appointments,
  endedCallIds,
  loading,
  navigation,
}: Props) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  const sortedUpcoming = useMemo(
    () =>
      sortAppointmentsByDateTime(
        (appointments || []).filter(item => {
          const status = String(item?.status || '')
            .trim()
            .toLowerCase();
          return status === 'confirmed';
        }),
      ),
    [appointments],
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
    return getJoinableAppointment(bannerSource, 5);
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
  },
});

export default memo(HomeJoinAppointmentsSection);
