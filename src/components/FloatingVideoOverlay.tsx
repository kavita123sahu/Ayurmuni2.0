import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RtcSurfaceView, RenderModeType } from 'react-native-agora';
import { MaterialIcons } from '../common/Vector';
import { useVideoCall } from '../context/VideoCallContext';

const FloatingVideoOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
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

  if (viewMode !== 'minimized' || !callParams) {
    return null;
  }

  const showRemote = remoteUid !== null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View
        style={[
          styles.pipContainer,
          { bottom: Math.max(insets.bottom, 16) + 72, right: 16 },
        ]} >
        <TouchableOpacity activeOpacity={0.92} style={styles.videoTapArea} onPress={expandCall}>
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

          <View style={styles.topBar}>
            <View style={styles.liveDot} />
            <Text style={styles.durationText} numberOfLines={1}>
              {remoteUid !== null ? formatDuration(callSeconds) : 'Connecting...'}
            </Text>
          </View>

          <View style={styles.expandHint}>
            <MaterialIcons name="open-in-full" size={12} color="#fff" />
          </View>
        </TouchableOpacity>

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
      </View>
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
    width: 120,
    height: 168,
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
  videoTapArea: {
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
    top: 6,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    top: 28,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    padding: 3,
  },
});

export default FloatingVideoOverlay;
