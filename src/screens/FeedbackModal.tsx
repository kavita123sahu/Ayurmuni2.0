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
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
};

const FeedbackModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // 🎬 Animation
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

  const handleSubmit = () => {
    onSubmit(rating, feedback);
    setRating(0);
    setFeedback('');
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      
      {/* 🔥 Overlay */}
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        
        {/* Close on outside click */}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* 🔥 Center Modal */}
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* 🔥 ICON BOX */}
          <View style={styles.iconBox}>
            <Image source={Images.starIcon} style={styles.icon} />
          </View>

          {/* TITLE */}
          <Text style={styles.title}>How was your experience?</Text>

          {/* SUBTITLE */}
          <Text style={styles.subtitle}>
            Your feedback helps us improve our service for everyone.
          </Text>

          {/* ⭐ STARS (IMAGE BASED) */}
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

          {/* INPUT */}
          <TextInput
            placeholder="Tell us more (optional)"
            placeholderTextColor="#6B7280"
            style={styles.input}
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          {/* SUBMIT */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

          {/* LATER */}
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

  // INPUT
  input: {
    width: '100%',
    height: 90,
    backgroundColor: '#0D614E0D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    fontFamily: Fonts.PoppinsMedium,

    textAlignVertical: 'top', // 🔥 FIX (important)
  },

  // BUTTON
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