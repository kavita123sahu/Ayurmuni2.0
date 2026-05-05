import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

type Props = {
  name: string;
  subtitle: string;
  description: string;
  image: any;
  buttonText?: string;
  onPress?: () => void;
};

const MentorCard = ({
  name,
  subtitle,
  description,
  image,
  buttonText = 'Consult Mentor',
  onPress,
}: Props) => {
  return (
    <View style={styles.card}>

      <Image source={image} style={styles.image} />

      <Text style={styles.name}>{name}</Text>

     
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Text style={styles.description}>{description}</Text>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>

    </View>
  );
};

export default MentorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#166A57',   // dark green
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },

  name: {
    fontSize: 20,
    fontFamily : Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#6EE7B7',  // light green text
    textAlign: 'center',
    marginBottom: 14,
    fontFamily : Fonts.PoppinsMedium
  },

  description: {
    fontSize: 13,
    color: '#D1FAE5',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily : Fonts.PoppinsMedium,
    marginBottom: 24,
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 14,
    fontFamily :Fonts.PoppinsSemiBold,
    color: '#1C1F23',
  },
});