import React from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';
import { CARD_SURFACE, CARD_RADIUS_LG } from '../constants/cardStyles';

type BrandType = {
  id: string;
  name: string;
  image?: ImageSourcePropType;
  iconName?: TablerIconName;
  onPress?: () => void;
};

type Props = {
  data?: BrandType[];
};

const BrandList: React.FC<Props> = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) return null;

  return (
    <FlatList
      data={safeData}
      horizontal
      nestedScrollEnabled
      scrollEnabled={safeData.length > 3}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => String(item?.id ?? index)}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={item.onPress}
        >
          <View style={styles.imageContainer}>
            {item.iconName ? (
              <TablerIcon name={item.iconName} size={26} color="#0D614E" />
            ) : item.image ? (
              <Image source={item.image} style={styles.image} />
            ) : (
              <TablerIcon name="pill" size={26} color="#0D614E" />
            )}
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default React.memo(BrandList);

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 10,
  },
  separator: {
    width: 12,
  },
  card: {
    width: 120,
    height: 120,
    borderRadius: CARD_RADIUS_LG,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(13, 97, 78, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(13, 97, 78, 0.12)',
  },
  imageContainer: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
  },
});
