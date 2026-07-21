import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RtcSurfaceView, RenderModeType } from 'react-native-agora';
import { MaterialIcons } from '../common/Vector';
import { useVideoCall } from '../context/VideoCallContext';

const PIP_WIDTH = 120;
const PIP_HEIGHT = 168;
const EDGE = 16;
const TAB_BAR_OFFSET = 72;

const FloatingVideoOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const positionRef = useRef({ x: 0, y: 0 });
  const lastAppointmentIdRef = useRef<string | null>(null);

  const {
    viewMode,
    callParams,
    isJoined,
    remoteUid,
    isCameraOn,
    callSeconds,
    displayName,
    initials,
    otherPartyImage,
    expandCall,
    endCall,
    formatDuration,
  } = useVideoCall();

  const bounds = useMemo(
    () => ({
      minX: EDGE,
      maxX: Math.max(EDGE, screenW - PIP_WIDTH - EDGE),
      minY: insets.top + EDGE,
      maxY: Math.max(
        insets.top + EDGE,
        screenH - PIP_HEIGHT - Math.max(insets.bottom, EDGE) - TAB_BAR_OFFSET,
      ),
    }),
    [screenW, screenH, insets.top, insets.bottom],
  );

  const setPosition = useCallback(
    (x: number, y: number, animated = false) => {
      const clampedX = Math.min(bounds.maxX, Math.max(bounds.minX, x));
      const clampedY = Math.min(bounds.maxY, Math.max(bounds.minY, y));
      positionRef.current = { x: clampedX, y: clampedY };

      if (animated) {
        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
          friction: 7,
          tension: 42,
        }).start();
      } else {
        pan.setValue({ x: clampedX, y: clampedY });
      }
    },
    [bounds, pan],
  );

  const resetToDefault = useCallback(() => {
    setPosition(bounds.maxX, bounds.maxY, false);
  }, [bounds.maxX, bounds.maxY, setPosition]);

  useEffect(() => {
    if (viewMode !== 'minimized' || !callParams) {
      return;
    }

    const isNewCall = lastAppointmentIdRef.current !== callParams.appointmentId;
    lastAppointmentIdRef.current = callParams.appointmentId;

    if (isNewCall) {
      resetToDefault();
      return;
    }

    setPosition(positionRef.current.x, positionRef.current.y, false);
  }, [viewMode, callParams, resetToDefault, setPosition]);

  useEffect(() => {
    if (viewMode === 'minimized') {
      setPosition(positionRef.current.x, positionRef.current.y, false);
    }
  }, [screenW, screenH, insets.top, insets.bottom, viewMode, setPosition]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => {
          pan.setOffset({
            // @ts-expect-error Animated internal value
            x: pan.x._value,
            // @ts-expect-error Animated internal value
            y: pan.y._value,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          pan.flattenOffset();

          // @ts-expect-error Animated internal value
          let x = pan.x._value as number;
          // @ts-expect-error Animated internal value
          let y = pan.y._value as number;

          x = Math.min(bounds.maxX, Math.max(bounds.minX, x));
          y = Math.min(bounds.maxY, Math.max(bounds.minY, y));

          const snapRight = x + PIP_WIDTH / 2 >= screenW / 2;
          x = snapRight ? bounds.maxX : bounds.minX;

          setPosition(x, y, true);

          const moved = Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8;
          if (!moved) {
            expandCall();
          }
        },
      }),
    [bounds, expandCall, pan, screenW, setPosition],
  );

  if (viewMode !== 'minimized' || !callParams) {
    return null;
  }

  const showRemote = remoteUid !== null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.pipContainer,
          { transform: pan.getTranslateTransform() },
        ]}
      >
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle}>
            <MaterialIcons name="drag-indicator" size={16} color="rgba(255,255,255,0.85)" />
          </View>

          <View style={styles.videoArea}>
            {showRemote ? (
              <RtcSurfaceView
                canvas={{ uid: remoteUid!, renderMode: RenderModeType.RenderModeFit }}
                style={styles.video}
                zOrderMediaOverlay
              />
            ) : isJoined && isCameraOn ? (
              <RtcSurfaceView
                canvas={{ uid: 0, renderMode: RenderModeType.RenderModeFit }}
                style={styles.video}
                zOrderMediaOverlay
              />
            ) : otherPartyImage ? (
              <Image source={{ uri: otherPartyImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials || '?'}</Text>
              </View>
            )}

            <View style={styles.topBar} pointerEvents="none">
              <View style={styles.liveDot} />
              <Text style={styles.durationText} numberOfLines={1}>
                {remoteUid !== null ? formatDuration(callSeconds) : 'Connecting...'}
              </Text>
            </View>

            <View style={styles.expandHint} pointerEvents="none">
              <MaterialIcons name="open-in-full" size={12} color="#fff" />
            </View>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.nameText} numberOfLines={1}>
            {displayName}
          </Text>
          <TouchableOpacity
            style={styles.endBtn}
            onPress={endCall}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="call-end" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  pipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#17171d',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
    }),
  },
  draggableArea: {
    flex: 1,
  },
  dragHandle: {
    height: 22,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  videoArea: {
    flex: 1,
  },
  video: {
    flex: 1,
    backgroundColor: '#111',
  },
  avatar: {
    flex: 1,
    backgroundColor: '#2a2a33',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    top: 26,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3ddc84',
    marginRight: 5,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  nameText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  endBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandHint: {
    position: 'absolute',
    bottom: 8,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    padding: 3,
  },
});

export default FloatingVideoOverlay;
