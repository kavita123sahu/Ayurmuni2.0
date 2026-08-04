import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RtcSurfaceView, RenderModeType } from 'react-native-agora';
import { MaterialIcons } from '../common/Vector';
import { useVideoCall } from '../context/VideoCallContext';

const PIP_WIDTH = 148;
const PIP_HEIGHT = 214;

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

  const visible = viewMode === 'minimized' && !!callParams;
  const showRemote = remoteUid !== null;

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      hardwareAccelerated
      onRequestClose={expandCall}
    >
      <View style={styles.root} pointerEvents="box-none">
        <View
          style={[
            styles.pipContainer,
            { bottom: Math.max(insets.bottom, 18) + 78, right: 14 },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.videoTapArea}
            onPress={expandCall}
          >
            {showRemote ? (
              <RtcSurfaceView
                key={`pip-remote-${remoteUid}`}
                canvas={{
                  uid: remoteUid!,
                  renderMode: RenderModeType.RenderModeHidden,
                }}
                style={styles.video}
                zOrderMediaOverlay
                zOrderOnTop
              />
            ) : isJoined && isCameraOn ? (
              <RtcSurfaceView
                key="pip-local"
                canvas={{
                  uid: 0,
                  renderMode: RenderModeType.RenderModeHidden,
                }}
                style={styles.video}
                zOrderMediaOverlay
                zOrderOnTop
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
                {remoteUid !== null
                  ? formatDuration(callSeconds)
                  : 'Connecting...'}
              </Text>
              <View style={styles.expandChip}>
                <MaterialIcons name="open-in-full" size={13} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomBar}>
            <View style={styles.nameBlock}>
              <Text style={styles.nameText} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.hintText}>Tap to expand</Text>
            </View>
            <TouchableOpacity
              style={styles.endBtn}
              onPress={endCall}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="call-end" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 28 },
    }),
  },
  videoTapArea: {
    flex: 1,
  },
  video: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
  avatar: {
    flex: 1,
    backgroundColor: '#2a2a33',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: '#0D614E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
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
    gap: 8,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingVideoOverlay;
