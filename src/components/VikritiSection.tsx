import React, { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';
import type { VikritiOutcome, VikritiResult } from '../content/vikriti';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  vikriti: VikritiResult;
  justCompleted?: boolean;
};

type CategoryBlock = {
  key: string;
  title: string;
  hint: string;
  icon: TablerIconName;
  accent: string;
  soft: string;
  selected: VikritiOutcome;
  others: VikritiOutcome[];
};

const OtherTypeRow = ({ item }: { item: VikritiOutcome }) => (
  <View style={styles.otherRow}>
    <View style={styles.otherDot} />
    <View style={styles.otherCopy}>
      <Text style={styles.otherName}>{item.name}</Text>
      <Text style={styles.otherTrait}>{item.trait}</Text>
      <Text style={styles.otherGuidance}>{item.guidance}</Text>
    </View>
  </View>
);

const CategoryCard = ({
  block,
  expanded,
  onToggle,
}: {
  block: CategoryBlock;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const otherCount = block.others.length;

  return (
    <View style={[styles.categoryCard, { borderColor: block.soft }]}>
      <View style={[styles.categoryHead, { backgroundColor: block.soft }]}>
        <View style={[styles.categoryIcon, { backgroundColor: '#FFFFFF' }]}>
          <TablerIcon name={block.icon} size={16} color={block.accent} />
        </View>
        <View style={styles.categoryHeadCopy}>
          <Text style={styles.categoryTitle}>{block.title}</Text>
          <Text style={styles.categoryHint}>{block.hint}</Text>
        </View>
      </View>

      <View style={styles.yoursWrap}>
        <View style={styles.yoursTop}>
          <Text style={styles.yoursEyebrow}>Your result</Text>
          <View style={[styles.yoursBadge, { backgroundColor: block.soft }]}>
            <TablerIcon name="circle-check" size={12} color={block.accent} />
            <Text style={[styles.yoursBadgeText, { color: block.accent }]}>
              Yours
            </Text>
          </View>
        </View>

        <Text style={styles.yoursName}>{block.selected.name}</Text>
        <Text style={[styles.yoursTrait, { color: block.accent }]}>
          {block.selected.trait}
        </Text>

        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceLabel}>Guidance</Text>
          <Text style={styles.yoursGuidance}>{block.selected.guidance}</Text>
        </View>
      </View>

      {otherCount > 0 ? (
        <View style={styles.compareWrap}>
          <Pressable
            onPress={onToggle}
            style={({ pressed }) => [
              styles.compareBtn,
              pressed && styles.compareBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={`${expanded ? 'Hide' : 'Show'} other ${block.title} types`}
          >
            <View style={styles.compareBtnLeft}>
              <Text style={styles.compareBtnTitle}>
                Other {block.title.toLowerCase()} types
              </Text>
              <Text style={styles.compareBtnMeta}>
                {otherCount} alternative{otherCount === 1 ? '' : 's'} · not yours
              </Text>
            </View>
            <View style={styles.compareChevron}>
              <TablerIcon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#64748B"
              />
            </View>
          </Pressable>

          {expanded ? (
            <View style={styles.othersList}>
              {block.others.map(item => (
                <OtherTypeRow key={item.id} item={item} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const VikritiSection = ({ vikriti, justCompleted = false }: Props) => {
  const gutOutcomes = vikriti.gut?.outcomes || [];
  const agniOutcomes = vikriti.agni?.outcomes || [];

  const categories = useMemo(() => {
    const blocks: CategoryBlock[] = [];

    const gutSelected = gutOutcomes.find(item => item.selected);
    if (gutSelected) {
      blocks.push({
        key: 'gut',
        title: 'Gut constitution',
        hint: 'How your bowel tends to behave',
        icon: 'leaf',
        accent: '#0D614E',
        soft: '#ECF8F3',
        selected: gutSelected,
        others: gutOutcomes.filter(item => !item.selected),
      });
    }

    const agniSelected = agniOutcomes.find(item => item.selected);
    if (agniSelected) {
      blocks.push({
        key: 'agni',
        title: 'Digestive strength',
        hint: 'How strong and steady your Agni is',
        icon: 'flame',
        accent: '#B45309',
        soft: '#FFF7ED',
        selected: agniSelected,
        others: agniOutcomes.filter(item => !item.selected),
      });
    }

    return blocks;
  }, [agniOutcomes, gutOutcomes]);

  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  if (!categories.length) return null;

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.section} accessibilityLabel="Vikriti">
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <TablerIcon name="heart" size={16} color={Colors.primaryColor} />
        </View>
        <View style={styles.headCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Vikriti</Text>
            <View style={styles.pill}>
              <TablerIcon name="star" size={11} color={Colors.primaryColor} />
              <Text style={styles.pillText}>
                {justCompleted ? 'Just completed' : 'Current state'}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Two separate readings — each with your result, then optional compare
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchYours]} />
          <Text style={styles.legendText}>Your matched type</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.legendSwatchOther]} />
          <Text style={styles.legendText}>Other types in same group</Text>
        </View>
      </View>

      <View style={styles.stack}>
        {categories.map((block, index) => (
          <View key={block.key} style={styles.stackItem}>
            <Text style={styles.stepLabel}>
              {index + 1} of {categories.length}
            </Text>
            <CategoryCard
              block={block}
              expanded={Boolean(expandedKeys[block.key])}
              onToggle={() => toggle(block.key)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default VikritiSection;

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 10,
    gap: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 2,
  },
  headIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCopy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    includeFontPadding: false,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#ECF8F3',
    borderWidth: 1,
    borderColor: '#D8EBE4',
  },
  pillText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendSwatchYours: {
    backgroundColor: Colors.primaryColor,
  },
  legendSwatchOther: {
    backgroundColor: '#CBD5E1',
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  stack: {
    gap: 14,
  },
  stackItem: {
    gap: 6,
  },
  stepLabel: {
    marginLeft: 4,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeadCopy: {
    flex: 1,
    minWidth: 0,
  },
  categoryTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  categoryHint: {
    marginTop: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  yoursWrap: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 4,
  },
  yoursTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  yoursEyebrow: {
    fontSize: 11,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  yoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  yoursBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  yoursName: {
    fontSize: 20,
    lineHeight: 26,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  yoursTrait: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
  },
  guidanceBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  guidanceLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  yoursGuidance: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  compareWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FAFBFC',
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  compareBtnPressed: {
    backgroundColor: '#F1F5F9',
  },
  compareBtnLeft: {
    flex: 1,
    minWidth: 0,
  },
  compareBtnTitle: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  compareBtnMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  compareChevron: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  othersList: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
  },
  otherRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  otherDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: '#CBD5E1',
  },
  otherCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  otherName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  otherTrait: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  otherGuidance: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
});
