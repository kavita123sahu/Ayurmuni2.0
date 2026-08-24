import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  StatusBar,
  LayoutChangeEvent,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TablerIcon from './TablerIcon';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { formatYogaTime } from '../utils/yogaUtils';

type Props = {
  videoUri: string | null;
  posterUri?: string;
  seekTo?: number | null;
  onSeekHandled?: () => void;
};

const VOLUME_STEP = 0.2;

const YogaVideoPlayer = ({
  videoUri,
  posterUri,
  seekTo,
  onSeekHandled,
}: Props) => {
  const insets = useSafeAreaInsets();
  const inlineRef = useRef<VideoRef>(null);
  const fullRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [barWidth, setBarWidth] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);

  const activeRef = fullscreen ? fullRef : inlineRef;

  useEffect(() => {
    if (seekTo == null || !Number.isFinite(seekTo)) return;
    activeRef.current?.seek(Math.max(0, seekTo));
    setPaused(false);
    setCurrent(seekTo);
    onSeekHandled?.();
  }, [seekTo, fullscreen, onSeekHandled, activeRef]);

  useEffect(() => {
    if (!controlsVisible || paused) return;
    const t = setTimeout(() => setControlsVisible(false), 3200);
    return () => clearTimeout(t);
  }, [controlsVisible, paused]);

  const bumpVolume = useCallback((delta: number) => {
    setMuted(false);
    setVolume(v => Math.min(1, Math.max(0, Number((v + delta).toFixed(2)))));
  }, []);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(Math.max(1, e.nativeEvent.layout.width));
  };

  const seekFromX = (x: number) => {
    if (!duration) return;
    const ratio = Math.min(1, Math.max(0, x / barWidth));
    const next = ratio * duration;
    activeRef.current?.seek(next);
    setCurrent(next);
  };

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  const renderVideo = (isFull: boolean) => (
    <Video
      ref={isFull ? fullRef : inlineRef}
      source={{ uri: videoUri as string }}
      style={styles.video}
      resizeMode={isFull ? 'contain' : 'cover'}
      paused={paused}
      muted={muted}
      volume={volume}
      controls={false}
      repeat={false}
      poster={posterUri || undefined}
      playInBackground={false}
      playWhenInactive={false}
      ignoreSilentSwitch="ignore"
      onError={() => setFailed(true)}
      onLoad={meta => {
        setDuration(Number(meta?.duration) || 0);
        if (current > 0) {
          (isFull ? fullRef : inlineRef).current?.seek(current);
        }
      }}
      onProgress={p => setCurrent(Number(p?.currentTime) || 0)}
      onEnd={() => {
        setPaused(true);
        setCurrent(duration);
        setControlsVisible(true);
      }}
    />
  );

  const renderControls = (isFull: boolean) => {
    if (!controlsVisible && !paused) return null;
    return (
      <View
        style={[
          styles.overlay,
          isFull && { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
        ]}
        pointerEvents="box-none"
      >
        {isFull ? (
          <Pressable
            style={styles.topBtn}
            onPress={() => setFullscreen(false)}
            hitSlop={10}
          >
            <TablerIcon name="minimize" size={18} color="#FFFFFF" />
            <Text style={styles.topBtnText}>Minimize</Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable
          style={styles.centerPlay}
          onPress={() => setPaused(p => !p)}
        >
          <View style={styles.centerPlayInner}>
            <TablerIcon
              name={paused ? 'play' : 'pause'}
              size={28}
              color="#FFFFFF"
            />
          </View>
        </Pressable>

        <View style={styles.bottomBar}>
          <Pressable onPress={() => setPaused(p => !p)} hitSlop={8}>
            <TablerIcon
              name={paused ? 'play' : 'pause'}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.time}>{formatYogaTime(current)}</Text>

          <Pressable
            style={styles.progressHit}
            onLayout={onBarLayout}
            onPress={e => seekFromX(e.nativeEvent.locationX)}
          >
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </Pressable>

          <Text style={styles.time}>{formatYogaTime(duration)}</Text>

          <Pressable onPress={() => bumpVolume(-VOLUME_STEP)} hitSlop={8}>
            <TablerIcon name="minus" size={16} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => setMuted(m => !m)} hitSlop={8}>
            <TablerIcon
              name={muted || volume <= 0.01 ? 'volume-off' : 'volume'}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
          <Pressable onPress={() => bumpVolume(VOLUME_STEP)} hitSlop={8}>
            <TablerIcon name="plus" size={16} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={() => setFullscreen(v => !v)}
            hitSlop={8}
          >
            <TablerIcon
              name={isFull ? 'minimize' : 'maximize'}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const poster = posterUri ? { uri: posterUri } : Images.doctorImage;

  if (!videoUri || failed) {
    return (
      <View style={styles.frame}>
        <Image source={poster} style={styles.video} resizeMode="cover" />
        <View style={styles.fallback}>
          <TablerIcon name="video" size={28} color="#FFFFFF" />
          <Text style={styles.fallbackText}>Video unavailable</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Pressable
        style={styles.frame}
        onPress={() => setControlsVisible(v => !v)}
      >
        {renderVideo(false)}
        {renderControls(false)}
      </Pressable>

      <Modal
        visible={fullscreen}
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => setFullscreen(false)}
      >
        <StatusBar hidden />
        <Pressable
          style={styles.fullScreen}
          onPress={() => setControlsVisible(v => !v)}
        >
          {renderVideo(true)}
          {renderControls(true)}
        </Pressable>
      </Modal>
    </>
  );
};

export default React.memo(YogaVideoPlayer);

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  topBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
  centerPlay: {
    alignSelf: 'center',
  },
  centerPlayInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(15,23,42,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  time: {
    color: '#E2E8F0',
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    minWidth: 34,
  },
  progressHit: {
    flex: 1,
    height: 22,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34D399',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    gap: 8,
  },
  fallbackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
});
