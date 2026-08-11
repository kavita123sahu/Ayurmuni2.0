import React, { memo } from 'react';
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

type ActionKey = 'pause' | 'resume' | 'stop' | 'reset' | 'repeat' | 'complete';

type Props = {
  status: DietListStatus;
  plan?: any;
  loading?: boolean;
  canComplete?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onRepeat?: () => void;
  onComplete?: () => void;
};

const ACTION_META: Record<
  ActionKey,
  { label: string; icon: string; tone: 'primary' | 'warn' | 'danger' | 'soft' }
> = {
  pause: { label: 'Pause', icon: 'clock', tone: 'warn' },
  resume: { label: 'Resume', icon: 'bolt', tone: 'primary' },
  stop: { label: 'Stop', icon: 'x', tone: 'danger' },
  reset: { label: 'Reset', icon: 'refresh', tone: 'soft' },
  repeat: { label: 'Repeat', icon: 'exchange', tone: 'primary' },
  complete: { label: 'Complete', icon: 'circle-check', tone: 'primary' },
};

/**
 * Visual diet plan controls — status + action tiles (not toast-only).
 * State machine: pause/resume/stop/complete/reset/repeat.
 */
const DietPlanActionPanel = ({
  status,
  plan,
  loading,
  canComplete,
  onPause,
  onResume,
  onStop,
  onReset,
  onRepeat,
  onComplete,
}: Props) => {
  const repeatCount = getDietRepeatCount(plan);
  const runLabel = getDietRunLabel(plan);

  const actions: ActionKey[] = [];
  if (status === 'active') {
    actions.push('pause', 'reset', 'stop');
    if (canComplete) actions.push('complete');
  } else if (status === 'paused') {
    actions.push('resume', 'reset', 'stop');
    if (canComplete) actions.push('complete');
  } else if (status === 'completed') {
    actions.push('repeat');
  } else if (status === 'stopped') {
    actions.push('repeat');
  }

  if (!actions.length && status === 'not_started') {
    return null;
  }

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
      ? 'Active'
      : status === 'paused'
        ? 'Paused'
        : status === 'completed'
          ? 'Completed'
          : status === 'stopped'
            ? 'Stopped'
            : 'Not started';

  const handlers: Record<ActionKey, (() => void) | undefined> = {
    pause: onPause,
    resume: onResume,
    stop: onStop,
    reset: onReset,
    repeat: onRepeat,
    complete: onComplete,
  };

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

      <Text style={styles.hint}>
        {status === 'active'
          ? 'Pause anytime, reset progress, or stop this run.'
          : status === 'paused'
            ? 'Resume to continue meal tracking, or reset / stop.'
            : status === 'completed'
              ? 'Great job. Repeat starts a new tracked run of this plan.'
              : status === 'stopped'
                ? 'This run ended. Repeat to start again with fresh tracking.'
                : 'Start the plan to unlock tracking controls.'}
      </Text>

      {actions.length > 0 ? (
        <View style={styles.actionsRow}>
          {actions.map(key => {
            const meta = ACTION_META[key];
            const onPress = handlers[key];
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.actionTile,
                  meta.tone === 'primary' && styles.actionPrimary,
                  meta.tone === 'warn' && styles.actionWarn,
                  meta.tone === 'danger' && styles.actionDanger,
                  meta.tone === 'soft' && styles.actionSoft,
                ]}
                activeOpacity={0.85}
                disabled={loading || !onPress}
                onPress={onPress}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      meta.tone === 'primary' || meta.tone === 'danger'
                        ? '#FFF'
                        : Colors.primaryColor
                    }
                  />
                ) : (
                  <>
                    <TablerIcon
                      name={meta.icon as any}
                      size={16}
                      color={
                        meta.tone === 'primary' || meta.tone === 'danger'
                          ? '#FFFFFF'
                          : meta.tone === 'warn'
                            ? '#92400E'
                            : Colors.primaryColor
                      }
                    />
                    <Text
                      style={[
                        styles.actionLabel,
                        (meta.tone === 'primary' || meta.tone === 'danger') &&
                          styles.actionLabelLight,
                        meta.tone === 'warn' && styles.actionLabelWarn,
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
    padding: 12,
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionTile: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionPrimary: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  actionWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  actionDanger: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  actionSoft: {
    backgroundColor: '#F3F7F5',
    borderColor: '#D7E8E1',
  },
  actionLabel: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  actionLabelLight: {
    color: '#FFFFFF',
  },
  actionLabelWarn: {
    color: '#92400E',
  },
});
