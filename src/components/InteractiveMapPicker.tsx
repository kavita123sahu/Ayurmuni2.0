import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Coordinates } from '../services/locationService';
import { buildMapHtml } from '../utils/mapHtml';

const { width: SCREEN_W } = Dimensions.get('window');
const MAP_HEIGHT = Math.min(SCREEN_W - 32, 380);

export type MapCenter = Coordinates & { zoom?: number };

type Props = {
  center: MapCenter;
  onCenterChange: (coords: Coordinates) => void;
  loading?: boolean;
};

const MapWebView = WebView as React.ComponentType<Record<string, unknown>>;

type WebViewHandle = {
  injectJavaScript: (script: string) => void;
};

const InteractiveMapPicker: React.FC<Props> = ({
  center,
  onCenterChange,
  loading = false,
}) => {
  const webRef = useRef<WebViewHandle | null>(null);
  const lastCoords = useRef(center);
  /** True while / after the user pans — ignore parent center echo that would snap the pin back. */
  const userMovedRef = useRef(false);
  const suppressEchoUntil = useRef(0);
  const externalMoveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapReadyRef = useRef(false);
  const pendingCenterRef = useRef<MapCenter | null>(null);
  const [mapHtml] = useState(() => buildMapHtml(center));

  const clearRetry = useCallback(() => {
    if (retryTimer.current) {
      clearInterval(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  const injectMove = useCallback((coords: MapCenter) => {
    const zoomArg =
      typeof coords.zoom === 'number' && coords.zoom > 0
        ? String(coords.zoom)
        : 'undefined';
    webRef.current?.injectJavaScript(
      `(function(){try{if(typeof window.moveMapTo==='function'){window.moveMapTo(${coords.latitude},${coords.longitude},${zoomArg});}}catch(e){} true;})();`,
    );
  }, []);

  /**
   * If the map iframe is still loading, retry moving the pin
   * about every 150ms, up to 20 times. Zoom at least 17 (handled in map HTML).
   */
  const moveMapToWithRetry = useCallback(
    (coords: MapCenter) => {
      clearRetry();
      suppressEchoUntil.current = Date.now() + 600;
      userMovedRef.current = false;
      pendingCenterRef.current = coords;

      if (mapReadyRef.current) {
        injectMove(coords);
        return;
      }

      let tries = 0;
      injectMove(coords);
      retryTimer.current = setInterval(() => {
        tries += 1;
        injectMove(coords);
        if (mapReadyRef.current || tries >= 20) {
          clearRetry();
        }
      }, 150);
    },
    [clearRetry, injectMove],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.type === 'map_log') {
          if (data.message === 'map_ready') {
            mapReadyRef.current = true;
            clearRetry();
            if (pendingCenterRef.current) {
              injectMove(pendingCenterRef.current);
            }
          }
          console.log('[MapPicker]', data.message, data.extra ?? '');
          return;
        }
        if (data?.type === 'location' || (data?.lat != null && data?.lng != null)) {
          const coords = { latitude: data.lat, longitude: data.lng };
          lastCoords.current = coords;

          // Drop echo from injectJavaScript moveMapTo
          if (Date.now() < suppressEchoUntil.current) {
            return;
          }

          // User pan/zoom — keep pin here; parent must not yank it back
          userMovedRef.current = true;
          onCenterChange(coords);
        }
      } catch {
        // ignore parse errors
      }
    },
    [clearRetry, injectMove, onCenterChange],
  );

  React.useEffect(() => {
    const dLat = Math.abs(center.latitude - lastCoords.current.latitude);
    const dLng = Math.abs(center.longitude - lastCoords.current.longitude);
    const moved = dLat > 0.00008 || dLng > 0.00008;
    const zoomChanged =
      typeof center.zoom === 'number' &&
      center.zoom !== (lastCoords.current as MapCenter).zoom;

    if (!moved && !zoomChanged) return;

    // Tiny parent deltas after a drag are reverse-geocode / pincode echoes — ignore.
    // Large jumps (search / GPS / typed pincode) must still move the map.
    const isTinyEcho = dLat < 0.002 && dLng < 0.002; // ~200m
    if (userMovedRef.current && isTinyEcho && !zoomChanged) {
      lastCoords.current = center;
      return;
    }

    if (externalMoveTimer.current) {
      clearTimeout(externalMoveTimer.current);
    }
    externalMoveTimer.current = setTimeout(() => {
      moveMapToWithRetry(center);
      lastCoords.current = center;
    }, 120);

    return () => {
      if (externalMoveTimer.current) {
        clearTimeout(externalMoveTimer.current);
      }
    };
  }, [
    center.latitude,
    center.longitude,
    center.zoom,
    moveMapToWithRetry,
    center,
  ]);

  React.useEffect(() => () => clearRetry(), [clearRetry]);

  return (
    <View style={[styles.container, { height: MAP_HEIGHT }]}>
      <MapWebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: mapHtml, baseUrl: 'https://localhost' }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        mixedContentMode="always"
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
          </View>
        )}
      />
      {loading ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text style={styles.overlayText}>Finding your location…</Text>
        </View>
      ) : null}
    </View>
  );
};

export default InteractiveMapPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.72)',
    gap: 8,
  },
  overlayText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
});
