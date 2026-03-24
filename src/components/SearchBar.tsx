// components/SearchBar.tsx
import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';

interface Props {
  placeholder?: string;
  icon: ImageSourcePropType; 
}

const SearchBar: React.FC<Props> = ({
  placeholder = 'Search...',
  icon,
}) => {
  return (
    <View style={styles.container}>
      
      {/* SEARCH ICON */}
      <Image source={icon} style={styles.icon} />

      {/* INPUT */}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 50,

    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
});