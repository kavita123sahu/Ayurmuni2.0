// components/PromoCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';

interface Props {
  onPress?: () => void;
  image: ImageSourcePropType;
  arrowIcon?: ImageSourcePropType;

  title: string;
  desc: string;
  tag?: string;

  showButton?: boolean; 
}

const PromoCard: React.FC<Props> = ({
  onPress,
  image,
  arrowIcon,
  title,
  desc,
  tag,
  showButton = true, 
}) => {
  return (
    <View style={styles.card}>

      {/* ROW */}
      <View style={styles.row}>

        <View style={styles.content}>

          {tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{tag}</Text>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>

        </View>

        <Image source={image} style={styles.image} />
      </View>

      {/* 👇 CONDITIONALLY SHOW */}
      {showButton && (
        <>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.btnRow} onPress={onPress}>
            <Text style={styles.btnText}>Shop Now</Text>
            {arrowIcon && <Image source={arrowIcon} style={styles.arrow} />}
          </TouchableOpacity>
        </>
      )}

    </View>
  );
};

export default PromoCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#0D614E0D',
    borderWidth: 1,
    borderColor: '#0D614E33',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    paddingRight: 10,
  },

  image: {
    width: 80,
    height: 75,
    resizeMode: 'contain',
  },

  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },

  tag: {
    fontSize: 10,
    color: '#0D614E',
    fontWeight: '700',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
  },

  desc: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
  },

  btnText: {
    color: '#0D614E',
    fontWeight: '500',
    fontSize: 14,
  },

  arrow: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});