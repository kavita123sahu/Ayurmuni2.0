import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Image,
  Easing,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Videos } from '../../common/Videos';
import { Ionicons } from '../../common/Vector';

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

/** Journey: consult → medicine → delivery → lab → diet → yoga */
const STORIES: StorySlide[] = [
  {
    key: 'video',
    kind: 'video',
    title: 'Your Ayurmuni journey',
    body: 'Consult, medicine, delivery, labs, diet, and yoga — one calm path from care to daily practice.',
  },
  {
    key: 'consult',
    kind: 'image',
    source: Images.journeyConsult,
    title: 'Consult with a doctor',
    body: 'Meet Ayurvedic doctors for concerns that matter — guided by your Prakriti, not generic advice.',
  },
  {
    key: 'medicine',
    kind: 'image',
    source: Images.journeyMedicine,
    title: 'Medicines that fit you',
    body: 'Discover authentic Ayurvedic medicines matched to your constitution and care plan.',
  },
  {
    key: 'delivery',
    kind: 'image',
    source: Images.journeyDelivery,
    title: 'Delivery to your door',
    body: 'Remedies arrive with care — so healing reaches you without the rush.',
  },
  {
    key: 'lab',
    kind: 'image',
    source: Images.lab,
    title: 'Lab tests & clarity',
    body: 'Book diagnostics and follow results that keep your wellness journey informed.',
  },
  {
    key: 'diet',
    kind: 'image',
    source: Images.journeyDiet,
    title: 'Follow your diet',
    body: 'Personalized meal guidance to balance doshas and support everyday vitality.',
  },
  {
    key: 'yoga',
    kind: 'image',
    source: Images.journeyYoga,
    title: 'Practice yoga',
    body: 'Guided yoga and mindful movement to restore mind, body, and spirit.',
  },
];

/**
 * Elegant Welcome — sliding story (video + images) explaining the app,
 * brand-forward, tight composition.
 */
const IMAGE_AUTO_MS = 4200;

const WelcomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { width: SW, height: SH } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  const videoIndex = STORIES.findIndex(s => s.kind === 'video');

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

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
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 2000,
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
    if (clamped === videoIndex) {
      setVideoReady(false);
      setVideoKey(k => k + 1);
    }
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  }, [videoIndex]);

  // Auto-scroll images only — never skip the video before it finishes
  useEffect(() => {
    if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }

    const slide = STORIES[index];
    const onVideoSlide = slide?.kind === 'video' && !videoFailed;
    if (onVideoSlide) {
      return;
    }

    autoTimer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % STORIES.length;
        if (next === videoIndex) {
          setVideoReady(false);
          setVideoKey(k => k + 1);
        }
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, IMAGE_AUTO_MS);

    return () => {
      if (autoTimer.current) {
        clearInterval(autoTimer.current);
        autoTimer.current = null;
      }
    };
  }, [index, videoFailed, videoIndex]);

  const onVideoEnd = useCallback(() => {
    if (indexRef.current !== videoIndex) {
      return;
    }
    const next = (videoIndex + 1) % STORIES.length;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }, [videoIndex]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SW);
    if (next !== index && next >= 0 && next < STORIES.length) {
      if (next === videoIndex && index !== videoIndex) {
        setVideoReady(false);
        setVideoKey(k => k + 1);
      }
      setIndex(next);
    }
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
    <View style={[styles.slide, { width: SW, height: SH, backgroundColor: '#04201A' }]}>
      {item.kind === 'video' && !videoFailed ? (
        <>
          {!videoReady && (
            <View style={[styles.slideMedia, { width: SW, height: SH, backgroundColor: '#04201A' }]} />
          )}
          <Video
            key={`welcome-video-${videoKey}`}
            source={Videos.welcome}
            style={[styles.slideMedia, { width: SW, height: SH, opacity: videoReady ? 1 : 0 }]}
            resizeMode="contain"
            repeat={false}
            muted
            paused={index !== videoIndex}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="obey"
            controls={false}
            disableFocus
            shutterColor="transparent"
            onReadyForDisplay={() => setVideoReady(true)}
            onEnd={onVideoEnd}
            onError={() => setVideoFailed(true)}
          />
        </>
      ) : (
        <Image
          source={item.kind === 'image' ? item.source : Images.BackgroundImage}
          style={[styles.slideMedia, { width: SW, height: SH }]}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={
          item.kind === 'video'
            ? [
              'rgba(3, 22, 18, 0.02)',
              'rgba(3, 22, 18, 0.12)',
              'rgba(3, 22, 18, 0.82)',
            ]
            : [
              'rgba(3, 22, 18, 0.05)',
              'rgba(3, 22, 18, 0.2)',
              'rgba(3, 22, 18, 0.88)',
            ]
        }
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
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
        onScrollToIndexFailed={() => { }}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        removeClippedSubviews={false}
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
            <Text style={styles.tagline}>Your Ayurveda</Text>
          </View>
        </View>

        <View style={styles.storyPanel}>
          <Text style={styles.storyKicker}>
            {String(index + 1).padStart(2, '0')} / {String(STORIES.length).padStart(2, '0')}
          </Text>
          <Text style={[styles.storyTitle, { maxWidth: SW * 0.9 }]}>{active.title}</Text>
          <Text style={[styles.storyBody, { maxWidth: SW * 0.92 }]}>{active.body}</Text>

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
    overflow: 'hidden',
  },
  slideMedia: {
    ...StyleSheet.absoluteFillObject,
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
  },
  storyBody: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(247, 244, 236, 0.9)',
    fontFamily: Fonts.PoppinsRegular,
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
