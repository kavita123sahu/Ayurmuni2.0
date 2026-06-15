import React from 'react';
import { ScrollView, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

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
