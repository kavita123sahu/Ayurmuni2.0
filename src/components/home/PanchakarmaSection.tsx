import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
  DUMMY_PANCHAKARMA,
  type PanchakarmaDummy,
} from '../../data/homeDummySections';
import { HORIZONTAL_SCROLL_CONTENT, SCREEN_PADDING_H } from '../../constants/layout';
import {
  HORIZONTAL_CARD_WIDTH,
} from '../ProductCard';

/** Match ProductCard horizontal size */
const CARD_W = HORIZONTAL_CARD_WIDTH;
const IMAGE_H = 124;

type Props = {
  onPressItem?: (item: PanchakarmaDummy) => void;
};

const PanchakarmaCard = ({
  item,
  onPress,
}: {
  item: PanchakarmaDummy;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
  >
    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
    <View style={styles.body}>
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.desc} numberOfLines={1}>
        {item.description}
      </Text>
      <View style={styles.footer}>
        <RupeeAmount
          value={item.price}
          style={styles.price}
          iconColor={Colors.primaryColor}
        />
        <View style={styles.arrowBtn}>
          <TablerIcon name="chevron-right" size={16} color="#FFFFFF" />
        </View>
      </View>
    </View>
  </Pressable>
);

/** Product-card-sized therapy rail — SectionHeader on HomeScreen. */
const PanchakarmaSection = ({ onPressItem }: Props) => {
  const renderItem = useCallback(
    ({ item }: { item: PanchakarmaDummy }) => (
      <PanchakarmaCard item={item} onPress={() => onPressItem?.(item)} />
    ),
    [onPressItem],
  );

  return (
    <FlatList
      horizontal
      data={DUMMY_PANCHAKARMA}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
};

export default React.memo(PanchakarmaSection);

const styles = StyleSheet.create({
  list: {
    ...HORIZONTAL_SCROLL_CONTENT,
    paddingRight: SCREEN_PADDING_H,
    gap: 10,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.94,
  },
  image: {
    width: '100%',
    height: IMAGE_H,
    backgroundColor: '#F1F5F9',
  },
  body: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  name: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  desc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
