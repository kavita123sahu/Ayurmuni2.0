import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import type { ActiveDietHomePreview } from '../hooks/useActiveDietHome';

type Props = {
  data: ActiveDietHomePreview;
  onPress?: () => void;
};

const ActiveDietHomeCard = ({ data, onPress }: Props) => {
  const progressWidth = Math.max(4, Math.min(100, data.progressPercent));

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>Your Diet Plan</Text>
          <Text style={styles.dayLabel}>
            Day {data.currentDay} of {data.totalDays}
          </Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {data.title}
          </Text>
          <Text style={styles.percent}>{data.progressPercent}%</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressWidth}%` }]} />
        </View>

        <Text style={styles.focusText} numberOfLines={1}>
          {data.focusLabel}
        </Text>
      </View>

      <View style={styles.imageWrap}>
        {data.thumbnailUrl ? (
          <Image
            source={{ uri: String(data.thumbnailUrl) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageFallback}>
            <TablerIcon name="leaf" size={26} color="#FFFFFF" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default React.memo(ActiveDietHomeCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryColor,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    minHeight: 108,
  },
  pressed: {
    opacity: 0.96,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: Fonts.PoppinsMedium,
  },
  dayLabel: {
    fontSize: 11,
    color: '#F6D365',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  percent: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#F6D365',
  },
  focusText: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: Fonts.PoppinsMedium,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
