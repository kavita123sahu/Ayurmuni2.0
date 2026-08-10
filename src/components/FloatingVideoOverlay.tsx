import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RtcSurfaceView, RenderModeType } from 'react-native-agora';
import { MaterialIcons } from '../common/Vector';
import { useVideoCall } from '../context/VideoCallContext';
import { navigationRef } from '../navigation/navigationRef';
import { popVideoCallAndGoToAppointments } from '../navigation/navigationUtils';

const PIP_WIDTH = 148;
const PIP_HEIGHT = 214;
const EDGE_MARGIN = 14;
const TAB_CLEARANCE = 78;
const TAP_SLOP = 8;

/** Remember last PiP spot across minimize / expand. */
let savedPipX: number | null = null;
let savedPipY: number | null = null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Absolute PiP with PanResponder drag.
 * Do NOT use Agora zOrderOnTop here — it creates a native surface above RN
 * and steals all touches (drag/tap stop working).
 */
const FloatingVideoOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
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

  const visible = viewMode === 'minimized' && !!callParams;
  const showRemote = remoteUid !== null;

  const minX = EDGE_MARGIN;
  const maxX = Math.max(minX, screenW - PIP_WIDTH - EDGE_MARGIN);
  const minY = insets.top + 8;
  const maxY = Math.max(
    minY,
    screenH - PIP_HEIGHT - Math.max(insets.bottom, 12) - TAB_CLEARANCE,
  );

  const defaultX = maxX;
  const defaultY = maxY;

  const [pos, setPos] = useState(() => ({
    x: clamp(savedPipX ?? defaultX, minX, maxX),
    y: clamp(savedPipY ?? defaultY, minY, maxY),
  }));

  const posRef = useRef(pos);
  posRef.current = pos;

  const dragOrigin = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const boundsRef = useRef({ minX, maxX, minY, maxY, screenW });
  boundsRef.current = { minX, maxX, minY, maxY, screenW };

  useEffect(() => {
    if (!visible) return;
    const next = {
      x: clamp(savedPipX ?? defaultX, minX, maxX),
      y: clamp(savedPipY ?? defaultY, minY, maxY),
    };
    savedPipX = next.x;
    savedPipY = next.y;
    posRef.current = next;
    setPos(next);
  }, [visible, minX, maxX, minY, maxY, defaultX, defaultY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          dragOrigin.current = {
            x: posRef.current.x,
            y: posRef.current.y,
          };
          movedRef.current = false;
        },
        onPanResponderMove: (_, g) => {
          if (Math.abs(g.dx) > TAP_SLOP || Math.abs(g.dy) > TAP_SLOP) {
            movedRef.current = true;
          }
          const { minX: loX, maxX: hiX, minY: loY, maxY: hiY } =
            boundsRef.current;
          const next = {
            x: clamp(dragOrigin.current.x + g.dx, loX, hiX),
            y: clamp(dragOrigin.current.y + g.dy, loY, hiY),
          };
          posRef.current = next;
          setPos(next);
        },
        onPanResponderRelease: () => {
          const { minX: loX, maxX: hiX, minY: loY, maxY: hiY, screenW: w } =
            boundsRef.current;

          if (!movedRef.current) {
            expandCall();
            return;
          }

          const snapLeft = posRef.current.x + PIP_WIDTH / 2 < w / 2;
          const next = {
            x: snapLeft ? loX : hiX,
            y: clamp(posRef.current.y, loY, hiY),
          };
          posRef.current = next;
          savedPipX = next.x;
          savedPipY = next.y;
          setPos(next);
        },
      }),
    [expandCall],
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View
        style={[
          styles.pipContainer,
          { left: pos.x, top: pos.y },
        ]}
        pointerEvents="auto"
      >
        {/* Video underlay — no zOrderOnTop so RN can receive touches */}
        {showRemote ? (
          <RtcSurfaceView
            key={`pip-remote-${remoteUid}`}
            canvas={{
              uid: remoteUid!,
              renderMode: RenderModeType.RenderModeHidden,
            }}
            style={styles.video}
            pointerEvents="none"
          />
        ) : isJoined && isCameraOn ? (
          <RtcSurfaceView
            key="pip-local"
            canvas={{
              uid: 0,
              renderMode: RenderModeType.RenderModeHidden,
            }}
            style={styles.video}
            pointerEvents="none"
          />
        ) : otherPartyImage ? (
          <Image
            source={{ uri: otherPartyImage }}
            style={styles.avatar}
            // pointerEvents="none"
          />
        ) : (
          <View style={styles.avatarFallback} pointerEvents="none">
            <Text style={styles.avatarInitials}>{initials || '?'}</Text>
          </View>
        )}

        {/* Transparent drag / tap layer above native video */}
        <View style={styles.touchLayer} {...panResponder.panHandlers}>
          <View style={styles.topBar} pointerEvents="none">
            <View style={styles.liveDot} />
            <Text style={styles.durationText} numberOfLines={1}>
              {remoteUid !== null
                ? formatDuration(callSeconds)
                : 'Connecting...'}
            </Text>
            <View style={styles.expandChip}>
              <MaterialIcons name="open-in-full" size={13} color="#fff" />
            </View>
          </View>

          <View style={styles.bottomBar} pointerEvents="none">
            <View style={styles.nameBlock}>
              <Text style={styles.nameText} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.hintText}>Drag to move · Tap to expand</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.endBtn}
          onPress={async () => {
            await endCall();
            if (navigationRef.isReady()) {
              popVideoCallAndGoToAppointments(navigationRef);
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="call-end" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 0,
  },
  pipContainer: {
    position: 'absolute',
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#121218',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.42)',
    zIndex: 10000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 12 },
    }),
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0d12',
  },
  avatar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2a2a33',
  },
  avatarFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D614E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.58)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3ddc84',
    marginRight: 6,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  expandChip: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingRight: 48,
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  hintText: {
    marginTop: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
  },
  endBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
});

export default FloatingVideoOverlay;
