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
      {[1, 2, 3, 4].map(item => (
        <View
          key={item}
          style={{
            width: 232,
            marginRight: 10,
            marginBottom: 6,
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 10,
            borderWidth: 1,
            borderColor: '#E8EDF2',
          }}
        >
          <SkeletonPlaceholder borderRadius={10} speed={1200}>
            <SkeletonPlaceholder.Item flexDirection="row">
              <SkeletonPlaceholder.Item width={54} height={54} borderRadius={10} />
              <SkeletonPlaceholder.Item marginLeft={8} flex={1}>
                <SkeletonPlaceholder.Item width={52} height={14} borderRadius={5} />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width="88%"
                  height={13}
                  borderRadius={5}
                />
                <SkeletonPlaceholder.Item
                  marginTop={4}
                  width="72%"
                  height={11}
                  borderRadius={5}
                />
                <SkeletonPlaceholder.Item flexDirection="row" marginTop={6}>
                  <SkeletonPlaceholder.Item width={48} height={10} borderRadius={4} />
                  <SkeletonPlaceholder.Item
                    marginLeft={8}
                    width={56}
                    height={10}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item
              marginTop={8}
              width="100%"
              height={34}
              borderRadius={9}
            />
          </SkeletonPlaceholder>
        </View>
      ))}
    </ScrollView>
  );
};


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
            <SkeletonPlaceholder.Item
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
            </SkeletonPlaceholder.Item>
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
      <View style={{height:220, backgroundColor:'#E5E7EB'}} />

      <View
        style={{
          height:120,
          margin:16,
          borderRadius:20,
          backgroundColor:'#E5E7EB',
        }}
      />

      <View
        style={{
          height:180,
          margin:16,
          borderRadius:20,
          backgroundColor:'#E5E7EB',
        }}
      />

      {[1,2].map(item => (
        <View
          key={item}
          style={{
            height:220,
            marginHorizontal:16,
            marginBottom:16,
            borderRadius:20,
            backgroundColor:'#E5E7EB',
          }}
        />
      ))}
    </ScrollView>
  );
};