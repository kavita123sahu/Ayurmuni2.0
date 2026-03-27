import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Header from '../../components/Header';

const TopCategories = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { categoryName } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFDFB' }}>

      <Header
        title={categoryName}
        subtitle="Organic product"
        backIcon={require('../../assets/images/backButton.png')}
        onBack={() => navigation.goBack()} 
      />

      <Text style={{ margin: 20 }}>
        Selected Category: {categoryName}
      </Text>

    </View>
  );
};

export default TopCategories;