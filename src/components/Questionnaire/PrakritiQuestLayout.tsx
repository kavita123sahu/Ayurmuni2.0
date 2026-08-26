import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import TablerIcon from '../TablerIcon';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import BasicInfoForm from '../MedicalHistory/BasicInfoForm';
import { DOSHA, DoshaKey, QUEST, XP_PER_LEVEL } from './PrakritiQuestTheme';
import {
  computeDoshaScores,
  dominantDosha,
} from './doshaScoreUtils';
import { QuestionnaireConfig, QuestionStep } from './types';
import { getStepKey } from './utils';
import { QuestionnaireMode } from './configs';
import {
  QuestSoundProvider,
  useQuestSound,
  useQuestStartSound,
} from './questSounds';

/** Hybrid temple + clinic themes */
const THEME = {
  prakriti: {
    bg: [QUEST.bgTop, '#F6F0E6', '#EFE6D8'] as string[],
    accent: QUEST.accent,
    cardBg: '#FFFdf8',
    cardBorder: '#E8E0D4',
    optionBg: '#FFFCF7',
    optionBorder: '#E9E2D7',
    track: '#E5DDD2',
    orbA: DOSHA.vata.soft,
    orbB: DOSHA.pitta.soft,
  },
  medical: {
    bg: ['#E9F5F2', '#F3F9F7', '#DCEEE9'] as string[],
    accent: '#0D7A6F',
    cardBg: '#FFFFFF',
    cardBorder: '#C9E4DD',
    optionBg: '#FBFFFE',
    optionBorder: '#D3E8E2',
    track: '#D5E8E3',
    orbA: '#C8E8E0',
    orbB: '#BFDCD6',
  },
};

const MAX_NODES = 12;

type FlowProps = {
  loading: boolean;
  submitting: boolean;
  loadError?: string;
  step: number;
  steps: QuestionStep[];
  currentStep?: QuestionStep;
  progress: number;
  answers: Record<string, any>;
  isDisabled: boolean;
  showSkip: boolean;
  isLastStep: boolean;
  handleSelect: (choice: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSkip: () => void;
  retryLoad?: () => void;
  isSelected: (item: any) => boolean;
  streak?: number;
  xp?: number;
  mode?: QuestionnaireMode;
  basicInfoStep?: boolean;
  rawQuestions?: any[];
  handleBasicInfoChange?: (key: string, value: any) => void;
  handleTextChange?: (text: string) => void;
};

type Props = FlowProps & {
  config: QuestionnaireConfig;
  onExit?: () => void;
  /** When false, header back / exit on first step is disabled */
  allowExit?: boolean;
};

const DoshaPill = memo(
  ({
    dosha,
    score,
    leading,
  }: {
    dosha: DoshaKey;
    score: number;
    leading: boolean;
  }) => {
    const meta = DOSHA[dosha];
    return (
      <View
        style={[
          styles.pill,
          { backgroundColor: meta.soft },
          leading && { borderColor: meta.color, borderWidth: 1.5 },
        ]}
      >
        <View style={[styles.pillDot, { backgroundColor: meta.color }]} />
        <Text style={[styles.pillText, { color: meta.color }]}>
          {meta.label} {score}
        </Text>
        {leading ? (
          <TablerIcon name="star-filled" size={10} color={meta.color} />
        ) : null}
      </View>
    );
  },
);

const QuestOption = memo(
  ({
    index,
    title,
    subtitle,
    imageSource,
    active,
    accent,
    onPress,
    medical,
  }: {
    index: number;
    title: string;
    subtitle?: string;
    imageSource: any;
    active: boolean;
    accent: string;
    onPress: () => void;
    medical?: boolean;
  }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPress={() => {
          scale.value = withSequence(
            withTiming(0.97, { duration: 70 }),
            withSpring(1, { damping: 14, stiffness: 240 }),
          );
          onPress();
        }}
      >
        <Animated.View
          entering={FadeInDown.delay(30 + index * 45).springify()}
          style={[
            styles.option,
            {
              borderColor: active ? accent : medical ? THEME.medical.optionBorder : THEME.prakriti.optionBorder,
              backgroundColor: active
                ? `${accent}14`
                : medical
                  ? THEME.medical.optionBg
                  : THEME.prakriti.optionBg,
            },
            animStyle,
          ]}
        >
          <View style={[styles.optionIndex, active && { backgroundColor: accent }]}>
            <Text style={[styles.optionIndexText, active && { color: '#FFF' }]}>
              {index + 1}
            </Text>
          </View>

          <View style={styles.optionThumbWrap}>
            {imageSource ? (
              <Image source={imageSource} style={styles.optionThumb} />
            ) : (
              <LinearGradient
                colors={[`${accent}33`, `${accent}14`]}
                style={[styles.optionThumb, styles.optionThumbFallback]}
              >
                <TablerIcon
                  name={medical ? 'stethoscope' : 'leaf'}
                  size={18}
                  color={accent}
                />
              </LinearGradient>
            )}
          </View>

          <View style={styles.optionTextWrap}>
            <Text numberOfLines={2} style={[styles.optionTitle, active && { color: accent }]}>
              {title}
            </Text>
            {!!subtitle && (
              <Text numberOfLines={1} style={styles.optionSubtitle}>
                {subtitle}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.optionCheck,
              active
                ? { backgroundColor: accent, borderColor: accent }
                : { borderColor: medical ? '#C9DDD7' : '#E5E0D8' },
            ]}
          >
            {active ? <TablerIcon name="check" size={12} color="#FFF" /> : null}
          </View>
        </Animated.View>
      </Pressable>
    );
  },
);

/** Reference-style nodes when few levels; hybrid bar when many */
const JourneyTrack = memo(
  ({
    level,
    total,
    percent,
    accent,
    trackColor,
  }: {
    level: number;
    total: number;
    percent: number;
    accent: string;
    trackColor: string;
  }) => {
    const nodeCount = Math.min(Math.max(total, 1), MAX_NODES);
    const mapped =
      total <= MAX_NODES
        ? Math.min(level, nodeCount)
        : Math.max(1, Math.round((level / Math.max(total, 1)) * nodeCount));

    return (
      <View style={styles.trackBlock}>
        <View style={styles.trackMeta}>
          <View style={styles.trackMetaLeft}>
            <TablerIcon name="map-pin" size={12} color={accent} />
            <Text style={[styles.trackLevel, { color: accent }]}>
              LEVEL {level} OF {total}
            </Text>
          </View>
          <View style={[styles.pctBubble, { backgroundColor: accent }]}>
            <Text style={styles.pctText}>{Math.round(percent)}%</Text>
          </View>
        </View>

        <View style={styles.nodesRow}>
          <View style={[styles.nodesLine, { backgroundColor: trackColor }]} />
          <View
            style={[
              styles.nodesLineFill,
              {
                backgroundColor: accent,
                width: `${Math.min(100, Math.max(0, ((mapped - 1) / Math.max(nodeCount - 1, 1)) * 100))}%`,
              },
            ]}
          />
          {Array.from({ length: nodeCount }).map((_, i) => {
            const n = i + 1;
            const done = n < mapped;
            const current = n === mapped;
            return (
              <View
                key={n}
                style={[
                  styles.node,
                  done && { backgroundColor: accent, borderColor: accent },
                  current && {
                    backgroundColor: accent,
                    borderColor: accent,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                  },
                ]}
              >
                {done ? (
                  <TablerIcon name="check" size={9} color="#FFF" />
                ) : current ? (
                  <TablerIcon name="leaf" size={10} color="#FFF" />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);

const QuestLayoutInner = ({
  loading,
  submitting,
  loadError,
  step,
  steps,
  currentStep,
  progress,
  answers,
  isDisabled,
  isLastStep,
  handleSelect,
  handleNext,
  handleBack,
  retryLoad,
  isSelected,
  streak = 0,
  xp,
  onExit,
  allowExit = true,
  mode = 'prakriti',
  basicInfoStep,
  rawQuestions,
  handleBasicInfoChange,
  handleTextChange,
}: Props) => {
  const isMedical = mode === 'medical';
  const theme = isMedical ? THEME.medical : THEME.prakriti;
  const { play, muted, toggleMuted } = useQuestSound();
  useQuestStartSound(!loading && !!currentStep);
  const canExitQuest = allowExit || step > 0;

  const prevStepForSound = useRef(step);
  const cardKey = `${getStepKey(currentStep)}-${step}`;

  useEffect(() => {
    if (step > prevStepForSound.current) play('advance');
    prevStepForSound.current = step;
  }, [play, step]);

  const scores = useMemo(
    () => computeDoshaScores(answers, steps),
    [answers, steps],
  );
  const lead = dominantDosha(scores);
  const accent = isMedical ? theme.accent : DOSHA[lead].color;

  const computedXp =
    xp ?? Math.max(0, step) * XP_PER_LEVEL + Math.max(0, streak - 1) * 5;

  const level = Math.min(step + 1, Math.max(steps.length, 1));
  const totalLevels = Math.max(steps.length, 1);

  const resolveImage = (item: any) => {
    if (currentStep?.key === 'knowPrakriti' && item?.value === 'Yes') {
      return Images.yesHuman;
    }
    if (currentStep?.key === 'knowPrakriti' && item?.value === 'No') {
      return Images.noHuman;
    }
    if (item?.image_path) return { uri: item.image_path };
    return null;
  };

  const onPick = (item: any) => {
    play('select');
    handleSelect(item);
  };

  const onHeaderBack = () => {
    if (!canExitQuest && step === 0) return;
    handleBack();
  };
  const onExitQuest = () => {
    if (!allowExit) return;
    if (onExit) onExit();
    else handleBack();
  };

  if (loading && !currentStep) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.bg[0] }]}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={styles.loaderText}>
          {isMedical ? 'Preparing your health quest…' : 'Opening the temple gates…'}
        </Text>
      </View>
    );
  }

  if (loadError && !currentStep) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.bg[0] }]}>
        <Text style={styles.loaderText}>{loadError}</Text>
        {retryLoad ? (
          <Pressable
            style={[styles.exitBtn, { backgroundColor: accent }]}
            onPress={retryLoad}
          >
            <Text style={styles.exitText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!currentStep) return null;

  const choices = currentStep.choices ?? [];
  const stepKey = getStepKey(currentStep);

  return (
    <View style={styles.root}>
      <LinearGradient colors={theme.bg} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, styles.orbTL, { backgroundColor: theme.orbA }]} />
      <View style={[styles.orb, styles.orbBR, { backgroundColor: theme.orbB }]} />

      <SafeAreaView style={styles.safeOuter} edges={['top', 'bottom']}>
        {/* Dense brand + actions row */}
        <View style={styles.topBar}>
          <Pressable
            onPress={onHeaderBack}
            style={[styles.iconBtn, !canExitQuest && step === 0 && styles.iconBtnDisabled]}
            hitSlop={8}
            disabled={!canExitQuest && step === 0}
          >
            <TablerIcon
              name="arrow-left"
              size={18}
              color={!canExitQuest && step === 0 ? '#CBD5E1' : QUEST.ink}
            />
          </Pressable>

          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: `${accent}18` }]}>
              <TablerIcon
                name={isMedical ? 'heart-handshake' : 'trophy'}
                size={15}
                color={accent}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.brandTitle} numberOfLines={1}>
                {isMedical ? 'Health Quest' : 'Prakriti Quest'}
              </Text>
              <Text style={styles.brandSub} numberOfLines={1}>
                {isMedical ? 'Your Wellness Path' : 'The Temple Journey'}
              </Text>
            </View>
          </View>

          <Animated.View
            entering={ZoomIn}
            style={[styles.xpBadge, { backgroundColor: QUEST.xpBg }]}
          >
            <TablerIcon name="star-filled" size={11} color="#FDE68A" />
            <Text style={styles.xpText}>{computedXp} XP</Text>
          </Animated.View>

          <Pressable onPress={toggleMuted} style={styles.iconBtn} hitSlop={8}>
            <TablerIcon
              name={muted ? 'volume-off' : 'volume'}
              size={16}
              color={QUEST.exit}
            />
          </Pressable>
        </View>

        {/* Stats strip */}
        <View style={styles.hudRow}>
          {isMedical ? (
            <>
              <View style={[styles.pill, { backgroundColor: `${theme.accent}18` }]}>
                <TablerIcon name="stethoscope" size={11} color={theme.accent} />
                <Text style={[styles.pillText, { color: theme.accent }]}>Health</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: DOSHA.kapha.soft }]}>
                <TablerIcon name="shield" size={11} color={DOSHA.kapha.color} />
                <Text style={[styles.pillText, { color: DOSHA.kapha.color }]}>
                  Private
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: DOSHA.pitta.soft }]}>
                <TablerIcon name="notes" size={11} color={DOSHA.pitta.color} />
                <Text style={[styles.pillText, { color: DOSHA.pitta.color }]}>
                  Step {level}
                </Text>
              </View>
            </>
          ) : (
            <>
              <DoshaPill dosha="vata" score={scores.vata} leading={lead === 'vata'} />
              <DoshaPill dosha="pitta" score={scores.pitta} leading={lead === 'pitta'} />
              <DoshaPill dosha="kapha" score={scores.kapha} leading={lead === 'kapha'} />
            </>
          )}
          {streak > 1 ? (
            <View style={[styles.streakBadge, { backgroundColor: QUEST.accent }]}>
              <TablerIcon name="flame" size={11} color="#FFF" />
              <Text style={styles.streakText}>{streak}x</Text>
            </View>
          ) : null}
        </View>

        <JourneyTrack
          level={level}
          total={totalLevels}
          percent={progress}
          accent={accent}
          trackColor={theme.track}
        />

        {/* Stage card — grows with content, never leaves blank space */}
        <Animated.View
          key={cardKey}
          entering={FadeInDown.springify().damping(18)}
          style={[
            styles.stage,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={[styles.levelBadge, { backgroundColor: accent }]}>
            <TablerIcon name="bolt" size={11} color="#FFF" />
            <Text style={styles.levelBadgeText}>LEVEL {level}</Text>
          </View>

          <Text style={styles.question}>
            {basicInfoStep
              ? 'Share your basic information'
              : currentStep.question}
          </Text>

          {currentStep.answer_type === 'multi_choice' ? (
            <Text style={styles.multiHint}>Select all that apply</Text>
          ) : null}

          {basicInfoStep && rawQuestions && handleBasicInfoChange ? (
            /* Basic info — scrollable form + pinned Continue */
            <View style={styles.stageBody}>
              <ScrollView
                style={styles.stageScroll}
                contentContainerStyle={styles.stageScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <BasicInfoForm
                  questions={rawQuestions}
                  selectedAnswers={answers}
                  onChange={handleBasicInfoChange}
                />
              </ScrollView>
              <Pressable
                style={[
                  styles.continueBtn,
                  { backgroundColor: accent },
                  (isDisabled || submitting) && styles.continueDisabled,
                ]}
                disabled={isDisabled || submitting}
                onPress={() => { play('select'); handleNext(); }}
              >
                {submitting ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={styles.continueText}>Continue</Text>
                )}
              </Pressable>
            </View>
          ) : currentStep.answer_type === 'text' && handleTextChange ? (
            /* Free-text answer + pinned Continue */
            <View style={styles.stageBody}>
              <TextInput
                multiline
                placeholder="Write your answer..."
                placeholderTextColor="#94A3B8"
                value={answers[stepKey] ?? ''}
                onChangeText={handleTextChange}
                style={[styles.input, styles.inputFlex]}
              />
              <Pressable
                style={[
                  styles.continueBtn,
                  { backgroundColor: accent },
                  (isDisabled || submitting) && styles.continueDisabled,
                ]}
                disabled={isDisabled || submitting}
                onPress={() => { play('select'); handleNext(); }}
              >
                {submitting ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={styles.continueText}>
                    {isLastStep ? 'Complete Quest' : 'Continue'}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            /* Choice options — scrollable list + pinned Continue for multi/last */
            <View style={styles.stageBody}>
              <ScrollView
                style={styles.stageScroll}
                contentContainerStyle={styles.stageScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {choices.map((item, index) => {
                  const full = String(item?.value ?? '');
                  const [optTitle, ...rest] = full.split(' - ');
                  return (
                    <QuestOption
                      key={`${item?.index}-${index}`}
                      index={index}
                      title={optTitle || full || `Option ${index + 1}`}
                      subtitle={rest.join(' - ')}
                      imageSource={resolveImage(item)}
                      active={isSelected(item)}
                      medical={isMedical}
                      accent={
                        isMedical
                          ? theme.accent
                          : index % 3 === 0
                            ? DOSHA.vata.color
                            : index % 3 === 1
                              ? DOSHA.pitta.color
                              : DOSHA.kapha.color
                      }
                      onPress={() => onPick(item)}
                    />
                  );
                })}
              </ScrollView>
              {(currentStep.answer_type === 'multi_choice' || isLastStep) && (
                <Pressable
                  style={[
                    styles.continueBtn,
                    { backgroundColor: accent },
                    (isDisabled || submitting) && styles.continueDisabled,
                  ]}
                  disabled={isDisabled || submitting}
                  onPress={() => { play('select'); handleNext(); }}
                >
                  {submitting ? <ActivityIndicator color="#FFF" /> : (
                    <Text style={styles.continueText}>
                      {isLastStep ? 'Complete Quest' : 'Continue'}
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn} style={styles.footer}>
          <Pressable onPress={onHeaderBack} style={styles.prevBtn} hitSlop={8}>
            <TablerIcon name="chevron-left" size={16} color={QUEST.ink} />
            <Text style={styles.prevText}>Previous</Text>
          </Pressable>
          <Pressable
            onPress={onExitQuest}
            style={[styles.exitBtn, { backgroundColor: QUEST.exit }]}
          >
            <Text style={styles.exitText}>Exit Quest</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const PrakritiQuestLayout = (props: Props) => (
  <QuestSoundProvider>
    <QuestLayoutInner {...props} />
  </QuestSoundProvider>
);

export default memo(PrakritiQuestLayout);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: QUEST.bgTop },
  safeOuter: { flex: 1, paddingHorizontal: 14 },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loaderText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    color: QUEST.muted,
    textAlign: 'center',
  },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.3 },
  orbTL: { width: 140, height: 140, top: -20, right: -30 },
  orbBR: { width: 180, height: 180, bottom: 60, left: -50 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: QUEST.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: {
    opacity: 0.4,
  },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    color: QUEST.ink,
    lineHeight: 18,
  },
  brandSub: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10,
    color: QUEST.muted,
    lineHeight: 13,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  xpText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 11,
    color: '#FFF',
  },

  hudRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontFamily: Fonts.PoppinsSemiBold, fontSize: 10 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
  },
  streakText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
    color: '#FFF',
  },

  trackBlock: { marginBottom: 8 },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  trackMetaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackLevel: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  pctBubble: {
    minWidth: 34,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 9,
    color: '#FFF',
  },
  nodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
  },
  nodesLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
  },
  nodesLineFill: {
    position: 'absolute',
    left: 8,
    height: 3,
    borderRadius: 2,
  },
  node: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D5CDC2',
    backgroundColor: '#F8F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  stage: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 6,
    shadowColor: '#8B7355',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    overflow: 'hidden',
  },
  /* Inner body of the stage — flex:1 so options/form scroll fills remaining space */
  stageBody: {
    flex: 1,
  },
  stageScroll: {
    flex: 1,
  },
  stageScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  levelBadgeText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 0.4,
  },
  question: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: QUEST.ink,
    marginBottom: 12,
  },
  multiHint: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: QUEST.muted,
    marginBottom: 6,
  },
  inputFlex: { flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 9,
    minHeight: 52,
  },
  optionIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
    color: QUEST.ink,
  },
  optionThumbWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#F5F0E8',
  },
  optionThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  optionThumbFallback: { alignItems: 'center', justifyContent: 'center' },
  optionTextWrap: { flex: 1, minWidth: 0 },
  optionTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 13,
    color: QUEST.ink,
    lineHeight: 18,
  },
  optionSubtitle: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10,
    color: QUEST.muted,
    marginTop: 1,
  },
  optionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: QUEST.border,
    borderRadius: 14,
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
    color: QUEST.ink,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  continueBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  continueDisabled: { opacity: 0.45 },
  continueText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  prevText: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
    color: QUEST.ink,
  },
  exitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exitText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
    color: '#FFF',
  },
});
