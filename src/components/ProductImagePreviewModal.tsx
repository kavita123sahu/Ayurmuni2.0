import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';

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

const toViewerSource = (entry: PreviewImage): any => {
  const src = entry.source as any;
  if (typeof src === 'number') return src;
  const uri =
    (typeof src === 'object' && src && typeof src.uri === 'string' && src.uri) ||
    entry.uri ||
    '';
  return { uri: String(uri) };
};

const ProductImagePreviewModal = ({
  images,
  visible,
  initialIndex = 0,
  onClose,
}: Props) => {
  const count = images.length;

  // react-native-image-viewing remounts itself whenever `imageIndex` changes
  // (it is used as a React key), so the index is fixed for the whole open session
  // and swipes are tracked by the viewer internally.
  const startIndex = useMemo(
    () => Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible],
  );

  const imagesKey = images
    .map(entry => {
      const src = toViewerSource(entry);
      return typeof src === 'number' ? src : src.uri;
    })
    .join('|');
  const viewerImages = useMemo(
    () => images.map(toViewerSource),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imagesKey],
  );

  const prefetched = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!visible) return;
    viewerImages.forEach(src => {
      const uri = typeof src === 'number' ? null : src.uri;
      if (!uri || prefetched.current.has(uri)) return;
      prefetched.current.add(uri);
      Image.prefetch(uri).catch(() => prefetched.current.delete(uri));
    });
  }, [visible, viewerImages]);

  const renderHeader = useCallback(
    ({ imageIndex: currentIndex }: { imageIndex: number }) => (
      <View style={styles.header}>
        {count > 1 ? (
          <Text style={styles.counter}>
            {currentIndex + 1} / {count}
          </Text>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <TablerIcon name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    ),
    [count, onClose],
  );

  if (!visible || count === 0) {
    return null;
  }

  return (
    <ImageView
      images={viewerImages}
      imageIndex={startIndex}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
      presentationStyle="overFullScreen"
      backgroundColor="#000000"
      animationType="fade"
      HeaderComponent={renderHeader}
    />
  );
};

export default React.memo(ProductImagePreviewModal);

const styles = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerSpacer: {
    width: 1,
  },
  counter: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
