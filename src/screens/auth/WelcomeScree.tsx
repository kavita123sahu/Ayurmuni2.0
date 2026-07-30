import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  Dimensions,
  Easing,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Videos } from '../../common/Videos';
import { Ionicons } from '../../common/Vector';

const { width: SW, height: SH } = Dimensions.get('window');

type StorySlide =
  | {
      key: string;
      kind: 'video';
      title: string;
      body: string;
    }
  | {
      key: string;
      kind: 'image';
      source: any;
      title: string;
      body: string;
    };

const STORIES: StorySlide[] = [
  {
    key: 'video',
    kind: 'video',
    title: 'Your Ayurveda companion',
    body: 'A calm digital path that brings Prakriti wisdom, doctors, and remedies into one place.',
  },
  {
    key: 'consult',
    kind: 'image',
    source: Images.login1,
    title: 'Consult with clarity',
    body: 'Meet Ayurvedic doctors for concerns that matter — guided by your body nature, not generic advice.',
  },
  {
    key: 'remedy',
    kind: 'image',
    source: Images.login14,
    title: 'Remedies that fit you',
    body: 'Discover medicines and routines matched to your constitution and daily balance.',
  },
  {
    key: 'practice',
    kind: 'image',
    source: Images.login6,
    title: 'Practice & restore',
    body: 'Yoga, diet, and mindful care — designed to keep mind, body, and spirit in harmony.',
  },
  {
    key: 'journey',
    kind: 'image',
    source: Images.login7,
    title: 'Begin with intention',
    body: 'Ancient science. Modern care. Start your Ayurmuni journey in a few quiet steps.',
  },
];

/**
 * Elegant Welcome — sliding story (video + images) explaining the app,
 * brand-forward, tight composition.
 */
const WelcomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeIn, rise, logoPulse]);

  const goTo = useCallback((next: number) => {
    const clamped = ((next % STORIES.length) + STORIES.length) % STORIES.length;
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  }, []);

  useEffect(() => {
    autoTimer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % STORIES.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4200);
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, []);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SW);
    if (next !== index) setIndex(next);
  };

  const handleGetStarted = () => {
    Animated.sequence([
      Animated.timing(ctaScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(ctaScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('AuthStack', { screen: 'Login' });
    });
  };

  const topPad = Math.max(insets.top, 12) + 4;
  const bottomPad = Math.max(insets.bottom, 10) + 8;
  const active = STORIES[index] ?? STORIES[0];

  const renderSlide = ({ item }: { item: StorySlide }) => (
    <View style={styles.slide}>
      {item.kind === 'video' && !videoFailed ? (
        <>
          <Image
            source={Images.BackgroundImage}
            style={styles.slideMedia}
            resizeMode="cover"
          />
          <Video
            source={Videos.welcome}
            style={[styles.slideMedia, { opacity: videoReady ? 1 : 0 }]}
            resizeMode="cover"
            repeat
            muted
            paused={index !== 0}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="obey"
            controls={false}
            disableFocus
            shutterColor="transparent"
            onReadyForDisplay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          />
        </>
      ) : (
        <Image
          source={item.kind === 'image' ? item.source : Images.BackgroundImage}
          style={styles.slideMedia}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={[
          'rgba(3, 22, 18, 0.15)',
          'rgba(3, 22, 18, 0.45)',
          'rgba(3, 22, 18, 0.92)',
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        ref={listRef}
        data={STORIES}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={renderSlide}
        getItemLayout={(_, i) => ({
          length: SW,
          offset: SW * i,
          index: i,
        })}
        onScrollToIndexFailed={() => {}}
      />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            paddingTop: topPad,
            paddingBottom: bottomPad,
            opacity: fadeIn,
            transform: [{ translateY: rise }],
          },
        ]}
      >
        <View style={styles.brandRow}>
          <Animated.Image
            source={Images.FinalLogo}
            style={[styles.logo, { transform: [{ scale: logoPulse }] }]}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.wordmark}>AYURMUNI</Text>
            <Text style={styles.tagline}>ANCIENT WISDOM · MODERN WELLNESS</Text>
          </View>
        </View>

        <View style={styles.storyPanel}>
          <Text style={styles.storyKicker}>
            {String(index + 1).padStart(2, '0')} / {String(STORIES.length).padStart(2, '0')}
          </Text>
          <Text style={styles.storyTitle}>{active.title}</Text>
          <Text style={styles.storyBody}>{active.body}</Text>

          <View style={styles.progressRow}>
            {STORIES.map((s, i) => (
              <TouchableOpacity
                key={s.key}
                style={styles.progressHit}
                onPress={() => goTo(i)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.progressTrack,
                    i === index && styles.progressActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.9}
              onPress={handleGetStarted}
            >
              <Text style={styles.ctaText}>Begin Your Journey</Text>
              <Ionicons name="arrow-forward" size={18} color="#1A2E28" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#04201A',
  },
  slide: {
    width: SW,
    height: SH,
  },
  slideMedia: {
    ...StyleSheet.absoluteFillObject,
    width: SW,
    height: SH,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
  },
  wordmark: {
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 2.4,
  },
  tagline: {
    marginTop: 1,
    fontSize: 9,
    letterSpacing: 1.2,
    color: 'rgba(247, 244, 236, 0.72)',
    fontFamily: Fonts.PoppinsMedium,
  },
  storyPanel: {
    gap: 10,
  },
  storyKicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(212, 168, 75, 0.95)',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  storyTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    maxWidth: SW * 0.9,
  },
  storyBody: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(247, 244, 236, 0.86)',
    fontFamily: Fonts.PoppinsRegular,
    maxWidth: SW * 0.92,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  progressHit: {
    flex: 1,
    paddingVertical: 8,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressActive: {
    backgroundColor: '#D4A84B',
  },
  cta: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D4A84B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D4A84B',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaText: {
    fontSize: 16,
    color: '#1A2E28',
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.2,
  },
});
