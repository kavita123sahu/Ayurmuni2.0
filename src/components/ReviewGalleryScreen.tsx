import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';
import ImageView from 'react-native-image-viewing';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';

const { width } = Dimensions.get('window');
const COLS = 3;
const GAP = 8;
const H_PAD = 16;
const ITEM_SIZE = (width - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

const isVideoUrl = (value: unknown): boolean => {
  const url = String(value || '').toLowerCase();
  return (
    /\.(mp4|mov|m4v|webm|avi|mkv)(\?|#|$)/i.test(url) ||
    url.includes('/video') ||
    url.includes('video_url')
  );
};

export const ReviewGalleryScreen = ({ route, navigation }: any) => {
  const { images = [], selectedIndex: initialIndex = 0 } = route.params ?? {};
  const media = useMemo(
    () =>
      (Array.isArray(images) ? images : [])
        .map((item: any) => (typeof item === 'string' ? item : item?.uri || item?.url || ''))
        .filter(Boolean),
    [images],
  );
  const [showViewer, setShowViewer] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(Number(initialIndex) || 0);

  const photoCount = media.filter((uri: string) => !isVideoUrl(uri)).length;
  const videoCount = media.length - photoCount;
  const countLabel =
    videoCount > 0 && photoCount > 0
      ? `${photoCount} photos · ${videoCount} videos`
      : videoCount > 0
        ? `${videoCount} video${videoCount === 1 ? '' : 's'}`
        : `${photoCount} photo${photoCount === 1 ? '' : 's'}`;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Review media" onLeftPress={() => navigation.goBack()} />

      <View style={styles.metaRow}>
        <Text style={styles.countText}>{countLabel}</Text>
      </View>

      <FlatList
        data={media}
        numColumns={COLS}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `${item}-${index}`}
        columnWrapperStyle={styles.columnWrap}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <TablerIcon name="photo" size={32} color="#CBD5E1" />
            <Text style={styles.emptyText}>No media yet</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const video = isVideoUrl(item);
          return (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.card}
              onPress={() => {
                setSelectedIndex(index);
                setShowViewer(true);
              }}
            >
              <Image source={{ uri: item }} style={styles.image} />
              {video ? (
                <View style={styles.videoBadge}>
                  <TablerIcon name="video" size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      <ImageView
        images={media.map((uri: string) => ({ uri }))}
        imageIndex={selectedIndex}
        visible={showViewer}
        onRequestClose={() => setShowViewer(false)}
      />
    </SafeAreaView>
  );
};

export default ReviewGalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  metaRow: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: 24,
  },
  columnWrap: {
    gap: GAP,
    marginBottom: GAP,
  },
  card: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF2F6',
  },
  videoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(13, 97, 78, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 72,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
});
