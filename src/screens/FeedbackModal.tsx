import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  Alert,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { useCreateReview } from '../hooks/useCreateReview';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
};

const FeedbackModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { loading, submitReview } = useCreateReview();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);



  const handleSubmit = async () => {

    if (!rating) {
      Alert.alert('Validation', 'Please select rating');
      return;
    }

    const payload = {
      appointment: "9abcf4d9-4fb2-45de-908b-f8cc922511c1",
      rating,
      review: feedback,
    };

    console.log("paylaoddd", payload)
    const response = await submitReview(payload);
    console.log("resonserevieww", response);
    if (response.success) {

      Alert.alert(
        'Success',
        'Review submitted successfully',
      );

      setRating(0);
      setFeedback('');

      // onSubmit?.();
      // onClose();

    } else {

      Alert.alert(
        'Error',
        'Unable to submit review',
      );
    }
  };


  return (
    <Modal transparent visible={visible} animationType="none">

      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconBox}>
            <Image source={Images.starIcon} style={styles.icon} />
          </View>

          <Text style={styles.title}>How was your experience?</Text>

          <Text style={styles.subtitle}>
            Your feedback helps us improve our service for everyone.
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Image
                  source={i <= rating ? Images.starFilled : Images.starEmpty}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Tell us more (optional)"
            placeholderTextColor="#6B7280"
            style={styles.input}
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Submitting...' : 'Submit'}
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
  },

  container: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },

  iconBox: {
    backgroundColor: '#006B591A',
    height: 52,
    width: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  icon: {
    height: 20,
    width: 20,
    tintColor: '#0D614E',
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsBold,
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 18,
  },

  stars: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  starIcon: {
    height: 28,
    width: 28,
    marginHorizontal: 6,
    resizeMode: 'contain',
  },

  input: {
    width: '100%',
    height: 90,
    color: '#0F172A',
    backgroundColor: '#0D614E0D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    fontFamily: Fonts.PoppinsMedium,

    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#0D614E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
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