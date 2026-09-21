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
import { CARD_RADIUS_LG } from '../constants/cardStyles';

type BrandType = {
  id: string;
  name: string;
  logo?: TablerIconName;
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
          activeOpacity={0.85}
          onPress={item.onPress}
        >
          {/* Background Image / Icon */}
          {item.image ? (
            <Image
              source={item.image}
              style={styles.backgroundImage}
            />
          ) : (
            <View style={styles.iconBackground}>
              <TablerIcon
                name={item.iconName || 'pill'}
                size={42}
                color="#0D614E"
              />
            </View>
          )}

          {/* Bottom Overlay */}
          <View style={styles.bottomOverlay}>
            <Text
              style={styles.name}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
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
    width: 5,
  },

  card: {
    width: 100,
    height: 100,
    borderRadius: CARD_RADIUS_LG,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E8F3F0',
  },

  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  iconBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 97, 78, 0.08)',
  },

  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  name: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
  },
});