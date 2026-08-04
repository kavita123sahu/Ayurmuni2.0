// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   Animated,
//   Easing,
//   BackHandler,
// } from 'react-native';
// import { RtcSurfaceView, RenderModeType } from 'react-native-agora';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { MaterialIcons } from '../../common/Vector';
// import { useVideoCall, VideoCallParams } from '../../context/VideoCallContext';
// import { popVideoCallAndGoToAppointments } from '../../navigation/navigationUtils';

// const PatientVideoCallScreen: React.FC = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const params = route.params as VideoCallParams;
//   const endingCallRef = useRef(false);
//   const pulseAnim = useRef(new Animated.Value(0)).current;

//   const {
//     viewMode,
//     loadingLabel,
//     isJoined,
//     remoteUid,
//     errorMsg,
//     isMuted,
//     isCameraOn,
//     isSpeakerOn,
//     isLocalViewBig,
//     callSeconds,
//     displayName,
//     initials,
//     otherPartyImage,
//     startCall,
//     minimizeCall,
//     endCall,
//     retryCall,
//     toggleMute,
//     toggleCamera,
//     toggleSpeaker,
//     flipCamera,
//     swapViews,
//     formatDuration,
//   } = useVideoCall();

//   useEffect(() => {
//     const appointmentId =
//       typeof params?.appointmentId === 'string'
//         ? params.appointmentId.trim()
//         : '';
//         console.log("appointmentIdappointmentId",appointmentId)

//     if (appointmentId) {
//       startCall({
//         ...params,
//         appointmentId,
//         consultationId:
//           typeof params?.consultationId === 'string'
//             ? params.consultationId.trim()
//             : undefined,
//       });
//     }
//   }, [params?.appointmentId, params?.consultationId, startCall]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('beforeRemove', e => {
//       if (endingCallRef.current) {
//         return;
//       }
//       if (viewMode === 'minimized') {
//         return;
//       }
//       e.preventDefault();
//       minimizeCall();
//       navigation.dispatch(e.data.action);
//     });
//     return unsubscribe;
//   }, [navigation, minimizeCall, viewMode]);

//   useEffect(() => {
//     const onBack = () => {
//       if (viewMode === 'fullscreen' && isJoined) {
//         minimizeCall();
//         navigation.goBack();
//         return true;
//       }
//       return false;
//     };
//     const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
//     return () => sub.remove();
//   }, [viewMode, isJoined, minimizeCall, navigation]);

//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 1400,
//           easing: Easing.out(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 0,
//           duration: 0,
//           useNativeDriver: true,
//         }),
//       ]),
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [pulseAnim]);

//   const handleEndCall = async () => {
//     endingCallRef.current = true;
//     await endCall();
//     popVideoCallAndGoToAppointments(navigation);
//   };

//   const showLocalBig = isLocalViewBig;
//   const remoteAvailable = remoteUid !== null;
//   const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
//   const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

//   if (viewMode === 'minimized') {
//     return null;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         {otherPartyImage ? (
//           <Image source={{ uri: otherPartyImage }} style={styles.headerAvatar} />
//         ) : (
//           <View style={styles.headerAvatarFallback}>
//             <Text style={styles.headerAvatarInitials}>{initials || '?'}</Text>
//           </View>
//         )}
//         <View style={styles.headerTextBlock}>
//           <Text style={styles.headerName} numberOfLines={1}>
//             {displayName}
//           </Text>
//           <View style={styles.headerStatusRow}>
//             <View
//               style={[
//                 styles.statusDot,
//                 { backgroundColor: remoteAvailable ? '#3ddc84' : '#f5a623' },
//               ]}
//             />
//             <Text style={styles.headerStatusText}>
//               {remoteAvailable ? `Connected • ${formatDuration(callSeconds)}` : loadingLabel}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {errorMsg && (
//         <View style={styles.errorBanner}>
//           <Text style={styles.errorText}>{errorMsg}</Text>
//           <TouchableOpacity onPress={retryCall} style={styles.retryButton}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={styles.remoteContainer}>
//         {(!isJoined || (isJoined && !remoteAvailable && !showLocalBig)) && (
//           <View style={styles.loadingContainer}>
//             <View style={styles.pulseWrap}>
//               <Animated.View
//                 style={[
//                   styles.pulseRing,
//                   { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
//                 ]}
//               />
//               {otherPartyImage ? (
//                 <Image source={{ uri: otherPartyImage }} style={styles.pulseAvatar} />
//               ) : (
//                 <View style={styles.pulseAvatarFallback}>
//                   <Text style={styles.pulseAvatarInitials}>{initials || '?'}</Text>
//                 </View>
//               )}
//             </View>
//             <Text style={styles.loadingText}>
//               {!isJoined
//                 ? loadingLabel
//                 : `Waiting for ${displayName} to join the consultation...`}
//             </Text>
//             {!errorMsg && isJoined && (
//               <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
//             )}
//           </View>
//         )}

//         {isJoined && (
//           <TouchableOpacity
//             key="local-video-tile"
//             style={showLocalBig ? styles.bigVideoWrap : styles.pipWrap}
//             activeOpacity={showLocalBig ? 1 : 0.85}
//             disabled={showLocalBig}
//             onPress={swapViews}
//           >
//             {isCameraOn ? (
//               <RtcSurfaceView
//                 canvas={{ uid: 0, renderMode: RenderModeType.RenderModeFit }}
//                 style={styles.fillVideo}
//                 zOrderMediaOverlay
//               />
//             ) : (
//               <View style={styles.cameraOffPlaceholder}>
//                 <MaterialIcons
//                   name="videocam-off"
//                   size={showLocalBig ? 36 : 22}
//                   color="#8a8a95"
//                 />
//                 <Text style={styles.cameraOffText}>Camera off</Text>
//               </View>
//             )}
//             <View style={styles.nameTag}>
//               <Text style={styles.nameTagText}>You</Text>
//             </View>
//             {!showLocalBig && (
//               <View style={styles.swapHintBadge}>
//                 <MaterialIcons name="flip-camera-android" size={14} color="#fff" />
//               </View>
//             )}
//           </TouchableOpacity>
//         )}

//         {remoteAvailable && (
//           <TouchableOpacity
//             key="remote-video-tile"
//             style={!showLocalBig ? styles.bigVideoWrap : styles.pipWrap}
//             activeOpacity={!showLocalBig ? 1 : 0.85}
//             disabled={!showLocalBig}
//             onPress={swapViews}
//           >
//             <RtcSurfaceView
//               canvas={{ uid: remoteUid!, renderMode: RenderModeType.RenderModeFit }}
//               style={styles.fillVideo}
//             />
//             <View style={styles.nameTag}>
//               <Text style={styles.nameTagText} numberOfLines={1}>
//                 {displayName}
//               </Text>
//             </View>
//             {showLocalBig && (
//               <View style={styles.swapHintBadge}>
//                 <MaterialIcons name="flip-camera-android" size={14} color="#fff" />
//               </View>
//             )}
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.controlsBar}>
//         <TouchableOpacity
//           style={[styles.controlButton, isMuted && styles.controlButtonActive]}
//           onPress={toggleMute}
//         >
//           <MaterialIcons name={isMuted ? 'mic-off' : 'mic'} size={22} color="#fff" />
//           <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
//           onPress={toggleCamera}
//         >
//           <MaterialIcons
//             name={isCameraOn ? 'videocam' : 'videocam-off'}
//             size={22}
//             color="#fff"
//           />
//           <Text style={styles.controlLabel}>{isCameraOn ? 'Cam off' : 'Cam on'}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
//           <MaterialIcons name="call-end" size={26} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
//           onPress={toggleSpeaker}
//         >
//           <MaterialIcons name={isSpeakerOn ? 'volume-up' : 'hearing'} size={22} color="#fff" />
//           <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
//           <MaterialIcons name="flip-camera-ios" size={22} color="#fff" />
//           <Text style={styles.controlLabel}>Flip</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0b0b0f', padding: 16 },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//     marginBottom: 14,
//     backgroundColor: '#17171d',
//     borderRadius: 16,
//     padding: 10,
//   },
//   headerAvatar: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     marginRight: 12,
//     backgroundColor: '#2a2a33',
//   },
//   headerAvatarFallback: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     marginRight: 12,
//     backgroundColor: '#4f46e5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerAvatarInitials: { color: '#fff', fontSize: 16, fontWeight: '700' },
//   headerTextBlock: { flex: 1 },
//   headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
//   headerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
//   statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
//   headerStatusText: { color: '#9a9aa5', fontSize: 12.5 },
//   errorBanner: {
//     backgroundColor: '#d32f2f',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   errorText: { color: '#fff', fontSize: 13, flex: 1, marginRight: 8 },
//   retryButton: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
//   retryText: { color: '#d32f2f', fontWeight: '600', fontSize: 12 },
//   remoteContainer: { flex: 1, backgroundColor: '#111', borderRadius: 12, overflow: 'hidden' },
//   fillVideo: { flex: 1 },
//   bigVideoWrap: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 1,
//   },
//   pipWrap: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     width: 104,
//     height: 148,
//     borderRadius: 10,
//     overflow: 'hidden',
//     borderWidth: 1.5,
//     borderColor: 'rgba(255,255,255,0.5)',
//     zIndex: 10,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.4,
//     shadowRadius: 6,
//   },
//   cameraOffPlaceholder: {
//     flex: 1,
//     backgroundColor: '#1c1c22',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cameraOffText: { color: '#8a8a95', fontSize: 10.5, marginTop: 4 },
//   nameTag: {
//     position: 'absolute',
//     bottom: 6,
//     left: 6,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     paddingHorizontal: 7,
//     paddingVertical: 2,
//     borderRadius: 5,
//   },
//   nameTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },
//   swapHintBadge: {
//     position: 'absolute',
//     bottom: 6,
//     right: 6,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     borderRadius: 10,
//     padding: 4,
//   },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
//   loadingText: { color: '#aaa', textAlign: 'center', marginTop: 14, fontSize: 13.5 },
//   pulseWrap: {
//     width: 100,
//     height: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 4,
//   },
//   pulseRing: {
//     position: 'absolute',
//     width: 88,
//     height: 88,
//     borderRadius: 44,
//     backgroundColor: '#4f46e5',
//   },
//   pulseAvatar: {
//     width: 88,
//     height: 88,
//     borderRadius: 44,
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.15)',
//   },
//   pulseAvatarFallback: {
//     width: 88,
//     height: 88,
//     borderRadius: 44,
//     backgroundColor: '#4f46e5',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.15)',
//   },
//   pulseAvatarInitials: { color: '#fff', fontSize: 28, fontWeight: '700' },
//   controlsBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     marginTop: 16,
//     paddingHorizontal: 6,
//     backgroundColor: '#17171d',
//     borderRadius: 24,
//     paddingVertical: 12,
//   },
//   controlButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#2a2a33',
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//   },
//   controlButtonActive: {
//     backgroundColor: '#4f46e5',
//   },
//   controlLabel: { color: '#ccc', fontSize: 9, marginTop: 2 },
//   endButton: {
//     backgroundColor: '#e53935',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#e53935',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 6,
//   },
// });

// export default PatientVideoCallScreen;


import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
  BackHandler,
} from 'react-native';
import { RtcSurfaceView, RenderModeType } from 'react-native-agora';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '../../common/Vector';
import { useVideoCall, VideoCallParams } from '../../context/VideoCallContext';
import { popVideoCallAndGoToAppointments } from '../../navigation/navigationUtils';

const PatientVideoCallScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as VideoCallParams;
  const endingCallRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const {
    viewMode,
    loadingLabel,
    isJoined,
    remoteUid,
    errorMsg,
    isMuted,
    isCameraOn,
    isSpeakerOn,
    isLocalViewBig,
    callSeconds,
    displayName,
    initials,
    otherPartyImage,
    startCall,
    minimizeCall,
    endCall,
    retryCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    flipCamera,
    swapViews,
    formatDuration,
  } = useVideoCall();

  const leaveCallAndGoToAppointments = useCallback(async () => {
    endingCallRef.current = true;
    await endCall();
    popVideoCallAndGoToAppointments(navigation);
  }, [endCall, navigation]);

  useEffect(() => {
    if (!params?.appointmentId) {
      endingCallRef.current = true;
      popVideoCallAndGoToAppointments(navigation);
    }
  }, [params?.appointmentId, navigation]);

  useEffect(() => {
    if (params?.appointmentId) {
      startCall(params);
    }
  }, [params?.appointmentId, startCall]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (endingCallRef.current) {
        return;
      }
      if (viewMode === 'minimized') {
        return;
      }
      e.preventDefault();
      minimizeCall();
      navigation.dispatch(e.data.action);
    });
    return unsubscribe;
  }, [navigation, minimizeCall, viewMode]);

  useEffect(() => {
    const onBack = () => {
      if (viewMode === 'fullscreen' && isJoined) {
        minimizeCall();
        navigation.goBack();
        return true;
      }

      if (viewMode === 'fullscreen') {
        leaveCallAndGoToAppointments();
        return true;
      }

      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [viewMode, isJoined, minimizeCall, navigation, leaveCallAndGoToAppointments]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handleEndCall = leaveCallAndGoToAppointments;

  const showLocalBig = isLocalViewBig;
  const remoteAvailable = remoteUid !== null;
  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  if (viewMode === 'minimized') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {otherPartyImage ? (
          <Image source={{ uri: otherPartyImage }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.headerAvatarFallback}>
            <Text style={styles.headerAvatarInitials}>{initials || '?'}</Text>
          </View>
        )}
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerName} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.headerStatusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: remoteAvailable ? '#3ddc84' : '#f5a623' },
              ]}
            />
            <Text style={styles.headerStatusText}>
              {remoteAvailable ? `Connected • ${formatDuration(callSeconds)}` : loadingLabel}
            </Text>
          </View>
        </View>
        {isJoined ? (
          <TouchableOpacity
            style={styles.minimizeBtn}
            onPress={() => {
              minimizeCall();
              requestAnimationFrame(() => {
                // @ts-ignore
                if (navigation.canGoBack?.()) {
                  navigation.goBack();
                }
              });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="picture-in-picture-alt" size={22} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity onPress={retryCall} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.remoteContainer}>
        {(!isJoined || (isJoined && !remoteAvailable && !showLocalBig)) && (
          <View style={styles.loadingContainer}>
            <View style={styles.pulseWrap}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                ]}
              />
              {otherPartyImage ? (
                <Image source={{ uri: otherPartyImage }} style={styles.pulseAvatar} />
              ) : (
                <View style={styles.pulseAvatarFallback}>
                  <Text style={styles.pulseAvatarInitials}>{initials || '?'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.loadingText}>
              {!isJoined
                ? loadingLabel
                : `Waiting for ${displayName} to join the consultation...`}
            </Text>
            {!errorMsg && isJoined && (
              <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
            )}
          </View>
        )}

        {isJoined && (
          <TouchableOpacity
            key="local-video-tile"
            style={showLocalBig ? styles.bigVideoWrap : styles.pipWrap}
            activeOpacity={showLocalBig ? 1 : 0.85}
            disabled={showLocalBig}
            onPress={swapViews}
          >
            {isCameraOn ? (
              <RtcSurfaceView
                canvas={{ uid: 0, renderMode: RenderModeType.RenderModeFit }}
                style={styles.fillVideo}
                zOrderMediaOverlay
              />
            ) : (
              <View style={styles.cameraOffPlaceholder}>
                <MaterialIcons
                  name="videocam-off"
                  size={showLocalBig ? 36 : 22}
                  color="#8a8a95"
                />
                <Text style={styles.cameraOffText}>Camera off</Text>
              </View>
            )}
            <View style={styles.nameTag}>
              <Text style={styles.nameTagText}>You</Text>
            </View>
            {!showLocalBig && (
              <View style={styles.swapHintBadge}>
                <MaterialIcons name="flip-camera-android" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        )}

        {remoteAvailable && (
          <TouchableOpacity
            key="remote-video-tile"
            style={!showLocalBig ? styles.bigVideoWrap : styles.pipWrap}
            activeOpacity={!showLocalBig ? 1 : 0.85}
            disabled={!showLocalBig}
            onPress={swapViews}
          >
            <RtcSurfaceView
              canvas={{ uid: remoteUid!, renderMode: RenderModeType.RenderModeFit }}
              style={styles.fillVideo}
            />
            <View style={styles.nameTag}>
              <Text style={styles.nameTagText} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
            {showLocalBig && (
              <View style={styles.swapHintBadge}>
                <MaterialIcons name="flip-camera-android" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <MaterialIcons name={isMuted ? 'mic-off' : 'mic'} size={22} color="#fff" />
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
          onPress={toggleCamera}
        >
          <MaterialIcons
            name={isCameraOn ? 'videocam' : 'videocam-off'}
            size={22}
            color="#fff"
          />
          <Text style={styles.controlLabel}>{isCameraOn ? 'Cam off' : 'Cam on'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
          <MaterialIcons name="call-end" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
          onPress={toggleSpeaker}
        >
          <MaterialIcons name={isSpeakerOn ? 'volume-up' : 'hearing'} size={22} color="#fff" />
          <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
          <MaterialIcons name="flip-camera-ios" size={22} color="#fff" />
          <Text style={styles.controlLabel}>Flip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0f', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
    backgroundColor: '#17171d',
    borderRadius: 16,
    padding: 10,
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: '#2a2a33',
  },
  headerAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarInitials: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerTextBlock: { flex: 1 },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  headerStatusText: { color: '#9a9aa5', fontSize: 12.5 },
  minimizeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2a2a33',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorBanner: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: { color: '#fff', fontSize: 13, flex: 1, marginRight: 8 },
  retryButton: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  retryText: { color: '#d32f2f', fontWeight: '600', fontSize: 12 },
  remoteContainer: { flex: 1, backgroundColor: '#111', borderRadius: 12, overflow: 'hidden' },
  fillVideo: { flex: 1 },
  bigVideoWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pipWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 104,
    height: 148,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  cameraOffPlaceholder: {
    flex: 1,
    backgroundColor: '#1c1c22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOffText: { color: '#8a8a95', fontSize: 10.5, marginTop: 4 },
  nameTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  nameTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  swapHintBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    padding: 4,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  loadingText: { color: '#aaa', textAlign: 'center', marginTop: 14, fontSize: 13.5 },
  pulseWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pulseRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4f46e5',
  },
  pulseAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pulseAvatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pulseAvatarInitials: { color: '#fff', fontSize: 28, fontWeight: '700' },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 6,
    backgroundColor: '#17171d',
    borderRadius: 24,
    paddingVertical: 12,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a33',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  controlButtonActive: {
    backgroundColor: '#4f46e5',
  },
  controlLabel: { color: '#ccc', fontSize: 9, marginTop: 2 },
  endButton: {
    backgroundColor: '#e53935',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default PatientVideoCallScreen;
