import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import SectionHeader from '../SectionHeader';
import PackagePlanRailCard, { RAIL_CARD_HEIGHT } from './PackagePlanRailCard';
import PackagePlanDetailSheet from './PackagePlanDetailSheet';
import { Fonts } from '../../common/Fonts';
import { usePackagePlans } from '../../hooks/usePackagePlans';
import { usePackagePurchase } from '../../hooks/usePackagePurchase';
import { useActivePlans } from '../../hooks/useActivePlans';
import PlanTransferConfirmModal from './PlanTransferConfirmModal';
import type { PackagePlan } from '../../services/PackageServices';
import { HORIZONTAL_SCROLL_CONTENT } from '../../constants/layout';
import { PLAN_GOLD, isCarePlan } from './packageUi';

const PREVIEW_LIMIT = 8;
const GAP = 10;
const SWEEP_MS = 1400;
const PAUSE_MS = 2600;
const GLIDE_W = 70;

type Props = {
  /** Stack navigator (Home passes `getParent()`) */
  navigation: any;
  home?: boolean;
  title?: string;
};

const PackagePlansSection = ({ navigation, home = false, title = 'Care Plans' }: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const { plans, loading } = usePackagePlans();
  console.log('PackagePlansSection => plans.length', plans);
  const { startPlan, processingId, transferPrompt, confirmTransfer, cancelTransfer } =
    usePackagePurchase(navigation);
  const { ownsPackage } = useActivePlans();
  const [selected, setSelected] = useState<PackagePlan | null>(null);

  // One native-driver value drives card shine, top glide line and tagline pulse.
  const sweep = useRef(new Animated.Value(0)).current;
  const hasPlans = plans.length > 0;

  useEffect(() => {
    if (loading || !hasPlans) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: SWEEP_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(PAUSE_MS),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [loading, hasPlans, sweep]);

  // ~1.7 cards visible on phones, capped so tablets don't get oversized cards.
  const cardWidth = Math.round(Math.min(Math.max(screenWidth * 0.54, 196), 240));

  const openList = useCallback(() => navigation.navigate('PackagesScreen'), [navigation]);
  const onCta = useCallback(
    (plan: PackagePlan) => {
      setSelected(null);
      startPlan(plan);
    },
    [startPlan],
  );

  if (!loading && !hasPlans) return null;

  const preview = [...plans]
    .sort((a, b) => Number(isCarePlan(b)) - Number(isCarePlan(a)))
    .slice(0, PREVIEW_LIMIT);

  const glideX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-GLIDE_W, screenWidth],
  });
  const pulseScale = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.9, 1],
  });
  const pulseOpacity = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0, 0.5],
  });

  return (
    <View>
      <SectionHeader home={home} title={title} actionText="View all" onPress={openList} />
      <View style={styles.band}>
        <Animated.View
          pointerEvents="none"
          style={[styles.glide, { transform: [{ translateX: glideX }] }]}
        />
        <View style={styles.tagline}>
          <View style={styles.pulseWrap}>
            <Animated.View
              style={[
                styles.pulseRing,
                { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
              ]}
            />
            <View style={styles.pulseDot} />
          </View>
          <Text style={styles.taglineText} numberOfLines={1}>
            Save more with guided Ayurvedic care plans
          </Text>
        </View>
        {loading ? (
          <View style={styles.row}>
            {[0, 1].map(key => (
              <View key={key} style={[styles.skeleton, { width: cardWidth }]} />
            ))}
          </View>
        ) : (
          <FlatList
            horizontal
            data={preview}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + GAP}
            decelerationRate="fast"
            contentContainerStyle={[HORIZONTAL_SCROLL_CONTENT, styles.listContent]}
            ItemSeparatorComponent={() => <View style={styles.gap} />}
            renderItem={({ item }) => (
              <PackagePlanRailCard
                plan={item}
                width={cardWidth}
                onPress={setSelected}
                shine={sweep}
                owned={ownsPackage(item.id)}
              />
            )}
          />
        )}
      </View>

      <PackagePlanDetailSheet
        plan={selected}
        processing={!!selected && processingId === selected.id}
        owned={!!selected && ownsPackage(selected.id)}
        onClose={() => setSelected(null)}
        onCta={onCta}
      />

      <PlanTransferConfirmModal
        prompt={transferPrompt}
        onYes={confirmTransfer}
        onNo={cancelTransfer}
      />
    </View>
  );
};

export default PackagePlansSection;

const styles = StyleSheet.create({
  band: {
    backgroundColor: '#F2F8F5',
    borderRadius: 18,
    paddingVertical: 10,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: '#E1EEE8',
    overflow: 'hidden',
  },
  glide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: GLIDE_W,
    height: 2,
    borderRadius: 1,
    backgroundColor: PLAN_GOLD,
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingRight: 10,
  },
  pulseWrap: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D614E',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0D614E',
  },
  taglineText: {
    flex: 1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 12,
    color: '#0D614E',
  },
  listContent: {
    paddingRight: 10,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  gap: {
    width: GAP,
  },
  skeleton: {
    height: RAIL_CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#E4EEE9',
  },
});
