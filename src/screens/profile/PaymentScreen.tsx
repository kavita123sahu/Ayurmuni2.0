// screens/PaymentsScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import TransactionCard from '../../components/TransactionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '../../components/SectionHeader';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import Header from '../../components/Header';
import { useTransactions } from '../../hooks/useTransactions';

const PaymentsScreen = (props: any) => {
  const {
    transactions,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
  } = useTransactions({ pageSize: 10 });

  const renderItem = useCallback(
    ({ item }: { item: (typeof transactions)[number] }) => (
      <TransactionCard
        name={item.name}
        subtitle={item.paymentMethod}
        date={item.date}
        amount={item.amount}
        iconName={item.iconName}
        status={item.status}
        onPress={() =>
          props.navigation.navigate('TransactionDetailsScreen', {
            transaction: item.raw,
          })
        }
      />
    ),
    [props.navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header
        title="Payments"
        subtitle="Manage Your Transaction"
        onBack={() => props.navigation.goBack()}
      />

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.35}
        // ListHeaderComponent={<SectionHeader title="Transaction History" />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                {error || 'Your payment history will appear here.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            </View>
          ) : hasMore && transactions.length > 0 ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              activeOpacity={0.85}
              onPress={loadMore}
            >
              <Text style={styles.loadMoreText}>Load more</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  list: {
    backgroundColor: '#FDFDFB',
  },
  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  loaderWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreBtn: {
    marginTop: 8,
    marginBottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0D614E33',
    backgroundColor: '#FFFFFF',
  },
  loadMoreText: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptyWrap: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
});
