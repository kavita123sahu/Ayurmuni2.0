import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import SessionCard from '../../components/SessionCard';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import MentorCard from '../../components/MentorCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import TablerIcon from '../../components/TablerIcon';
import YogaVideoPlayer from '../../components/YogaVideoPlayer';
import * as _YOGA_SERVICES from '../../services/YogaServices';
import {
  getYogaInstructor,
  getYogaSessionBreakdown,
  mapYogaSessionForList,
  resolveYogaThumbnailUri,
  resolveYogaVideoUri,
} from '../../utils/yogaUtils';

export default function YogaSession(props: any) {
  const routeItem = props?.route?.params?.item;
  const [session, setSession] = useState<any>(routeItem || null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);

  useEffect(() => {
    const id = routeItem?.id;
    if (id == null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await _YOGA_SERVICES.getYogaSessionDetail(id);
        const mapped = mapYogaSessionForList(res?.data ?? res) || res?.data || res;
        if (!cancelled && mapped) {
          setSession((prev: any) => ({ ...(prev || {}), ...mapped }));
        }
      } catch {
        /* keep route item */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeItem?.id]);

  const videoUri = useMemo(() => resolveYogaVideoUri(session), [session]);
  const posterUri = useMemo(() => resolveYogaThumbnailUri(session), [session]);
  const breakdown = useMemo(() => getYogaSessionBreakdown(session), [session]);
  const instructor = useMemo(() => getYogaInstructor(session), [session]);

  const difficulty = String(
    session?.difficulty || session?.level || session?.production_level || '',
  ).trim();
  const durationLabel = String(
    session?.duration || session?.duration_minutes || '',
  ).trim();
  const notes = String(
    session?.notes || session?.instruction || session?.instructions || '',
  ).trim();

  const onPickStep = useCallback((index: number, startSeconds: number) => {
    setActiveIndex(index);
    setSeekTo(startSeconds);
  }, []);

  const Header = (
    <View>
      <View style={styles.videoWrap}>
        <YogaVideoPlayer
          videoUri={videoUri}
          posterUri={posterUri}
          seekTo={seekTo}
          onSeekHandled={() => setSeekTo(null)}
        />
      </View>

      <View style={styles.badgeRow}>
        {!!difficulty && (
          <View style={[styles.badge, styles.badgeLevel]}>
            <Text style={styles.badgeLevelText} numberOfLines={1}>
              {difficulty.toUpperCase()}
            </Text>
          </View>
        )}
        {!!durationLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {durationLabel}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {session?.title || session?.name || 'Yoga Session'}
      </Text>
      {!!(session?.short_description || session?.description) && (
        <Text style={styles.subtitle} numberOfLines={4}>
          {session?.short_description || session?.description}
        </Text>
      )}

      {!!notes && (
        <View style={styles.notesCard}>
          <TablerIcon name="notes" size={18} color={Colors.primaryColor} />
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      <View style={styles.sectionRow}>
        <TablerIcon name="list" size={18} color={Colors.primaryColor} />
        <Text style={styles.section}>Session Breakdown</Text>
      </View>
      {!breakdown.length ? (
        <Text style={styles.emptyBreakdown}>
          Pose-by-pose timing will appear here when this session includes a
          breakdown.
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Yoga Session"
        onLeftPress={() => props.navigation.goBack()}
      />
      <FlatList
        data={breakdown}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={Header}
        ListFooterComponent={
          instructor ? (
            <View style={styles.footer}>
              <MentorCard
                name={instructor.name}
                subtitle={instructor.subtitle || 'Yoga Mentor'}
                description={
                  instructor.description ||
                  'Guided alignment and breathwork for a complete session.'
                }
                image={
                  instructor.imageUri
                    ? { uri: instructor.imageUri }
                    : Images.doctorImage
                }
                onPress={() => props.navigation.navigate('ConsultMentor')}
              />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <SessionCard
            index={index + 1}
            title={item.title}
            time={item.time}
            isActive={index === activeIndex}
            onPress={() => onPickStep(index, item.startSeconds)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFDFB',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  videoWrap: {
    marginTop: 12,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLevel: {
    backgroundColor: '#E8F6F1',
  },
  badgeText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  badgeLevelText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
  },
  notesCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEEA',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    marginLeft: 6,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyBreakdown: {
    fontSize: 13,
    lineHeight: 20,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 8,
  },
  footer: {
    marginTop: 8,
  },
});
