import React from 'react';
import { Dimensions, ScrollView, View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors } from '../common/Colors';
import {
  GRID_CARD_WIDTH,
} from '../components/ProductCard';

const { width } = Dimensions.get('window');

const ITEM_SIZE = width / 5;

export const ProductDetailShimmer = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 14,
        paddingTop: 12,
      }}
    >
      <SkeletonPlaceholder borderRadius={12}>
        {/* Image Slider */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={280}
          borderRadius={16}
        />

        {/* Title Card */}
        <SkeletonPlaceholder.Item marginTop={16}>
          <SkeletonPlaceholder.Item
            width={100}
            height={24}
            borderRadius={20}
          />

          <SkeletonPlaceholder.Item
            marginTop={12}
            width="60%"
            height={16}
          />

          <SkeletonPlaceholder.Item
            marginTop={8}
            width="85%"
            height={22}
          />

          <SkeletonPlaceholder.Item
            marginTop={8}
            width="100%"
            height={14}
          />

          <SkeletonPlaceholder.Item
            marginTop={6}
            width="90%"
            height={14}
          />
        </SkeletonPlaceholder.Item>

        {/* Price */}
        <SkeletonPlaceholder.Item
          marginTop={20}
          flexDirection="row"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item
            width={90}
            height={30}
          />

          <SkeletonPlaceholder.Item
            marginLeft={10}
            width={70}
            height={20}
          />

          <SkeletonPlaceholder.Item
            marginLeft={10}
            width={60}
            height={24}
            borderRadius={8}
          />
        </SkeletonPlaceholder.Item>

        {/* Variants */}
        <SkeletonPlaceholder.Item
          marginTop={20}
          flexDirection="row"
        >
          {[1, 2, 3].map(item => (
            <SkeletonPlaceholder.Item
              key={item}
              width={90}
              height={40}
              borderRadius={20}
              marginRight={10}
            />
          ))}
        </SkeletonPlaceholder.Item>

        {/* Quantity */}
        <SkeletonPlaceholder.Item
          marginTop={20}
          width="100%"
          height={80}
          borderRadius={16}
        />

        {/* Info Cards */}
        {[1, 2, 3, 4, 5].map(item => (
          <SkeletonPlaceholder.Item
            key={item}
            marginTop={16}
            width="100%"
            height={120}
            borderRadius={16}
          />
        ))}
      </SkeletonPlaceholder>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export const WishlistSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
      }}
    >
      <SkeletonPlaceholder borderRadius={12}>
        {[1, 2, 3].map(row => (
          <SkeletonPlaceholder.Item
            key={row}
            flexDirection="row"
            justifyContent="space-between"
            marginBottom={16}
          >
            {[1, 2].map(card => (
              <SkeletonPlaceholder.Item
                key={card}
                width="48%"
                height={320}
                borderRadius={16}
              >
                {/* Image */}
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={160}
                  borderTopLeftRadius={16}
                  borderTopRightRadius={16}
                />

                {/* Title */}
                <SkeletonPlaceholder.Item
                  marginTop={12}
                  marginHorizontal={12}
                  width="80%"
                  height={16}
                />

                <SkeletonPlaceholder.Item
                  marginTop={8}
                  marginHorizontal={12}
                  width="60%"
                  height={12}
                />

                {/* Price */}
                <SkeletonPlaceholder.Item
                  marginTop={12}
                  marginHorizontal={12}
                  width={70}
                  height={12}
                />

                <SkeletonPlaceholder.Item
                  marginTop={6}
                  marginHorizontal={12}
                  width={90}
                  height={18}
                />

                {/* Cart Button */}
                <SkeletonPlaceholder.Item
                  alignSelf="flex-end"
                  marginRight={12}
                  marginTop={-40}
                  width={40}
                  height={40}
                  borderRadius={20}
                />
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export const TopSellingListSkeleton = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
      }}
    >
      {[1, 2, 3, 4, 5].map(item => (
        <View
          key={item}
          style={{
            width: 190,
            marginRight: 12,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: '#EEF2F7',
            backgroundColor: '#fff',
            overflow: 'hidden',
          }}
        >
          <SkeletonPlaceholder borderRadius={16}>

            {/* CARD WRAPPER */}
            <SkeletonPlaceholder.Item>

              {/* IMAGE */}
              <SkeletonPlaceholder.Item
                width={190}
                height={180}
                borderTopLeftRadius={16}
                borderTopRightRadius={16}
              />

              {/* CONTENT */}
              <SkeletonPlaceholder.Item padding={12}>

                {/* Title */}
                <SkeletonPlaceholder.Item
                  width={150}
                  height={14}
                  borderRadius={6}
                />

                {/* Subtitle */}
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={110}
                  height={14}
                  borderRadius={6}
                />

                {/* Brand */}
                <SkeletonPlaceholder.Item
                  marginTop={10}
                  width={80}
                  height={12}
                  borderRadius={6}
                />

                {/* Rating */}
                <SkeletonPlaceholder.Item
                  marginTop={10}
                  width={120}
                  height={12}
                  borderRadius={6}
                />

                {/* PRICE + BUTTON ROW */}
                <SkeletonPlaceholder.Item
                  marginTop={14}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <SkeletonPlaceholder.Item
                    width={60}
                    height={18}
                    borderRadius={6}
                  />

                  <SkeletonPlaceholder.Item
                    width={42}
                    height={42}
                    borderRadius={12}
                  />
                </SkeletonPlaceholder.Item>

              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            {/* DISCOUNT BADGE */}
            <SkeletonPlaceholder.Item
              position="absolute"
              top={0}
              left={0}
              width={60}
              height={24}
              borderBottomRightRadius={12}
            />

            {/* ❤️ WISHLIST ICON (FIXED - ADDED PROPERLY) */}
            <SkeletonPlaceholder.Item
              position="absolute"
              top={10}
              right={10}
              width={30}
              height={30}
              borderRadius={15}
            />

          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};

const GRID_IMAGE_HEIGHT = 136;
const GRID_INFO_HEIGHT = 94;

type ProductGridSkeletonProps = {
  cardWidth?: number;
  gap?: number;
  count?: number;
  paddingHorizontal?: number;
};

const ProductGridSkeletonCard = ({
  cardWidth,
  imageHeight,
  infoHeight,
}: {
  cardWidth: number;
  imageHeight: number;
  infoHeight: number;
}) => (
  <View
    style={[
      gridSkeletonStyles.card,
      { width: cardWidth, height: imageHeight + infoHeight },
    ]}
  >
    <SkeletonPlaceholder borderRadius={14} speed={1200}>
      <SkeletonPlaceholder.Item width={cardWidth} height={imageHeight} borderRadius={14} />
      <SkeletonPlaceholder.Item padding={10}>
        <SkeletonPlaceholder.Item
          width={cardWidth * 0.78}
          height={12}
          borderRadius={4}
        />
        <SkeletonPlaceholder.Item
          marginTop={6}
          width={cardWidth * 0.52}
          height={10}
          borderRadius={4}
        />
        <SkeletonPlaceholder.Item
          marginTop={8}
          width={cardWidth * 0.42}
          height={10}
          borderRadius={4}
        />
        <SkeletonPlaceholder.Item
          marginTop={10}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item
            width={cardWidth * 0.34}
            height={14}
            borderRadius={4}
          />
          <SkeletonPlaceholder.Item width={34} height={34} borderRadius={10} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  </View>
);

/** 2-column grid skeleton — matches ProductCard grid layout (not horizontal stretch). */
export const ProductGridSkeleton = ({
  cardWidth = GRID_CARD_WIDTH,
  gap = 10,
  count = 6,
  paddingHorizontal = 0,
}: ProductGridSkeletonProps) => {
  const scale = cardWidth / GRID_CARD_WIDTH;
  const imageHeight = GRID_IMAGE_HEIGHT * scale;
  const infoHeight = GRID_INFO_HEIGHT * scale;

  return (
    <View
      style={[
        gridSkeletonStyles.grid,
        { paddingHorizontal, rowGap: gap },
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`product-grid-skeleton-${index}`}
          style={{ width: cardWidth, marginBottom: gap }}
        >
          <ProductGridSkeletonCard
            cardWidth={cardWidth}
            imageHeight={imageHeight}
            infoHeight={infoHeight}
          />
        </View>
      ))}
    </View>
  );
};

const gridSkeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
});

export const TopDoctorsCardSkeleton = () => {
  const cardW = (width - 40 - 10) / 2;
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
      }}
    >
      {[1, 2, 3, 4].map(item => (
        <View
          key={`top-doc-skel-${item}`}
          style={{
            width: cardW,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#D7E8E1',
            paddingTop: 10,
            paddingHorizontal: 8,
            paddingBottom: 8,
            alignItems: 'center',
          }}
        >
          <SkeletonPlaceholder borderRadius={10} speed={1200}>
            <SkeletonPlaceholder.Item
              width={52}
              height={52}
              borderRadius={26}
              alignSelf="center"
            />
            <SkeletonPlaceholder.Item
              marginTop={6}
              width="82%"
              height={12}
              borderRadius={4}
              alignSelf="center"
            />
            <SkeletonPlaceholder.Item
              marginTop={1}
              width="62%"
              height={10}
              borderRadius={4}
              alignSelf="center"
            />
            <SkeletonPlaceholder.Item
              marginTop={4}
              width="70%"
              height={10}
              borderRadius={4}
              alignSelf="center"
            />
            <SkeletonPlaceholder.Item
              marginTop={6}
              width="100%"
              height={28}
              borderRadius={8}
            />
          </SkeletonPlaceholder>
        </View>
      ))}
    </View>
  );
};

/** Matches AllDoctorCard (row list) used on concern / All Doctors screens */
export const AllDoctorCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={`all-doc-skel-${index}`}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#D7E8E1',
          padding: 10,
          marginBottom: 10,
        }}
      >
        <SkeletonPlaceholder borderRadius={10} speed={1200}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="flex-start">
            <SkeletonPlaceholder.Item
              width={56}
              height={56}
              borderRadius={12}
              marginTop={2}
            />
            <SkeletonPlaceholder.Item flex={1} marginLeft={10}>
              <SkeletonPlaceholder.Item
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width="58%"
                  height={14}
                  borderRadius={6}
                />
                <SkeletonPlaceholder.Item
                  width={28}
                  height={28}
                  borderRadius={14}
                />
              </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item
                marginTop={2}
                width="72%"
                height={11}
                borderRadius={5}
              />
              <SkeletonPlaceholder.Item
                flexDirection="row"
                marginTop={6}
                gap={6}
              >
                <SkeletonPlaceholder.Item
                  width={58}
                  height={22}
                  borderRadius={20}
                />
                <SkeletonPlaceholder.Item
                  width={48}
                  height={22}
                  borderRadius={20}
                />
                <SkeletonPlaceholder.Item
                  width={70}
                  height={22}
                  borderRadius={20}
                />
              </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item
                marginTop={8}
                width="100%"
                height={34}
                borderRadius={10}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
    ))}
  </View>
);


const COMPACT_TILE = 64;
const COMPACT_ITEM_WIDTH = Math.floor(
  (Dimensions.get('window').width - 40 - 8 * 4) / 5,
);
const COMPACT_ITEM_GAP = 10;

export const HomeCategorySkeleton = ({ compact = false }: { compact?: boolean }) => {
  const tileSize = compact ? COMPACT_TILE : ITEM_SIZE - 12;
  const itemWidth = compact ? COMPACT_ITEM_WIDTH : ITEM_SIZE;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: compact ? 0 : 10,
      }}
    >
      {[1, 2, 3, 4, 5].map(item => (
        <View
          key={item}
          style={{
            width: itemWidth,
            alignItems: 'center',
            marginRight: compact ? COMPACT_ITEM_GAP : 0,
          }}
        >
          <SkeletonPlaceholder
            borderRadius={16}
            speed={1200}
          >
            <SkeletonPlaceholder.Item
              width={tileSize}
              height={tileSize}
              borderRadius={compact ? 14 : 20}
            />

            <SkeletonPlaceholder.Item
              marginTop={compact ? 4 : 8}
              alignSelf="center"
              width={compact ? 52 : 45}
              height={10}
              borderRadius={6}
            />
          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};

/** Horizontal pill chips for disease / subcategory loading */
export const DiseaseChipSkeleton = ({ count = 5 }: { count?: number }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonPlaceholder key={i} borderRadius={18} speed={1200}>
        <SkeletonPlaceholder.Item
          width={72 + (i % 3) * 18}
          height={34}
          borderRadius={18}
        />
      </SkeletonPlaceholder>
    ))}
  </ScrollView>
);


export const DoctorCardSkeleton = () => {
  return <AllDoctorCardSkeleton count={5} />;
};

export const AppointmentSkeletonList = () => {
  return (

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 100,
        // paddingHorizontal: 15,
      }}
    >
      {[1, 2, 3, 4, 5].map(item => (
        <View
          key={`appointment-skel-${item}`}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 20,
            borderWidth: 1,
            marginTop: 10,
            borderColor: Colors.borderColor,
            padding: 10,
            marginBottom: 16,
          }}
        >
          <SkeletonPlaceholder
            backgroundColor="#E5E7EB"
            highlightColor="#F8FAFC"
          >
            {/* HEADER */}
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
              <SkeletonPlaceholder.Item
                width={48}
                height={48}
                borderRadius={14}
              />

              <SkeletonPlaceholder.Item flex={1} marginLeft={10}>
                <SkeletonPlaceholder.Item
                  width="60%"
                  height={14}
                  borderRadius={6}
                />
                <SkeletonPlaceholder.Item
                  marginTop={8}
                  width="45%"
                  height={12}
                  borderRadius={6}
                />
              </SkeletonPlaceholder.Item>

              <SkeletonPlaceholder.Item
                width={70}
                height={24}
                borderRadius={8}
              />
            </SkeletonPlaceholder.Item>

            {/* DATE TIME CARD */}
            <SkeletonPlaceholder.Item
              marginTop={12}
              height={68}
              borderRadius={12}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal={12}
            >
              {/* DATE */}
              <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                <SkeletonPlaceholder.Item
                  width={32}
                  height={32}
                  borderRadius={8}
                />
                <SkeletonPlaceholder.Item marginLeft={8}>
                  <SkeletonPlaceholder.Item
                    width={40}
                    height={8}
                    borderRadius={4}
                  />
                  <SkeletonPlaceholder.Item
                    marginTop={6}
                    width={80}
                    height={10}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* TIME */}
              <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                <SkeletonPlaceholder.Item
                  width={32}
                  height={32}
                  borderRadius={8}
                />
                <SkeletonPlaceholder.Item marginLeft={8}>
                  <SkeletonPlaceholder.Item
                    width={40}
                    height={8}
                    borderRadius={4}
                  />
                  <SkeletonPlaceholder.Item
                    marginTop={6}
                    width={60}
                    height={10}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            {/* BUTTONS (IMPORTANT FIX) */}
            {/* <SkeletonPlaceholder.Item
              marginTop={14}
              flexDirection="row"
              justifyContent="space-between"
            >
              <SkeletonPlaceholder.Item
                width="48%"
                height={47}
                borderRadius={10}
              />

              <SkeletonPlaceholder.Item
                width="48%"
                height={47}
                borderRadius={10}
              />
            </SkeletonPlaceholder.Item> */}
          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  )
}

export const AppointmentDetailSkeleton = () => {
  return (
    <SkeletonPlaceholder>

      {/* DOCTOR CARD */}
      <SkeletonPlaceholder.Item margin={16} borderRadius={18}>

        {/* HEADER */}
        <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
          <SkeletonPlaceholder.Item
            width={55}
            height={55}
            borderRadius={16}
          />

          <SkeletonPlaceholder.Item marginLeft={12}>
            <SkeletonPlaceholder.Item
              width={130}
              height={12}
              borderRadius={4}
            />
            <SkeletonPlaceholder.Item
              marginTop={8}
              width={170}
              height={10}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* DATE */}
        <SkeletonPlaceholder.Item
          marginTop={18}
          flexDirection="row"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item
            width={32}
            height={32}
            borderRadius={8}
          />

          <SkeletonPlaceholder.Item marginLeft={10}>
            <SkeletonPlaceholder.Item width={50} height={10} />
            <SkeletonPlaceholder.Item
              marginTop={6}
              width={140}
              height={10}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* TIME */}
        <SkeletonPlaceholder.Item
          marginTop={14}
          flexDirection="row"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item
            width={32}
            height={32}
            borderRadius={8}
          />

          <SkeletonPlaceholder.Item marginLeft={10}>
            <SkeletonPlaceholder.Item width={50} height={10} />
            <SkeletonPlaceholder.Item
              marginTop={6}
              width={120}
              height={10}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* BUTTONS */}
        <SkeletonPlaceholder.Item marginTop={20}>
          <SkeletonPlaceholder.Item
            height={45}
            borderRadius={12}
          />
          <SkeletonPlaceholder.Item
            marginTop={10}
            height={45}
            borderRadius={12}
          />
        </SkeletonPlaceholder.Item>

      </SkeletonPlaceholder.Item>

      {/* PATIENT CARD */}
      <SkeletonPlaceholder.Item margin={16}>
        <SkeletonPlaceholder.Item width={140} height={12} />

        <SkeletonPlaceholder.Item
          marginTop={10}
          height={80}
          borderRadius={12}
        />
      </SkeletonPlaceholder.Item>

      {/* REASON */}
      <SkeletonPlaceholder.Item margin={16}>
        <SkeletonPlaceholder.Item width={160} height={12} />

        <SkeletonPlaceholder.Item
          marginTop={10}
          height={90}
          borderRadius={12}
        />
      </SkeletonPlaceholder.Item>

    </SkeletonPlaceholder>
  );
};

export const DoctorSlipSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 120,
      }}
    >
      <SkeletonPlaceholder
        backgroundColor="#E5E7EB"
        highlightColor="#F8FAFC"
      >
        {/* Patient Card */}
        <SkeletonPlaceholder.Item
          borderRadius={20}
          height={140}
          marginTop={12}
        />

        {/* Doctor Notes Header */}
        <SkeletonPlaceholder.Item
          width={140}
          height={22}
          borderRadius={6}
          marginTop={24}
        />

        {/* Notes Card */}
        <SkeletonPlaceholder.Item
          borderRadius={20}
          padding={20}
          marginTop={12}
        >
          <SkeletonPlaceholder.Item
            width="100%"
            height={12}
            borderRadius={4}
            marginBottom={10}
          />
          <SkeletonPlaceholder.Item
            width="95%"
            height={12}
            borderRadius={4}
            marginBottom={10}
          />
          <SkeletonPlaceholder.Item
            width="85%"
            height={12}
            borderRadius={4}
            marginBottom={20}
          />

          <SkeletonPlaceholder.Item
            width="60%"
            height={12}
            borderRadius={4}
          />
        </SkeletonPlaceholder.Item>

        {/* Current Regimen Header */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginTop={24}
        >
          <SkeletonPlaceholder.Item
            width={140}
            height={22}
            borderRadius={6}
          />

          <SkeletonPlaceholder.Item
            width={100}
            height={18}
            borderRadius={6}
          />
        </SkeletonPlaceholder.Item>

        {/* Medicine Cards */}
        {[1, 2, 3].map(item => (
          <SkeletonPlaceholder.Item
            key={item}
            borderRadius={18}
            padding={18}
            marginTop={12}
          >
            <SkeletonPlaceholder.Item
              flexDirection="row"
              justifyContent="space-between"
            >
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width={42}
                  height={42}
                  borderRadius={14}
                />

                <SkeletonPlaceholder.Item
                  marginLeft={12}
                >
                  <SkeletonPlaceholder.Item
                    width={140}
                    height={14}
                    borderRadius={4}
                  />
                  <SkeletonPlaceholder.Item
                    width={100}
                    height={12}
                    borderRadius={4}
                    marginTop={8}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              <SkeletonPlaceholder.Item
                width={70}
                height={24}
                borderRadius={6}
              />
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item
              width={80}
              height={12}
              borderRadius={4}
              marginTop={16}
              alignSelf="flex-end"
            />
          </SkeletonPlaceholder.Item>
        ))}

        {/* Guidelines */}
        <SkeletonPlaceholder.Item
          borderRadius={18}
          padding={18}
          marginTop={24}
        >
          <SkeletonPlaceholder.Item
            width={180}
            height={18}
            borderRadius={4}
            marginBottom={18}
          />

          {[1, 2, 3, 4].map(item => (
            <SkeletonPlaceholder.Item
              key={item}
              flexDirection="row"
              marginBottom={16}
            >
              <SkeletonPlaceholder.Item
                width={22}
                height={22}
                borderRadius={11}
              />

              <SkeletonPlaceholder.Item
                marginLeft={12}
              >
                <SkeletonPlaceholder.Item
                  width={220}
                  height={12}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  width={180}
                  height={12}
                  borderRadius={4}
                  marginTop={6}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          ))}
        </SkeletonPlaceholder.Item>

        {/* Footer */}
        <SkeletonPlaceholder.Item
          alignItems="center"
          marginTop={24}
        >
          <SkeletonPlaceholder.Item
            width={180}
            height={22}
            borderRadius={6}
          />

          <SkeletonPlaceholder.Item
            width={200}
            height={14}
            borderRadius={4}
            marginTop={10}
          />

          <SkeletonPlaceholder.Item
            width={220}
            height={14}
            borderRadius={4}
            marginTop={16}
          />

          <SkeletonPlaceholder.Item
            width={260}
            height={12}
            borderRadius={4}
            marginTop={8}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </ScrollView>
  );
};

export const HorizontalAppointmentSkeleton = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: 5,
        paddingRight: 20,
      }}
    >
      {[1, 2, 3, 4, 5].map(item => (
        <View
          key={item}
          style={{
            width: 240,
            marginRight: 12,
            backgroundColor: Colors.white,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.borderColor,
            padding: 10,
          }}
        >
          <SkeletonPlaceholder
            backgroundColor="#E5E7EB"
            highlightColor="#F8FAFC"
          >
            {/* Status */}
            <SkeletonPlaceholder.Item
              alignSelf="flex-end"
              width={70}
              height={24}
              borderRadius={8}
            />

            {/* Doctor Row */}
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginTop={12}
            >
              <SkeletonPlaceholder.Item
                width={42}
                height={42}
                borderRadius={12}
              />

              <SkeletonPlaceholder.Item
                marginLeft={8}
                flex={1}
              >
                <SkeletonPlaceholder.Item
                  width="75%"
                  height={12}
                  borderRadius={6}
                />

                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width="55%"
                  height={10}
                  borderRadius={6}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            {/* Date Time Card */}
            <SkeletonPlaceholder.Item
              marginTop={12}
              height={42}
              borderRadius={10}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal={10}
            >
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width={16}
                  height={16}
                  borderRadius={4}
                />

                <SkeletonPlaceholder.Item
                  marginLeft={6}
                  width={65}
                  height={10}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>

              <SkeletonPlaceholder.Item
                width={1}
                height={16}
                borderRadius={1}
              />

              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width={16}
                  height={16}
                  borderRadius={4}
                />

                <SkeletonPlaceholder.Item
                  marginLeft={6}
                  width={45}
                  height={10}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};


type Props = {
  prescribed?: boolean;
};
export const MyProductCardSkeleton = () => {
  return (
    <View>
      {[1, 2, 3, 4, 5].map(item => (
        <SkeletonPlaceholder
          key={item}
          backgroundColor="#E5E7EB"
          highlightColor="#F8FAFC"
        >
          <SkeletonPlaceholder.Item
            marginBottom={14}
            borderRadius={20}
            padding={14}
          >
            {/* Card */}
            <SkeletonPlaceholder.Item
              backgroundColor="#FFF"
              borderRadius={20}
              padding={14}
            >
              {/* Top Row */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
              >
                {/* Checkbox */}
                <SkeletonPlaceholder.Item
                  width={24}
                  height={24}
                  borderRadius={8}
                />

                {/* Product Image */}
                <SkeletonPlaceholder.Item
                  width={74}
                  height={74}
                  borderRadius={18}
                  marginLeft={12}
                />

                {/* Details */}
                <SkeletonPlaceholder.Item
                  marginLeft={12}
                  flex={1}
                >
                  <SkeletonPlaceholder.Item
                    width={140}
                    height={16}
                    borderRadius={6}
                  />

                  <SkeletonPlaceholder.Item
                    marginTop={8}
                    width={90}
                    height={12}
                    borderRadius={6}
                  />

                  <SkeletonPlaceholder.Item
                    marginTop={10}
                    width={70}
                    height={18}
                    borderRadius={6}
                  />
                </SkeletonPlaceholder.Item>

                {/* Quantity Box */}
                <SkeletonPlaceholder.Item
                  width={42}
                  height={110}
                  borderRadius={14}
                >
                  <SkeletonPlaceholder.Item
                    width={34}
                    height={34}
                    borderRadius={10}
                    marginLeft={4}
                    marginTop={4}
                  />

                  <SkeletonPlaceholder.Item
                    width={18}
                    height={12}
                    borderRadius={4}
                    marginTop={12}
                    marginLeft={12}
                  />

                  <SkeletonPlaceholder.Item
                    width={34}
                    height={34}
                    borderRadius={10}
                    marginTop={12}
                    marginLeft={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Prescribed Section */}
              <SkeletonPlaceholder.Item
                marginTop={14}
                paddingTop={12}
              >
                <SkeletonPlaceholder.Item
                  height={1}
                  width="100%"
                  marginBottom={12}
                />

                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                >
                  <SkeletonPlaceholder.Item
                    width={24}
                    height={24}
                    borderRadius={12}
                  />

                  <SkeletonPlaceholder.Item
                    width={180}
                    height={12}
                    borderRadius={6}
                    marginLeft={8}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      ))}
    </View>
  );
};

export const PrakritiProfileSkeleton = () => {
  return (
    <ScrollView>
      <View style={{ height: 220, backgroundColor: '#E5E7EB' }} />

      <View
        style={{
          height: 120,
          margin: 16,
          borderRadius: 20,
          backgroundColor: '#E5E7EB',
        }}
      />

      <View
        style={{
          height: 180,
          margin: 16,
          borderRadius: 20,
          backgroundColor: '#E5E7EB',
        }}
      />

      {[1, 2].map(item => (
        <View
          key={item}
          style={{
            height: 220,
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 20,
            backgroundColor: '#E5E7EB',
          }}
        />
      ))}
    </ScrollView>
  );
};

const SectionTitleSkeleton = ({ width: titleWidth = 140 }: { width?: number }) => (
  <SkeletonPlaceholder borderRadius={6} speed={1200}>
    <SkeletonPlaceholder.Item
      width={titleWidth}
      height={16}
      borderRadius={6}
      marginTop={16}
      marginBottom={12}
    />
  </SkeletonPlaceholder>
);

/** Promo banner — matches PromoCard on Products screen */
export const PromoCardSkeleton = () => (
  <SkeletonPlaceholder borderRadius={16} speed={1200}>
    <SkeletonPlaceholder.Item
      width="100%"
      height={140}
      borderRadius={18}
      marginTop={8}
    />
  </SkeletonPlaceholder>
);

/** Horizontal category / concern chips */
export const CategoryRowSkeleton = ({ count = 5 }: { count?: number }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingVertical: 4 }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={index}
        style={{ width: ITEM_SIZE, alignItems: 'center', marginRight: 4 }}
      >
        <SkeletonPlaceholder borderRadius={16} speed={1200}>
          <SkeletonPlaceholder.Item
            width={ITEM_SIZE - 16}
            height={ITEM_SIZE - 16}
            borderRadius={18}
          />
          <SkeletonPlaceholder.Item
            marginTop={8}
            alignSelf="center"
            width={48}
            height={10}
            borderRadius={5}
          />
        </SkeletonPlaceholder>
      </View>
    ))}
  </ScrollView>
);

/** Two action tiles — Medicine screen top */
export const ActionCardsSkeleton = () => (
  <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
    {[1, 2].map(item => (
      <View key={item} style={{ flex: 1 }}>
        <SkeletonPlaceholder borderRadius={16} speed={1200}>
          <SkeletonPlaceholder.Item width="100%" height={110} borderRadius={16} />
        </SkeletonPlaceholder>
      </View>
    ))}
  </View>
);

/** Horizontal recent-order / brand strip */
export const HorizontalChipSkeleton = ({
  count = 4,
  width: chipW = 88,
  height: chipH = 88,
}: {
  count?: number;
  width?: number;
  height?: number;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingVertical: 6, gap: 10 }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonPlaceholder key={index} borderRadius={14} speed={1200}>
        <SkeletonPlaceholder.Item width={chipW} height={chipH} borderRadius={14} />
      </SkeletonPlaceholder>
    ))}
  </ScrollView>
);

/** Full Products screen skeleton — promo + categories + product grid */
export const ProductsScreenSkeleton = () => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 40 }}
  >
    <PromoCardSkeleton />
    <SectionTitleSkeleton width={150} />
    <CategoryRowSkeleton />
    <SectionTitleSkeleton width={120} />
    <ProductGridSkeleton cardWidth={GRID_CARD_WIDTH} gap={10} count={6} />
  </ScrollView>
);

/** Full Medicine screen skeleton — actions + recent + concern + brands + grid */
export const MedicineScreenSkeleton = () => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
  >
    <ActionCardsSkeleton />
    <SectionTitleSkeleton width={130} />
    <HorizontalChipSkeleton count={4} width={100} height={72} />
    <SectionTitleSkeleton width={140} />
    <CategoryRowSkeleton />
    <SectionTitleSkeleton width={130} />
    <HorizontalChipSkeleton count={5} width={72} height={72} />
    <SectionTitleSkeleton width={130} />
    <ProductGridSkeleton cardWidth={GRID_CARD_WIDTH} gap={10} count={6} />
  </ScrollView>
);

/** Suggested diet / yoga card row on home */
export const SuggestedCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonPlaceholder key={index} borderRadius={14} speed={1200}>
        <SkeletonPlaceholder.Item width={168} height={200} borderRadius={14} />
      </SkeletonPlaceholder>
    ))}
  </ScrollView>
);

/** Diet plan list skeleton */
export const DietListSkeleton = ({ count = 4 }: { count?: number }) => (
  <View style={{ paddingTop: 8, gap: 12 }}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonPlaceholder key={index} borderRadius={14} speed={1200}>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          padding={12}
        >
          <SkeletonPlaceholder.Item width={56} height={56} borderRadius={12} />
          <SkeletonPlaceholder.Item marginLeft={12} flex={1}>
            <SkeletonPlaceholder.Item width="75%" height={14} borderRadius={6} />
            <SkeletonPlaceholder.Item
              width="50%"
              height={11}
              borderRadius={5}
              marginTop={8}
            />
            <SkeletonPlaceholder.Item
              flexDirection="row"
              marginTop={10}
              gap={6}
            >
              <SkeletonPlaceholder.Item width={54} height={20} borderRadius={8} />
              <SkeletonPlaceholder.Item width={54} height={20} borderRadius={8} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    ))}
  </View>
);

/** Diet plan detail / start skeleton */
export const DietDetailSkeleton = () => (
  <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
    <SkeletonPlaceholder borderRadius={20} speed={1200}>
      <SkeletonPlaceholder.Item width="100%" height={200} borderRadius={22} />
      <SkeletonPlaceholder.Item
        marginTop={-24}
        marginHorizontal={4}
        padding={18}
        borderRadius={20}
      >
        <SkeletonPlaceholder.Item flexDirection="row" gap={8}>
          <SkeletonPlaceholder.Item width={64} height={24} borderRadius={10} />
          <SkeletonPlaceholder.Item width={64} height={24} borderRadius={10} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          width="90%"
          height={20}
          borderRadius={8}
          marginTop={14}
        />
        <SkeletonPlaceholder.Item
          width="60%"
          height={13}
          borderRadius={6}
          marginTop={10}
        />
        <SkeletonPlaceholder.Item
          width="100%"
          height={12}
          borderRadius={6}
          marginTop={18}
        />
        <SkeletonPlaceholder.Item
          width="100%"
          height={12}
          borderRadius={6}
          marginTop={12}
        />
      </SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        width="100%"
        height={52}
        borderRadius={14}
        marginTop={20}
      />
    </SkeletonPlaceholder>
  </ScrollView>
);

/** Active diet tracking skeleton (days + vitality + meals) */
export const DietActiveSkeleton = () => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
  >
    <SkeletonPlaceholder borderRadius={16} speed={1200}>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="space-between"
        marginBottom={14}
      >
        <SkeletonPlaceholder.Item width={120} height={28} borderRadius={20} />
        <SkeletonPlaceholder.Item width={80} height={18} borderRadius={8} />
      </SkeletonPlaceholder.Item>

      <SkeletonPlaceholder.Item
        width={90}
        height={16}
        borderRadius={6}
        marginBottom={12}
      />
      <SkeletonPlaceholder.Item flexDirection="row" gap={10} marginBottom={18}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPlaceholder.Item
            key={i}
            width={88}
            height={78}
            borderRadius={16}
          />
        ))}
      </SkeletonPlaceholder.Item>

      <SkeletonPlaceholder.Item
        width="100%"
        height={170}
        borderRadius={20}
        marginBottom={16}
      />
      <SkeletonPlaceholder.Item
        width="100%"
        height={88}
        borderRadius={20}
        marginBottom={18}
      />

      <SkeletonPlaceholder.Item
        width={140}
        height={16}
        borderRadius={6}
        marginBottom={12}
      />
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPlaceholder.Item
          key={i}
          flexDirection="row"
          height={110}
          borderRadius={20}
          marginBottom={12}
          overflow="hidden"
        >
          <SkeletonPlaceholder.Item width={110} height={110} />
          <SkeletonPlaceholder.Item flex={1} padding={14}>
            <SkeletonPlaceholder.Item width="40%" height={11} borderRadius={5} />
            <SkeletonPlaceholder.Item
              width="85%"
              height={15}
              borderRadius={6}
              marginTop={10}
            />
            <SkeletonPlaceholder.Item
              width="60%"
              height={12}
              borderRadius={5}
              marginTop={8}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      ))}
    </SkeletonPlaceholder>
  </ScrollView>
);

/** Order History list skeleton (matches OrderCard layout). */
export const OrderHistorySkeleton = ({ count = 6 }: { count?: number }) => (
  <View style={{ paddingTop: 8 }}>
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={`order-skel-${index}`}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#EEF2F6',
        }}
      >
        <SkeletonPlaceholder borderRadius={12} speed={1200}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="flex-start">
            <SkeletonPlaceholder.Item width={52} height={52} borderRadius={12} />
            <SkeletonPlaceholder.Item flex={1} marginLeft={12}>
              <SkeletonPlaceholder.Item
                width="72%"
                height={14}
                borderRadius={6}
              />
              <SkeletonPlaceholder.Item
                width="48%"
                height={12}
                borderRadius={5}
                marginTop={8}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              width={72}
              height={24}
              borderRadius={12}
            />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-between"
            marginTop={14}
          >
            <SkeletonPlaceholder.Item width="40%" height={12} borderRadius={5} />
            <SkeletonPlaceholder.Item width="28%" height={14} borderRadius={5} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
    ))}
  </View>
);
