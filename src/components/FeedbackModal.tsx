import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from '../components/TablerIcon';

type Props = {
  visible: boolean;
  loading?: boolean;
  isEdit?: boolean;
  initialRating?: number;
  /** submit = post rating in-place; continue = go to next screen */
  mode?: 'submit' | 'continue';
  onClose: () => void;
  onContinue: (rating: number) => void;
};

const FeedbackModal: React.FC<Props> = ({
  visible,
  loading = false,
  isEdit = false,
  initialRating = 0,
  mode = 'continue',
  onClose,
  onContinue,
}) => {
  const [rating, setRating] = useState(initialRating);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRating(initialRating);
    }
  }, [visible, initialRating]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, opacityAnim, scaleAnim]);

  const handleContinue = () => {
    if (!rating) {
      return;
    }
    onContinue(rating);
  };

  const isSubmitMode = mode === 'submit';

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconBox}>
            <TablerIcon name="star-filled" size={22} color={Colors.primaryColor} />
          </View>

          <Text style={styles.title}>How was your experience?</Text>
          <Text style={styles.subtitle}>
            {isSubmitMode
              ? 'Tap the stars to rate your consultation. Your rating will be saved on this page.'
              : 'Rate your experience, then share photos, videos, and details on the next screen.'}
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.85}>
                <TablerIcon
                  name={i <= rating ? 'star-filled' : 'star'}
                  size={36}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!rating || loading) && styles.submitBtnDisabled]}
            onPress={handleContinue}
            disabled={!rating || loading}
          >
            <Text style={styles.submitText}>
              {loading
                ? 'Please wait...'
                : isSubmitMode
                  ? 'Submit Rating'
                  : 'Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default FeedbackModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  iconBox: {
    backgroundColor: '#006B591A',
    height: 54,
    width: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  laterText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
