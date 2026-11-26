import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';
import type { VikritiOutcome, VikritiResult } from '../content/vikriti';

type Props = {
  vikriti: VikritiResult;
  justCompleted?: boolean;
};

const VikritiResultCard = ({
  label,
  item,
}: {
  label: string;
  item: VikritiOutcome;
}) => (
  <View style={styles.yoursCard}>
    <View style={styles.yoursTop}>
      <Text style={styles.yoursLabel}>{label}</Text>
      <View style={styles.yoursBadge}>
        <TablerIcon name="circle-check" size={11} color={Colors.primaryColor} />
        <Text style={styles.yoursBadgeText}>Yours</Text>
      </View>
    </View>
    <Text style={styles.yoursName}>{item.name}</Text>
    <Text style={styles.yoursTrait}>{item.trait}</Text>
    <Text style={styles.yoursGuidance}>{item.guidance}</Text>
  </View>
);

const VikritiOthersCol = ({
  label,
  items,
}: {
  label: string;
  items: VikritiOutcome[];
}) => {
  if (!items.length) return null;
  return (
    <View style={styles.othersCol}>
      <Text style={styles.othersLabel}>{label}</Text>
      {items.map(item => (
        <View key={item.id} style={styles.othersItem}>
          <Text style={styles.othersName}>{item.name}</Text>
          <Text style={styles.othersTrait}>{item.trait}</Text>
          <Text style={styles.othersGuidance}>{item.guidance}</Text>
        </View>
      ))}
    </View>
  );
};

const VikritiSection = ({ vikriti, justCompleted = false }: Props) => {
  const gutOutcomes = vikriti.gut?.outcomes || [];
  const agniOutcomes = vikriti.agni?.outcomes || [];

  const { gutSelected, agniSelected, gutOthers, agniOthers } = useMemo(() => {
    const gutSel = gutOutcomes.find(item => item.selected) || null;
    const agniSel = agniOutcomes.find(item => item.selected) || null;
    return {
      gutSelected: gutSel,
      agniSelected: agniSel,
      gutOthers: gutOutcomes.filter(item => !item.selected),
      agniOthers: agniOutcomes.filter(item => !item.selected),
    };
  }, [agniOutcomes, gutOutcomes]);

  if (!gutSelected && !agniSelected) return null;

  return (
    <View style={styles.section} accessibilityLabel="Vikriti">
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <TablerIcon name="heart" size={15} color={Colors.primaryColor} />
        </View>
        <View style={styles.headCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Vikriti</Text>
            <View style={styles.pill}>
              <TablerIcon name="star" size={12} color={Colors.primaryColor} />
              <Text style={styles.pillText}>
                {justCompleted ? 'Just completed' : 'Current state'}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Your gut and digestion, from the options you chose
          </Text>
        </View>
      </View>

      <View style={styles.results}>
        {gutSelected ? (
          <VikritiResultCard label="Gut constitution" item={gutSelected} />
        ) : null}
        {agniSelected ? (
          <VikritiResultCard label="Digestive strength" item={agniSelected} />
        ) : null}
      </View>

      {gutOthers.length || agniOthers.length ? (
        <View style={styles.others}>
          <Text style={styles.othersHead}>Other types</Text>
          <View style={styles.othersGrid}>
            <VikritiOthersCol label="Gut constitution" items={gutOthers} />
            <VikritiOthersCol label="Digestive strength" items={agniOthers} />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default VikritiSection;

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF3F1',
    padding: 16,
    gap: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headIcon: {
    width: 34,
    height: 34,
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
    fontSize: 17,
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
  results: {
    gap: 10,
  },
  yoursCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    backgroundColor: '#F4FBF8',
    padding: 14,
  },
  yoursTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yoursLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  yoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8EBE4',
  },
  yoursBadgeText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  yoursName: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  yoursTrait: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  yoursGuidance: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  others: {
    gap: 10,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8EEF0',
  },
  othersHead: {
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  othersGrid: {
    gap: 12,
  },
  othersCol: {
    gap: 8,
  },
  othersLabel: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  othersItem: {
    paddingVertical: 6,
    gap: 2,
  },
  othersName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  othersTrait: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  othersGuidance: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
});
