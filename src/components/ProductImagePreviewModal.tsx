import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
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

const ProductImagePreviewModal = ({
  images,
  visible,
  initialIndex = 0,
  onClose,
}: Props) => {
  const count = images.length;
  const [imageIndex, setImageIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    const safeIndex = Math.min(
      Math.max(initialIndex, 0),
      Math.max(count - 1, 0),
    );
    setImageIndex(safeIndex);
  }, [visible, initialIndex, count]);

  const viewerImages = images.map(entry => entry.source);

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
      imageIndex={imageIndex}
      visible={visible}
      onRequestClose={onClose}
      onImageIndexChange={setImageIndex}
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
