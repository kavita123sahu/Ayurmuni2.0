import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import AppHeader from '../../components/AppHeader';
import TablerIcon from '../../components/TablerIcon';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { showSuccessToast } from '../../config/Key';
import { useCreateReview } from '../../hooks/useCreateReview';
import {
  buildReviewSubmitPayload,
  uploadReviewAsset,
} from '../../utils/reviewUtils';

export type ShareExperienceParams = {
  entityType: 'doctor' | 'product';
  entityName: string;
  entitySubtitle?: string;
  appointmentId?: string;
  variantId?: string;
  initialRating?: number;
  initialReview?: string;
  initialImages?: string[];
  isEdit?: boolean;
};

type MediaItem = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  uploadedUrl?: string;
};

const MAX_MEDIA = 5;

const ShareExperienceScreen = ({ route, navigation }: any) => {
  const params = (route?.params ?? {}) as ShareExperienceParams;
  const {
    entityType = 'doctor',
    entityName = '',
    entitySubtitle = '',
    appointmentId = '',
    variantId = '',
    initialRating = 0,
    initialReview = '',
    initialImages = [],
    isEdit = false,
  } = params;

  const { loading, submitReview } = useCreateReview();
  const [rating, setRating] = useState(Math.max(0, Math.min(5, initialRating)));
  const [review, setReview] = useState(initialReview);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    initialImages.map((uri, index) => ({
      id: `existing-${index}`,
      uri,
      type: uri.includes('.mp4') || uri.includes('.mov') ? 'video' : 'image',
      uploadedUrl: uri,
    })),
  );
  const [uploading, setUploading] = useState(false);

  const lookupId = entityType === 'product' ? variantId : appointmentId;

  const headerTitle = useMemo(
    () => (entityType === 'doctor' ? 'Rate Your Consultation' : 'Rate This Product'),
    [entityType],
  );

  const uploadAsset = useCallback(
    async (asset: Asset) => uploadReviewAsset(asset, entityType),
    [entityType],
  );

  const pickMedia = useCallback(
    (source: 'camera' | 'gallery') => {
      if (mediaItems.length >= MAX_MEDIA) {
        showSuccessToast(`You can add up to ${MAX_MEDIA} files`, 'error');
        return;
      }

      const options: CameraOptions & ImageLibraryOptions = {
        mediaType: 'mixed',
        // quality: 0.85,
        maxWidth: 1600,
        maxHeight: 1600,
        videoQuality: 'medium',
      };

      const handler = (response: any) => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        const asset = response.assets?.[0] as Asset | undefined;
        if (!asset?.uri) {
          return;
        }

        const isVideo = String(asset.type ?? '').startsWith('video');
        setMediaItems(prev => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            uri: asset.uri!,
            type: isVideo ? 'video' : 'image',
          },
        ]);
      };

      if (source === 'camera') {
        launchCamera(options as CameraOptions, handler);
      } else {
        launchImageLibrary(options as ImageLibraryOptions, handler);
      }
    },
    [mediaItems.length],
  );

  const showMediaOptions = () => {
    Alert.alert('Add photo or video', 'Choose a source', [
      { text: 'Camera', onPress: () => pickMedia('camera') },
      { text: 'Gallery', onPress: () => pickMedia('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!rating) {
      showSuccessToast('Please select a rating', 'error');
      return;
    }

    if (!lookupId) {
      showSuccessToast('Missing review reference', 'error');
      return;
    }

    try {
      setUploading(true);

      // 1. Upload media and get AWS URLs
      const uploadedUrls = await Promise.all(
        mediaItems.map(async item => {
          if (item.uploadedUrl) {
            return item.uploadedUrl;
          }

          return uploadAsset({
            uri: item.uri,
            type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
            fileName:
              item.type === 'video'
                ? `review_${Date.now()}.mp4`
                : `review_${Date.now()}.jpg`,
          } as Asset);
        }),
      );

      // 2. Prepare payload object
      const reviewPayload = buildReviewSubmitPayload({
        rating,
        review,
        imageUrls: uploadedUrls,
        entityType,
        appointmentId: lookupId,
        isEdit,
      });

      const response = await submitReview({
        entityType,
        appointmentId: entityType === 'doctor' ? lookupId : undefined,
        variantId: entityType === 'product' ? lookupId : undefined,
        method: isEdit ? 'PATCH' : 'POST',
        reviewData: reviewPayload,
      });
      console.log("reposneeeeeeeeeeeeeeee", response);
      if (response?.success) {
        showSuccessToast(
          response.message || 'Thank you for sharing your experience!',
          'success',
        );
        navigation.goBack();
        return;
      }

      showSuccessToast(
        response?.message || 'Unable to submit review',
        'error',
      );
    } catch (error) {
      console.log('Review submit error:', error);
      showSuccessToast(
        'Something went wrong while submitting',
        'error',
      );
    } finally {
      setUploading(false);
    }
  };

  const isBusy = loading || uploading;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppHeader title={headerTitle} onLeftPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#0D614E', '#15906F', '#1FA37D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIconWrap}>
            <TablerIcon
              name={entityType === 'doctor' ? 'stethoscope' : 'package'}
              size={28}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.heroTitle}>Share Your Experience</Text>
          <Text style={styles.heroName} numberOfLines={2}>
            {entityName}
          </Text>
          {!!entitySubtitle && (
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              {entitySubtitle}
            </Text>
          )}
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Your rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.85}>
                <TablerIcon
                  name={star <= rating ? 'star-filled' : 'star'}
                  size={34}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingHint}>
            {rating ? `You rated ${rating} out of 5` : 'Tap a star to rate'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Tell us more</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What did you like? How was the quality, service, or consultation experience?"
            placeholderTextColor="#94A3B8"
            multiline
            value={review}
            onChangeText={setReview}
            maxLength={800}
          />
          <Text style={styles.charCount}>{review.length}/800</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.mediaHeader}>
            <Text style={styles.sectionLabel}>Photos & videos</Text>
            <Text style={styles.mediaHint}>Optional • up to {MAX_MEDIA}</Text>
          </View>

          <View style={styles.mediaGrid}>
            {mediaItems.map(item => (
              <View key={item.id} style={styles.mediaTile}>
                {item.type === 'video' ? (
                  <View style={styles.videoTile}>
                    <TablerIcon name="video" size={28} color="#FFFFFF" />
                    <Text style={styles.videoLabel}>Video</Text>
                  </View>
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeMedia(item.id)}>
                  <TablerIcon name="x" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {mediaItems.length < MAX_MEDIA && (
              <TouchableOpacity style={styles.addTile} onPress={showMediaOptions} activeOpacity={0.85}>
                <TablerIcon name="plus" size={24} color={Colors.primaryColor} />
                <Text style={styles.addTileText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isBusy && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isBusy}
          activeOpacity={0.9}
        >
          {isBusy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              {isEdit ? 'Update Review' : 'Submit Review'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ShareExperienceScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    overflow: 'hidden',
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#E7FFF8',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 30,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EFEC',
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  sectionLabel: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingHint: {
    marginTop: 10,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  charCount: {
    marginTop: 8,
    textAlign: 'right',
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mediaHint: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mediaTile: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  videoTile: {
    flex: 1,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15,23,42,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    width: 88,
    height: 88,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B7D8CE',
    backgroundColor: '#F3FBF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTileText: {
    marginTop: 4,
    color: Colors.primaryColor,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 18 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EFEC',
  },
  submitBtn: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
