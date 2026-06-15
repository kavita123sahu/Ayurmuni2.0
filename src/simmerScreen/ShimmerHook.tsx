import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors } from '../common/Colors';


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
      }}
    >
      {[1, 2, 3, 4].map(item => (
        <View
          key={item}
          style={{
            width: 190,
            marginRight: 12,
            marginBottom: 14,
            backgroundColor: Colors.bgcolor,
            borderRadius: 18,
            padding: 12,
            borderWidth: 1,
            borderColor: "#EEF2F6",
          }}
        >
          <SkeletonPlaceholder
            borderRadius={16}
          >
            {/* Card */}
            <SkeletonPlaceholder.Item
              width={190}
              borderRadius={16}
            >
              {/* Image */}
              <SkeletonPlaceholder.Item
                width={190}
                height={180}
                borderTopLeftRadius={16}
                borderTopRightRadius={16}
              />

              {/* Content */}
              <SkeletonPlaceholder.Item
                padding={12}
              >
                {/* Title */}
                <SkeletonPlaceholder.Item
                  width={150}
                  height={14}
                  borderRadius={6}
                />

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
                  width={100}
                  height={12}
                  borderRadius={6}
                />

                {/* Bottom */}
                <SkeletonPlaceholder.Item
                  marginTop={16}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <SkeletonPlaceholder.Item
                    width={60}
                    height={20}
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

            {/* Discount Badge */}
            <SkeletonPlaceholder.Item
              position="absolute"
              top={0}
              left={0}
              width={60}
              height={24}
              borderBottomRightRadius={12}
            />

            {/* Wishlist */}
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

export const TopDoctorsCardSkeleton = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 10,
        paddingRight: 10,
      }}
    >
      {[1, 2, 3, 4, 5].map(item => (
        <View
          key={item}
          style={{
            marginRight: 12,
            marginBottom: 14,
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 12,
            borderWidth: 1,
            borderColor: "#EEF2F6",
          }}
        >
          <SkeletonPlaceholder
            borderRadius={12}
            speed={1200}
          >
            <SkeletonPlaceholder.Item
              width={220}
              height={170}
              padding={14}
              borderRadius={20}
            >
              {/* Top Section */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
              >
                <SkeletonPlaceholder.Item
                  width={56}
                  height={56}
                  borderRadius={12}
                />

                <SkeletonPlaceholder.Item
                  marginLeft={10}
                >
                  <SkeletonPlaceholder.Item
                    width={120}
                    height={14}
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
                    width={85}
                    height={22}
                    borderRadius={20}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Experience */}
              <SkeletonPlaceholder.Item
                marginTop={18}
                width={110}
                height={12}
                borderRadius={6}
              />

              {/* Bottom */}
              <SkeletonPlaceholder.Item
                marginTop={20}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width={80}
                  height={12}
                  borderRadius={6}
                />

                <SkeletonPlaceholder.Item
                  width={42}
                  height={42}
                  borderRadius={12}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};


export const HomeCategorySkeleton = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: 10,
      }}
    >
      {[1, 2, 3, 4, 5].map(item => (
        <View
          key={item}
          style={{
            width: ITEM_SIZE,
            alignItems: 'center',
          }}
        >
          <SkeletonPlaceholder
            borderRadius={16}
            speed={1200}
          >
            {/* Circle */}
            <SkeletonPlaceholder.Item
              width={ITEM_SIZE - 12}
              height={ITEM_SIZE - 12}
              borderRadius={20}
            />

            {/* Text */}
            <SkeletonPlaceholder.Item
              marginTop={8}
              alignSelf="center"
              width={45}
              height={10}
              borderRadius={6}
            />
          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};


export const DoctorCardSkeleton = () => {
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
          key={item}
          style={{
            marginBottom: 14,
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 12,
            borderWidth: 1,
            borderColor: "#EEF2F6",
          }}
        >
          <SkeletonPlaceholder borderRadius={12} speed={1200}>

            {/* TOP SECTION */}
            <SkeletonPlaceholder.Item flexDirection="row">

              {/* IMAGE (same as card) */}
              <SkeletonPlaceholder.Item
                width={78}
                height={78}
                borderRadius={14}
              />

              {/* RIGHT SIDE */}
              <SkeletonPlaceholder.Item flex={1} marginLeft={10}>

                {/* TAG + HEART */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  minHeight={26}
                >
                  <SkeletonPlaceholder.Item
                    width={70}
                    height={22}
                    borderRadius={6}
                  />

                  <SkeletonPlaceholder.Item
                    width={28}
                    height={28}
                    borderRadius={14}
                  />
                </SkeletonPlaceholder.Item>

                {/* NAME */}
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width="60%"
                  height={14}
                  borderRadius={6}
                />

                {/* SPECIALITY */}
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width="70%"
                  height={12}
                  borderRadius={6}
                />

                {/* INFO ROW */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  marginTop={8}
                >
                  <SkeletonPlaceholder.Item
                    width={90}
                    height={12}
                    borderRadius={6}
                    marginRight={12}
                  />

                  <SkeletonPlaceholder.Item
                    width={70}
                    height={12}
                    borderRadius={6}
                  />
                </SkeletonPlaceholder.Item>

              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            {/* BOTTOM ROW (IMPORTANT FIX) */}
            <SkeletonPlaceholder.Item
              flexDirection="row"
              marginTop={12}
            >

              {/* CHAT BUTTON */}
              <SkeletonPlaceholder.Item
                width={46}
                height={46}
                borderRadius={12}
                marginRight={8}
              />

              {/* CONSULT BUTTON */}
              <SkeletonPlaceholder.Item
                flex={1}
                height={48}
                borderRadius={12}
              />

            </SkeletonPlaceholder.Item>

          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};