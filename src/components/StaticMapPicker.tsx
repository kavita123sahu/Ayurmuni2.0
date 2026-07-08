import React, { useMemo, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  PanResponder,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';
import { GOOGLE_MAPS_API_KEY } from '../config/Key';
import { Coordinates } from '../services/locationService';

const MAP_ZOOM = 17;
const { width: SCREEN_W } = Dimensions.get('window');
const MAP_SIZE = Math.min(SCREEN_W - 32, 400);

type Props = {
  center: Coordinates;
  onCenterChange: (coords: Coordinates) => void;
  loading?: boolean;
};

const latLngFromPixelOffset = (
  center: Coordinates,
  deltaX: number,
  deltaY: number,
  zoom: number,
): Coordinates => {
  const scale = Math.pow(2, zoom);
  const latRad = (center.latitude * Math.PI) / 180;
  const metersPerPixel = (156543.03392 * Math.cos(latRad)) / scale;
  const dLat = (-deltaY * metersPerPixel) / 111320;
  const dLng = (deltaX * metersPerPixel) / (111320 * Math.cos(latRad));

  return {
    latitude: center.latitude + dLat,
    longitude: center.longitude + dLng,
  };
};

const StaticMapPicker: React.FC<Props> = ({
  center,
  onCenterChange,
  loading = false,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const centerRef = useRef(center);
  centerRef.current = center;

  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [center.latitude, center.longitude, translateX, translateY]);

  const mapUrl = useMemo(() => {
    const size = `${Math.round(MAP_SIZE)}x${Math.round(MAP_SIZE)}`;
    return (
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${center.latitude},${center.longitude}` +
      `&zoom=${MAP_ZOOM}` +
      `&size=${size}` +
      `&scale=2` +
      `&maptype=roadmap` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );
  }, [center.latitude, center.longitude]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateX.value = gesture.dx;
        translateY.value = gesture.dy;
      },
      onPanResponderRelease: (_, gesture) => {
        const next = latLngFromPixelOffset(
          centerRef.current,
          gesture.dx,
          gesture.dy,
          MAP_ZOOM,
        );
        onCenterChange(next);
        translateX.value = 0;
        translateY.value = 0;
      },
      onPanResponderTerminate: () => {
        translateX.value = 0;
        translateY.value = 0;
      },
    }),
  ).current;

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (loading) {
    return (
      <View style={[styles.container, { width: MAP_SIZE, height: MAP_SIZE }]}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: MAP_SIZE, height: MAP_SIZE }]}>
      <Animated.View
        style={[styles.mapWrap, mapAnimatedStyle]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: mapUrl }}
          style={{ width: MAP_SIZE, height: MAP_SIZE }}
          resizeMode="cover"
        />
      </Animated.View>

      <View style={styles.pinOverlay} pointerEvents="none">
        <TablerIcon name="map-pin" size={36} color={Colors.primaryColor} />
      </View>

      <View style={styles.hintBar} pointerEvents="none">
        <Text style={styles.hintText}>Drag to move pin</Text>
      </View>
    </View>
  );
};

export default StaticMapPicker;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapWrap: {
    width: '100%',
    height: '100%',
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  hintBar: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
});
