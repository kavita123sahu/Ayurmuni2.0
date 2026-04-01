import React from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: any;

}

const CategoryList = ({ data, navigation }: any) => {
    console.log("navigation=========>",navigation)

  const handlePress = (item: Category) => {
    navigation.navigate('TopCategories', {
      categoryName: item.name,
    });
    
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{gap:14}}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.circle}>
            <Image source={item.icon} style={styles.icon} />
          </View>

          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default CategoryList;

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#0D614E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 6,
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '400',
  },
});