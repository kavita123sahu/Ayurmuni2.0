import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../TablerIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
  onBegin: () => void;
};

const GREEN = Colors.primaryColor;

const NOTES: Array<{
  icon: TablerIconName;
  title: string;
  subtitle: string;
}> = [
  {
    icon: 'calendar',
    title: 'Answer as you were before 21',
    subtitle: 'Think about your natural body, mind and habits.',
  },
  {
    icon: 'leaf',
    title: 'This reveals your true Prakriti',
    subtitle: 'Your natural constitution, not a temporary state.',
  },
  {
    icon: 'clock',
    title: 'It only takes 3–5 minutes',
    subtitle: 'Simple, easy questions.',
  },
];

/**
 * Pre-Prakriti note modal — quick note before answers.
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
          <View style={styles.infoIcon}>
            <Text style={styles.infoLetter}>i</Text>
          </View>
          <Text style={styles.eyebrow}>BEFORE YOU BEGIN</Text>
          <Text style={styles.title}>A quick note on your answers</Text>
        </View>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
          {NOTES.map(item => (
            <View key={item.title} style={styles.noteRow}>
              <View style={styles.noteIcon}>
                <TablerIcon name={item.icon} size={18} color={GREEN} />
              </View>
              <View style={styles.noteCopy}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tipBox}>
            <TablerIcon name="alert-circle" size={18} color="#9A7B4F" />
            <View style={styles.tipDivider} />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Tip: </Text>
              If you're over 21, recall how you naturally were in your younger
              years for a more accurate result.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.beginBtn}
            activeOpacity={0.9}
            onPress={onBegin}
          >
            <Text style={styles.beginText}>Begin the journey</Text>
            <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
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
    paddingHorizontal: 18,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F7F3EC',
    maxHeight: '88%',
  },
  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoLetter: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 18,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 14,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4F0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  noteTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: GREEN,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  noteSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#5C5A54',
    fontFamily: Fonts.PoppinsRegular,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F8EBD6',
    borderRadius: 14,
    padding: 12,
  },
  tipDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: '#D4B88A',
    marginRight: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B5638',
    fontFamily: Fonts.PoppinsRegular,
  },
  tipBold: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#8A6A3D',
  },
  beginBtn: {
    marginTop: 4,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: GREEN,
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
