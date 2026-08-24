import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { navigateToCategoryProducts } from '../navigation/productNavigation';
import { renderCategoryName } from '../common/DataInterface';
import { HORIZONTAL_SCROLL_CONTENT } from '../constants/layout';

const { width } = Dimensions.get('window');

const ITEM_SIZE = Math.min(102, Math.round(width / 3.9));
const CONCERN_CARD_WIDTH = Math.min(122, Math.round(width / 3.15));

interface Category {
  id: string;
  name: string;
  image_url: any;
  _homeLoopKey?: string;
}

const getTileSource = (imageUrl: any): ImageSourcePropType =>
  imageUrl && typeof imageUrl === 'string'
    ? { uri: imageUrl }
    : Images.cardiology;

const TileCard = ({
  name,
  imageUrl,
  textStyle,
}: {
  name: string;
  imageUrl: any;
  textStyle: any;
}) => {
  const source = getTileSource(imageUrl);

  return (
    <View style={styles.card}>
      {/* Full Image */}
      <View style={styles.imageContainer}>
        <Image
          source={source}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>

      {/* Text section with subtle 10% tint */}
      <View style={styles.textBackground}>
        <Text
          style={textStyle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {renderCategoryName(name, textStyle)}
        </Text>
      </View>
    </View>
  );
};
const CategoryList = ({
  data = [],
  navigation,
  doctor,
  mode = 'product',
  serviceCategoryId,
  variant = 'default',
  edgeScroll = false,
}: any) => {
  const isConcern = doctor || variant === 'concern';
  const itemWidth = isConcern ? CONCERN_CARD_WIDTH : ITEM_SIZE;

  const handlePress = useCallback(
    (item: Category) => {
      if (doctor) {
        navigation.navigate('CategoryDoctor', {
          categoryName: item.name,
          categoryId: item.id,
        });
        return;
      }

      if (mode === 'health') {
        navigateToCategoryProducts(navigation, {
          categoryName: item.name,
          healthCategoryId: item.id,
          categoryMode: 'health',
          serviceCategoryId: serviceCategoryId || undefined,
        });
        return;
      }

      navigateToCategoryProducts(navigation, {
        categoryId: item.id,
        categoryName: item.name,
        categoryMode: 'product',
        serviceCategoryId: serviceCategoryId || undefined,
      });
    },
    [navigation, doctor, mode, serviceCategoryId],
  );

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.item, { width: itemWidth }, edgeScroll && styles.itemEdge]}
      onPress={() => handlePress(item)}
      activeOpacity={0.82}
    >
      <TileCard
        name={item.name}
        imageUrl={item?.image_url}
        textStyle={isConcern ? styles.concernText : styles.text}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={data}
      nestedScrollEnabled
      scrollEnabled={data.length > 4}
      keyExtractor={(item, index) =>
        String(item?._homeLoopKey ?? item?.id ?? index)
      }
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        isConcern && styles.concernContainer,
        edgeScroll && styles.edgeContainer,
      ]}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      getItemLayout={(_, index) => ({
        length: itemWidth,
        offset: itemWidth * index,
        index,
      })}
    />
  );
};

export default React.memo(CategoryList);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },

  concernContainer: {
    paddingRight: 4,
    gap: 0,
  },

  edgeContainer: {
    ...HORIZONTAL_SCROLL_CONTENT,
    paddingHorizontal: 0,
  },

  item: {
    alignItems: 'center',
    marginHorizontal: 2,
  },

  itemEdge: {
    marginHorizontal: 2,
  },

  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E8EEEA',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  imageContainer: {
    width: '100%',
    aspectRatio: 1,

    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  textBackground: {
    width: '100%',
    minHeight: 48,

    paddingHorizontal: 7,
    paddingVertical: 6,

    // Only a subtle 10% background tint
    backgroundColor: 'rgba(13, 97, 78, 0.10)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
    lineHeight: 16,
    includeFontPadding: false,
    minHeight: 32,
  },

  concernText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
    minHeight: 30,
    includeFontPadding: false,
  },
});
