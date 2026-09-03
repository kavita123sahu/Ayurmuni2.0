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

const CATEGORY_TILE_WIDTH = Math.min(70, Math.round(width / 3.15));
const CIRCLE_RATIO = 0.78;

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
  circleSize,
}: {
  name: string;
  imageUrl: any;
  textStyle: any;
  circleSize: number;
}) => {
  const source = getTileSource(imageUrl);

  return (
    <View style={styles.card}>
      {/* Circular icon bubble */}
      <View
        style={[
          styles.iconCircle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
        ]}
      >
        <Image
          source={source}
          style={[
            styles.cardImage,
            { width: circleSize , height: circleSize  },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Plain label, no background tint */}
      <Text
        style={textStyle}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {name}
        {/* {renderCategoryName(name, textStyle,30)} */}
      </Text>
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
  const itemWidth = CATEGORY_TILE_WIDTH;
  const circleSize = Math.round(itemWidth * CIRCLE_RATIO);

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
        circleSize={circleSize}
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

  // Card is now just a vertical stack: circle + label, no border/shadow/box
  card: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },

  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4F2', // light gray/mint like reference
    marginBottom: 6,
  },

  cardImage: {
    // width/height set dynamically based on circleSize
    objectFit:"cover",
    borderRadius:50,
  },

  text: {
    fontSize: 12,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
    lineHeight: 16,
    includeFontPadding: false,
  },

  concernText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
  },
});