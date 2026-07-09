import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { Colors } from '../common/Colors';
import { Coordinates } from '../services/locationService';
import { buildMapHtml } from '../utils/mapHtml';

const { width: SCREEN_W } = Dimensions.get('window');
const MAP_HEIGHT = Math.min(SCREEN_W - 32, 380);

type Props = {
  center: Coordinates;
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

  const html = useMemo(
    () => buildMapHtml(center),
    [center.latitude, center.longitude],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.lat != null && data?.lng != null) {
          const coords = { latitude: data.lat, longitude: data.lng };
          lastCoords.current = coords;
          onCenterChange(coords);
        }
      } catch {
        // ignore parse errors
      }
    },
    [onCenterChange],
  );

  const moveMapTo = useCallback((coords: Coordinates) => {
    webRef.current?.injectJavaScript(
      `window.moveMapTo(${coords.latitude}, ${coords.longitude}); true;`,
    );
  }, []);

  React.useEffect(() => {
    const moved =
      Math.abs(center.latitude - lastCoords.current.latitude) > 0.00001 ||
      Math.abs(center.longitude - lastCoords.current.longitude) > 0.00001;
    if (moved) {
      moveMapTo(center);
      lastCoords.current = center;
    }
  }, [center.latitude, center.longitude, moveMapTo, center]);

  if (loading) {
    return (
      <View style={[styles.container, { height: MAP_HEIGHT }]}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: MAP_HEIGHT }]}>
      <MapWebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
          </View>
        )}
      />
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
});
