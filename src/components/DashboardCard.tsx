import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';

const SPACING = 8;
const CONTAINER_PADDING = 15;

type Item = {
  value?: string | number;
  label: string;
  image?: any;
  onPress?: () => void;
};

type Props = {
  data: Item[];
  itemCount?: number;
};

const DashboardCard = ({
  data,
  itemCount = 3,
}: Props) => {
  const { width } =
    useWindowDimensions();

  const itemWidth =
    (width -
      CONTAINER_PADDING -
      SPACING * (itemCount - 1)) /
    itemCount;

  return (
    <View style={styles.row}>
      {data.map((item, index) => {
        const content = (
          <>
            {item.image ? (
              <Image
                source={item.image}
                style={{
                  width: itemWidth * 0.20,
                  height: itemWidth * 0.20,
                  marginBottom: 6,
                }}
                resizeMode="contain"
              />
            ) : (
              <Text
                style={[
                  styles.statNumber,
                  {
                    fontSize: Math.max(
                      14,
                      itemWidth * 0.14,
                    ),
                  },
                ]}
              >
                {item.value}
              </Text>
            )}

            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[
                styles.statLabel,
                {
                  fontSize: Math.max(
                    10,
                    itemWidth * 0.1,
                  ),
                },
              ]}
            >
              {item.label}
            </Text>
          </>
        );

        if (item.onPress) {
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.statBox,
                styles.statBoxPressable,
                {
                  width: itemWidth,
                  minHeight: itemWidth * 0.10,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              {content}
            </TouchableOpacity>
          );
        }

        return (
          <View
            key={index}
            style={[
              styles.statBox,
              {
                width: itemWidth,
                minHeight: itemWidth * 0.10,
              },
            ]}
          >
            {content}
          </View>
        );
      })}
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING,
    marginBottom: 10,
  },

  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0D614E1A',
    backgroundColor: '#0D614E0D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  statBoxPressable: {
    borderColor: '#0D614E33',
  },

  statNumber: {
    fontFamily: Fonts.PoppinsBold,
    color: Colors.questionGreen,
  },

  statLabel: {
    color: Colors.questionGreen,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
  },
});