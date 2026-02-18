/**
 * Markets Screen
 * Displays available trading markets and their current prices
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { marketAPI } from '../api';

export default function MarketsScreen({ navigation }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMarkets = async () => {
    try {
      const response = await marketAPI.getMarkets();
      setMarkets(response.data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMarkets();
  };

  const navigateToMarket = (market) => {
    navigation.navigate('Trade', { market });
  };

  const renderMarket = ({ item }) => (
    <TouchableOpacity
      style={styles.marketItem}
      onPress={() => navigateToMarket(item)}
    >
      <View style={styles.marketInfo}>
        <Text style={styles.marketSymbol}>{item.symbol}</Text>
        <Text style={styles.marketAssets}>
          {item.base_asset.name} / {item.quote_asset.name}
        </Text>
      </View>
      <View style={styles.marketStats}>
        <Text style={styles.marketStatus}>
          {item.is_active ? '🟢 Active' : '🔴 Inactive'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trading Markets</Text>
      <FlatList
        data={markets}
        renderItem={renderMarket}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No markets available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  list: {
    padding: 15,
  },
  marketItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marketInfo: {
    flex: 1,
  },
  marketSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  marketAssets: {
    fontSize: 14,
    color: '#666',
  },
  marketStats: {
    alignItems: 'flex-end',
  },
  marketStatus: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
