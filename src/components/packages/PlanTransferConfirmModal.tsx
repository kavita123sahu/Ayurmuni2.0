import React, { memo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import type { PlanTransferPrompt } from '../../hooks/usePackagePurchase';
import { PLAN_GOLD } from './packageUi';

type Props = {
  prompt: PlanTransferPrompt | null;
  onYes: () => void;
  onNo: () => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Shown before the purchase API when the user already has an active plan. */
const PlanTransferConfirmModal = ({ prompt, onYes, onNo }: Props) => {
  const samePlan = !!prompt?.samePlan;
  const currentName = prompt?.currentPlan?.name || 'your current plan';
  const newName = prompt?.plan?.name || 'the new package';
  const oldExpiry = formatDate(prompt?.currentPlan?.expires_at);

  return (
    <Modal visible={!!prompt} transparent animationType="fade" onRequestClose={onNo}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#0A4A3C', '#0D614E', '#178A6E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <TablerIcon name={samePlan ? 'refresh' : 'star-filled'} size={20} color={PLAN_GOLD} />
            </View>
            <Text style={styles.heroTitle}>
              {samePlan ? 'Buy this plan again?' : 'You already have an active plan'}
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.message}>
              {samePlan ? (
                <>
                  You already have <Text style={styles.bold}>{currentName}</Text> active. Your
                  remaining credits will be transferred to the new purchase.
                </>
              ) : (
                <>
                  You have <Text style={styles.bold}>{currentName}</Text> active. Your remaining
                  credits will be transferred to <Text style={styles.bold}>{newName}</Text>.
                </>
              )}
            </Text>

            {samePlan ? (
              <View style={styles.note}>
                <TablerIcon name="clock" size={14} color="#B45309" />
                <Text style={styles.noteText}>
                  Transferred credits keep the validity of your previous plan
                  {oldExpiry ? ` and expire on ${oldExpiry}` : ''} — not the new package's
                  validity.
                </Text>
              </View>
            ) : null}

            <Text style={styles.question}>Do you want to continue?</Text>

            <View style={styles.actions}>
              <TouchableOpacity activeOpacity={0.85} onPress={onNo} style={styles.noBtn}>
                <Text style={styles.noText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} onPress={onYes} style={styles.yesWrap}>
                <LinearGradient
                  colors={['#0D614E', '#14937A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.yesBtn}
                >
                  <Text style={styles.yesText}>{samePlan ? 'Yes, buy again' : 'Yes, buy now'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(PlanTransferConfirmModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 8,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  body: {
    padding: 16,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  bold: {
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#92400E',
    fontFamily: Fonts.PoppinsMedium,
  },
  question: {
    marginTop: 14,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  noBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noText: {
    fontSize: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  yesWrap: {
    flex: 1.4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  yesBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  yesText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
