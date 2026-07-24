import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
} from 'react-native';
import OrderCard from '../../components/OrderCard';
import Header from '../../components/Header';
import { ExpandableSearch } from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDebounce } from '../../hooks/useDebaunce';
import { matchesSearch } from '../../utils/searchUtils';
import { useOrders } from '../../hooks/useOrders';
import { formatOrderStatus } from '../../utils/orderUtils';
import { Fonts } from '../../common/Fonts';

const OrderHistory = (props: any) => {
  const [searchText, setSearchText] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const debouncedSearch = useDebounce(searchText, 400);
  const { orderListItems, loading, refreshing, error, refresh } = useOrders();

  const filteredOrders = useMemo(() => {
    const q = debouncedSearch.trim();
    if (!q) {
      return orderListItems;
    }

    return orderListItems.filter(item =>
      matchesSearch(
        q,
        item.title,
        item.orderCode,
        item.id,
        item.status,
        item.date,
      ),
    );
  }, [debouncedSearch, orderListItems]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Header
        title="Order History"
        subtitle="Track your medicines & labs"
        onBack={() => {
          props.navigation.goBack();
        }}
        onSearchPress={() => setSearchExpanded(true)}
        onRefreshPress={refresh}
      />

      <ExpandableSearch
        placeholder="Search order id or title..."
        value={searchText}
        onChangeText={setSearchText}
        showTrigger={false}
        expanded={searchExpanded}
        onExpandedChange={setSearchExpanded}
      />

      {loading && orderListItems.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OrderCard
              title={item.title}
              id={item.orderCode}
              status={formatOrderStatus(item.status)}
              date={item.date}
              amount={item.amount}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            filteredOrders.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[Colors.primaryColor]}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                iconName="receipt"
                title={error ? 'Could not load orders' : 'No orders yet'}
                subtitle={
                  error
                    ? 'Pull down to retry.'
                    : 'Your medicine orders will appear here.'
                }
              />
            ) : null
          }
        />
      )}

      {error && orderListItems.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </SafeAreaView>
  );
};

export default OrderHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: Colors.errorColor,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 12,
    marginBottom: 12,
  },
});
