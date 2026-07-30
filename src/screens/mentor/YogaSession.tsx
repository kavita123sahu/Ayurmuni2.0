import { FlatList, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import SessionCard from '../../components/SessionCard';
import React, { useMemo, useState } from 'react';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import MentorCard from '../../components/MentorCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import TablerIcon from '../../components/TablerIcon';

const resolveSessionVideo = (item: any): string | null => {
  const candidates = [
    item?.video_url,
    item?.session_video,
    item?.session_video_url,
    item?.preview_video,
    item?.preview_video_url,
    item?.media_url,
    item?.video,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
};

export default function YogaSession(props: any) {
  const sessionItem = props?.route?.params?.item;
  const videoUri = useMemo(
    () => resolveSessionVideo(sessionItem),
    [sessionItem],
  );
  const [videoFailed, setVideoFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { id: '1', title: 'Sun Salutation B', time: '15:00', isActive: true },
    { id: '2', title: 'Warrior I Variation', time: '22:15', isActive: false },
    { id: '3', title: 'Downward Facing Dog', time: '28:40', isActive: false },
    { id: '4', title: 'Triangle Pose (Trikonasana)', time: '34:10', isActive: false },
    { id: '5', title: 'Deep Savasana Recovery', time: '40:00', isActive: false },
  ];

  const Header = React.memo(() => {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.videoContainer}>
          {videoUri && !videoFailed ? (
            <Video
              source={{ uri: videoUri }}
              style={styles.video}
              resizeMode="cover"
              controls
              muted={false}
              paused={false}
              repeat
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="obey"
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <View style={styles.videoFallback}>
              <Image
                source={
                  sessionItem?.thumbnail_url
                    ? { uri: sessionItem.thumbnail_url }
                    : Images.doctorImage
                }
                style={styles.video}
                resizeMode="cover"
              />
              <View style={styles.videoOverlayIcon}>
                <TablerIcon name="video" size={28} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={[styles.badge, { backgroundColor: '#0D614E1A' }]}>
            <Text style={[styles.text, { color: Colors.primaryColor }]}>
              {(sessionItem?.difficulty || 'ADVANCED').toString().toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: Colors.bgcolor }]}>
            <Text style={[styles.text, { color: Colors.subTextColor }]}>
              {sessionItem?.duration || '45 MIN'}
            </Text>
          </View>
        </View>

        <Text style={styles.Header}>
          {sessionItem?.title || sessionItem?.name || 'Morning Vitality Flow'}
        </Text>

        <Text style={styles.SubHeader}>
          {sessionItem?.short_description ||
            sessionItem?.description ||
            'A rigorous sequence designed to awaken your cellular energy, focus the mind, and prepare the body for peak performance.'}
        </Text>

        <View style={styles.textInput}>
          <TablerIcon name="notes" size={20} color={Colors.primaryColor} />
          <Text
            style={[
              styles.text,
              {
                marginLeft: 10,
                fontSize: 14,
                fontFamily: Fonts.PoppinsSemiBold,
              },
            ]}
          >
            Notes
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: 30,
            marginBottom: 20,
            alignItems: 'center',
          }}
        >
          <TablerIcon name="list" size={18} color={Colors.primaryColor} />
          <Text style={styles.Section}>Session Breakdown</Text>
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFFCC" />

      <AppHeader
        title="Yoga Session"
        onLeftPress={() => props.navigation.goBack()}
      />

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
        ListHeaderComponent={<Header />}
        ListFooterComponent={
          <MentorCard
            name="Guided by Master Elena"
            subtitle="Clinical Yoga Specialist • 15 Years Experience"
            description="Elena specializes in bio-mechanical alignment and mindful breathwork to optimize physical and mental resilience."
            image={Images.doctorImage}
            onPress={() => props.navigation.navigate('ConsultMentor')}
          />
        }
        renderItem={({ item, index }) => (
          <SessionCard
            index={index + 1}
            title={item.title}
            time={item.time}
            isActive={index === activeIndex}
            onPress={() => setActiveIndex(index)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Header: {
    fontSize: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    padding: 10,
  },
  text: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  Section: {
    fontSize: 18,
    marginLeft: 5,
    textAlign: 'center',
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#0F172A',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoFallback: {
    flex: 1,
  },
  videoOverlayIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  textInput: {
    backgroundColor: '#ffff',
    marginTop: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderColor: Colors.borderColor,
  },
  SubHeader: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
});
