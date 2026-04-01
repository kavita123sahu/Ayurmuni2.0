import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Fonts } from '../common/Fonts';

type Props = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  price: string;
};

const OrderItem: React.FC<Props> = ({ image, title, subtitle, price }) => {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.price}>{price}</Text>
    </View>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 16,
    marginRight: 10,
    borderColor:'#006B591A'
  },
  title: {
    fontSize: 14,
    fontFamily:Fonts.PoppinsSemiBold,
    color: '#0F172A',
    lineHeight:20
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight:16
  },
  price: {
    fontSize: 14,
    fontFamily:Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
});