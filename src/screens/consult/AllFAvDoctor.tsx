import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../common/Colors';
import AppHeader from '../../components/AppHeader';
import AllDoctorCard from '../../components/AllDoctorCard';
import { ExpandableSearch } from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { useConsultData } from '../../hooks/useConsultData';
import { useDebounce } from '../../hooks/useDebaunce';
import { doctorListKey } from '../../utils/listKeys';

const H_PAD = 12;
const COL_GAP = 10;
const NUM_COLUMNS = 2;

const AllFavDoctors = (props: any) => {
  const { width } = useWindowDimensions();
  const cardWidth =
    (width - H_PAD * 2 - COL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const [search, setSearch] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { favDoctor, onRefresh, loading, refreshing } = useConsultData({
    fetchCategories: false,
    fetchDoctors: true,
  });

  const filteredDoctors = useMemo(() => {
    let list = (favDoctor || []).filter(
      item => item?.is_favorite || item?.is_favourite,
    );

    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return list;

    return list.filter(doctor => {
      const name = String(doctor?.full_name || doctor?.name || '').toLowerCase();
      const qualification = String(doctor?.qualification || '').toLowerCase();
      return name.includes(keyword) || qualification.includes(keyword);
    });
  }, [favDoctor, debouncedSearch]);

  const renderDoctorItem = useCallback(
    ({ item }: any) => (
      <View style={{ width: cardWidth }}>
        <AllDoctorCard
          item={item}
          variant="grid"
          cardWidth={cardWidth}
          onPress={() =>
            props.navigation.navigate('DoctorProfile', { doctorData: item })
          }
        />
      </View>
    ),
    [cardWidth, props.navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader
        title="Favourite Doctors"
        onLeftPress={() => props.navigation.goBack()}
        onSearchPress={() => setSearchExpanded(true)}
        onRefreshPress={onRefresh}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item, index) => doctorListKey(item, index)}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          renderItem={renderDoctorItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primaryColor]}
              tintColor={Colors.primaryColor}
            />
          }
          ListHeaderComponent={
            <ExpandableSearch
              placeholder="Search doctors..."
              value={search}
              onChangeText={setSearch}
              showTrigger={false}
              expanded={searchExpanded}
              onExpandedChange={setSearchExpanded}
            />
          }
          ListEmptyComponent={<EmptyState title="No favourite doctor found" />}
        />
      )}
    </SafeAreaView>
  );
};

export default AllFavDoctors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
  },
  row: {
    gap: COL_GAP,
    marginBottom: COL_GAP,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
