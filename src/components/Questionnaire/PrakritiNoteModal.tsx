import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../TablerIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
  onBegin: () => void;
};

/**
 * Pre-Prakriti note — matches ayurmuni.com/prakriti/assessment modal copy.
 */
const PrakritiNoteModal = ({ visible, onClose, onBegin }: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={() => {}}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>BEFORE YOU BEGIN</Text>
          <View style={styles.titleRow}>
            <View style={styles.infoIcon}>
              <TablerIcon name="alert-circle" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>A note on your answers</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.note}>
            <Text style={styles.noteBold}>Please note: </Text>
            Answer each question based on your natural body, mind, and habits{' '}
            <Text style={styles.noteEm}>before the age of 21</Text>
            {' '}(or before any major illness, long-term stress, or significant
            lifestyle changes).
          </Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              A gentle tip — if you're older than 21, think back to how you
              naturally were in your younger years. This reveals your true{' '}
              <Text style={styles.tipEm}>Prakriti (natural constitution)</Text>{' '}
              rather than a temporary imbalance, for a more accurate reading.
            </Text>
          </View>

          <View style={styles.timePill}>
            <View style={styles.timeDot} />
            <Text style={styles.timeText}>
              This journey takes about 3–5 minutes
            </Text>
          </View>

          <TouchableOpacity
            style={styles.beginBtn}
            activeOpacity={0.9}
            onPress={onBegin}
          >
            <Text style={styles.beginText}>Begin the journey</Text>
            <TablerIcon name="star" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export default PrakritiNoteModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 51, 40, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 12,
  },
  note: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  noteBold: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  noteEm: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  tipBox: {
    backgroundColor: '#FFF8EB',
    borderWidth: 1,
    borderColor: '#F3D9A8',
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5B4A2E',
    fontFamily: Fonts.PoppinsRegular,
  },
  tipEm: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#3F2F18',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    backgroundColor: '#F1F5F4',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
  },
  timeText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  beginBtn: {
    marginTop: 4,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  beginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
