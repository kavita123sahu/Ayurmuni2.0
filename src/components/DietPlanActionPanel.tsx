import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';
import type { DietListStatus } from '../utils/dietPlanUtils';
import { getDietRepeatCount, getDietRunLabel } from '../utils/dietPlanUtils';

type Props = {
  status: DietListStatus;
  plan?: any;
  loading?: boolean;
  canComplete?: boolean;
  progressHint?: string;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  /** Only used when status === 'completed' */
  onRepeat?: () => void;
  /** Used when status === 'stopped' (new start — not repeat API) */
  onStartAgain?: () => void;
  onComplete?: () => void;
};

/**
 * Clear status-driven controls:
 * - active  → Pause (primary), optional Complete; Stop/Reset under More
 * - paused  → Resume only (no Stop/Reset/Complete)
 * - completed → Repeat this plan (only after Complete)
 * - stopped → Start again (catalog start — API repeat is completed-only)
 */
const DietPlanActionPanel = ({
  status,
  plan,
  loading,
  canComplete,
  progressHint,
  onPause,
  onResume,
  onStop,
  onReset,
  onRepeat,
  onStartAgain,
  onComplete,
}: Props) => {
  const [showMore, setShowMore] = useState(false);
  const repeatCount = getDietRepeatCount(plan);
  const runLabel = getDietRunLabel(plan);

  if (status === 'not_started') return null;

  const statusTone =
    status === 'active'
      ? styles.statusActive
      : status === 'paused'
        ? styles.statusPaused
        : status === 'completed'
          ? styles.statusCompleted
          : status === 'stopped'
            ? styles.statusStopped
            : styles.statusIdle;

  const statusLabel =
    status === 'active'
      ? 'Tracking'
      : status === 'paused'
        ? 'Paused'
        : status === 'completed'
          ? 'Completed'
          : status === 'stopped'
            ? 'Stopped'
            : 'Not started';

  const hint =
    status === 'active'
      ? 'Meal tracking is live. Pause anytime — your progress is saved.'
      : status === 'paused'
        ? 'Paused — only Resume is available. Tap Resume to continue meal tracking.'
        : status === 'completed'
          ? 'Plan completed. Repeat starts a new run from Day 1 and increases your repeat count.'
          : status === 'stopped'
            ? 'This run was stopped. Start again for a new cycle. Repeat is only for completed plans.'
            : 'Start the plan to unlock tracking controls.';

  // Repeat ONLY for completed. Stopped uses Start again (not repeat API).
  const primary =
    status === 'active'
      ? {
          key: 'pause',
          label: 'Pause plan',
          icon: 'clock' as const,
          onPress: onPause,
          tone: 'warn' as const,
        }
      : status === 'paused'
        ? {
            key: 'resume',
            label: 'Resume plan',
            icon: 'bolt' as const,
            onPress: onResume,
            tone: 'primary' as const,
          }
        : status === 'completed'
          ? {
              key: 'repeat',
              label: 'Repeat this plan',
              icon: 'exchange' as const,
              onPress: onRepeat,
              tone: 'primary' as const,
            }
          : status === 'stopped'
            ? {
                key: 'start_again',
                label: 'Start again',
                icon: 'bolt' as const,
                onPress: onStartAgain,
                tone: 'primary' as const,
              }
            : null;

  if (!primary) return null;

  const hasMore =
    status === 'active' && !!(onStop || onReset);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={[styles.statusPill, statusTone]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        <View style={styles.runPill}>
          <TablerIcon name="exchange" size={13} color={Colors.primaryColor} />
          <Text style={styles.runText}>{runLabel}</Text>
          {repeatCount > 0 ? (
            <Text style={styles.runCount}>×{repeatCount}</Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.hint}>{hint}</Text>
      {!!progressHint && <Text style={styles.progressHint}>{progressHint}</Text>}

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          primary.tone === 'warn' && styles.primaryWarn,
          primary.tone === 'primary' && styles.primaryFill,
        ]}
        activeOpacity={0.88}
        disabled={loading || !primary.onPress}
        onPress={primary.onPress}
      >
        {loading ? (
          <ActivityIndicator
            color={primary.tone === 'warn' ? Colors.primaryColor : '#FFF'}
          />
        ) : (
          <>
            <TablerIcon
              name={primary.icon}
              size={18}
              color={primary.tone === 'warn' ? '#92400E' : '#FFFFFF'}
            />
            <Text
              style={[
                styles.primaryLabel,
                primary.tone === 'warn' && styles.primaryLabelWarn,
              ]}
            >
              {primary.label}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {status === 'active' && canComplete && onComplete ? (
        <TouchableOpacity
          style={styles.completeBtn}
          activeOpacity={0.88}
          disabled={loading}
          onPress={onComplete}
        >
          <TablerIcon name="circle-check" size={16} color="#FFFFFF" />
          <Text style={styles.completeLabel}>Mark plan complete</Text>
        </TouchableOpacity>
      ) : null}

      {hasMore ? (
        <>
          <TouchableOpacity
            style={styles.moreToggle}
            onPress={() => setShowMore(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.moreToggleText}>
              {showMore ? 'Hide options' : 'More options'}
            </Text>
            <TablerIcon
              name={showMore ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#64748B"
            />
          </TouchableOpacity>

          {showMore ? (
            <View style={styles.moreRow}>
              {onReset ? (
                <TouchableOpacity
                  style={styles.moreBtn}
                  disabled={loading}
                  onPress={onReset}
                  activeOpacity={0.85}
                >
                  <TablerIcon name="refresh" size={15} color={Colors.primaryColor} />
                  <Text style={styles.moreBtnText}>Reset progress</Text>
                </TouchableOpacity>
              ) : null}
              {onStop ? (
                <TouchableOpacity
                  style={[styles.moreBtn, styles.moreDanger]}
                  disabled={loading}
                  onPress={onStop}
                  activeOpacity={0.85}
                >
                  <TablerIcon name="x" size={15} color="#DC2626" />
                  <Text style={[styles.moreBtnText, styles.moreDangerText]}>
                    Stop this run
                  </Text>
                </TouchableOpacity>
              ) : null}
              <Text style={styles.moreHelp}>
                Reset restarts Day 1 on the same run (repeat count unchanged).
                Stop ends the run; you can start again later.
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

export default memo(DietPlanActionPanel);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusPaused: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#E0E7FF' },
  statusStopped: { backgroundColor: '#FEE2E2' },
  statusIdle: { backgroundColor: '#F1F5F9' },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  runPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF7F3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  runText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  runCount: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  progressHint: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  primaryFill: {
    backgroundColor: Colors.primaryColor,
  },
  primaryWarn: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  primaryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  primaryLabelWarn: {
    color: '#92400E',
  },
  completeBtn: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#0F766E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  moreToggleText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  moreRow: {
    gap: 8,
  },
  moreBtn: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    backgroundColor: '#F8FBFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  moreDanger: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  moreBtnText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  moreDangerText: {
    color: '#DC2626',
  },
  moreHelp: {
    fontSize: 11,
    lineHeight: 15,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
