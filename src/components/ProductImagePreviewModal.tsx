import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';
import ZoomableImage, {
  ZOOM_MAX,
  ZOOM_MIN,
  ZoomableImageHandle,
} from './ZoomableImage';

type PreviewImage = {
  source: ImageSourcePropType;
  uri?: string;
};

type Props = {
  images: PreviewImage[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
};

const ZOOM_STEP = 1.5;

const toSource = (entry: PreviewImage): ImageSourcePropType => {
  const src = entry.source as any;
  if (typeof src === 'number') return src;
  const uri =
    (typeof src === 'object' && src && typeof src.uri === 'string' && src.uri) ||
    entry.uri ||
    '';
  return { uri: String(uri) };
};

const sourceKey = (src: ImageSourcePropType) =>
  typeof src === 'number' ? String(src) : String((src as any)?.uri ?? '');

const ProductImagePreviewModal = ({
  images,
  visible,
  initialIndex = 0,
  onClose,
}: Props) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const count = images.length;

  const imagesKey = images.map(e => sourceKey(toSource(e))).join('|');
  const sources = useMemo(
    () => images.map(toSource),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imagesKey],
  );

  const startIndex = Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0));
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const pageRefs = useRef<(ZoomableImageHandle | null)[]>([]);
  // Read by page callbacks so renderItem stays stable and pages never re-render on swipe.
  const indexRef = useRef(startIndex);
  indexRef.current = index;

  useEffect(() => {
    if (visible) {
      setIndex(startIndex);
      setScale(1);
    }
  }, [visible, startIndex]);

  const prefetched = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!visible) return;
    sources.forEach(src => {
      if (typeof src === 'number') return;
      const uri = sourceKey(src);
      if (!uri || prefetched.current.has(uri)) return;
      prefetched.current.add(uri);
      Image.prefetch(uri).catch(() => prefetched.current.delete(uri));
    });
  }, [visible, sources]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      if (next === index) return;
      pageRefs.current[index]?.zoomTo(1);
      setIndex(next);
      setScale(1);
    },
    [index, width],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const page = pageRefs.current[index];
      if (!page) return;
      const target = page.getScale() * factor;
      page.zoomTo(factor < 1 && target < 1.05 ? ZOOM_MIN : target);
    },
    [index],
  );

  const getItemLayout = useCallback(
    (_: unknown, i: number) => ({ length: width, offset: width * i, index: i }),
    [width],
  );

  const renderItem = useCallback(
    ({ item, index: i }: { item: ImageSourcePropType; index: number }) => (
      <ZoomableImage
        ref={handle => {
          pageRefs.current[i] = handle;
        }}
        source={item}
        width={width}
        height={height}
        onScaleChange={s => {
          if (i === indexRef.current) setScale(s);
        }}
      />
    ),
    [width, height],
  );

  if (!visible || count === 0) return null;

  const isZoomed = scale > 1.01;
  const canZoomOut = isZoomed;
  const canZoomIn = scale < ZOOM_MAX - 0.01;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <FlatList
          data={sources}
          horizontal
          pagingEnabled
          scrollEnabled={!isZoomed}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={getItemLayout}
          keyExtractor={(src, i) => `${sourceKey(src)}-${i}`}
          renderItem={renderItem}
          onMomentumScrollEnd={onMomentumEnd}
          initialNumToRender={Math.min(count, 3)}
          windowSize={5}
          removeClippedSubviews={false}
        />

        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          {count > 1 ? (
            <Text style={styles.counter}>
              {index + 1} / {count}
            </Text>
          ) : (
            <View />
          )}
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close preview"
          >
            <TablerIcon name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}
          pointerEvents="box-none"
        >
          <View style={styles.zoomBar}>
            <TouchableOpacity
              style={[styles.zoomBtn, !canZoomOut && styles.zoomBtnDisabled]}
              onPress={() => zoomBy(1 / ZOOM_STEP)}
              disabled={!canZoomOut}
              accessibilityLabel="Zoom out"
            >
              <TablerIcon name="minus" size={20} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pageRefs.current[index]?.zoomTo(ZOOM_MIN)}
              disabled={!isZoomed}
              style={styles.zoomLabelBtn}
              accessibilityLabel="Reset zoom"
            >
              <Text style={styles.zoomLabel}>{Math.round(scale * 100)}%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.zoomBtn, !canZoomIn && styles.zoomBtnDisabled]}
              onPress={() => zoomBy(ZOOM_STEP)}
              disabled={!canZoomIn}
              accessibilityLabel="Zoom in"
            >
              <TablerIcon name="plus" size={20} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default React.memo(ProductImagePreviewModal);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.PoppinsMedium,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  zoomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  zoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnDisabled: {
    opacity: 0.35,
  },
  zoomLabelBtn: {
    minWidth: 60,
    alignItems: 'center',
  },
  zoomLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
