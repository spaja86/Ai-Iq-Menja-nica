import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../hooks/useAuth';
import { useTradingPairs, useBalances } from '../hooks/useApi';
import { TradingPair, WalletBalance } from '../types';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { data: pairs, isLoading: pairsLoading, refetch: refetchPairs } = useTradingPairs();
  const { data: balances, isLoading: balancesLoading, refetch: refetchBalances } = useBalances();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPairs(), refetchBalances()]);
    setRefreshing(false);
  };

  const calculateTotalBalance = () => {
    if (!balances) return 0;
    return balances.reduce((total, balance) => total + balance.usdValue, 0);
  };

  const getTopGainer = (): TradingPair | null => {
    if (!pairs || pairs.length === 0) return null;
    return pairs.reduce((max, pair) => 
      pair.priceChangePercentage24h > max.priceChangePercentage24h ? pair : max
    );
  };

  const getTopLoser = (): TradingPair | null => {
    if (!pairs || pairs.length === 0) return null;
    return pairs.reduce((min, pair) => 
      pair.priceChangePercentage24h < min.priceChangePercentage24h ? pair : min
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Portfolio Overview */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>
            ${calculateTotalBalance().toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>24h Change</Text>
              <Text style={[styles.statValue, styles.positive]}>+5.24%</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Assets</Text>
              <Text style={styles.statValue}>{balances?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="arrow-down" size={24} color="#0066FF" />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="arrow-up" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="swap-horizontal" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>Trade</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="time-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Market Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {pairsLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <>
              {getTopGainer() && (
                <View style={styles.marketCard}>
                  <View style={styles.marketCardHeader}>
                    <Text style={styles.marketCardLabel}>Top Gainer</Text>
                    <Ionicons name="trending-up" size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.marketCardSymbol}>{getTopGainer()?.symbol}</Text>
                  <Text style={styles.marketCardPrice}>
                    ${getTopGainer()?.lastPrice.toLocaleString()}
                  </Text>
                  <Text style={[styles.marketCardChange, styles.positive]}>
                    +{getTopGainer()?.priceChangePercentage24h.toFixed(2)}%
                  </Text>
                </View>
              )}

              {getTopLoser() && (
                <View style={styles.marketCard}>
                  <View style={styles.marketCardHeader}>
                    <Text style={styles.marketCardLabel}>Top Loser</Text>
                    <Ionicons name="trending-down" size={20} color="#F44336" />
                  </View>
                  <Text style={styles.marketCardSymbol}>{getTopLoser()?.symbol}</Text>
                  <Text style={styles.marketCardPrice}>
                    ${getTopLoser()?.lastPrice.toLocaleString()}
                  </Text>
                  <Text style={[styles.marketCardChange, styles.negative]}>
                    {getTopLoser()?.priceChangePercentage24h.toFixed(2)}%
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Top Assets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Top Assets</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {balancesLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            balances?.slice(0, 5).map((balance) => (
              <View key={balance.asset} style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <View style={styles.assetIcon}>
                    <Text style={styles.assetIconText}>
                      {balance.asset.substring(0, 2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.assetName}>{balance.asset}</Text>
                    <Text style={styles.assetAmount}>
                      {balance.total.toFixed(8)}
                    </Text>
                  </View>
                </View>
                <View style={styles.assetValue}>
                  <Text style={styles.assetValueText}>
                    ${balance.usdValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  content: {
    flex: 1,
  },
  portfolioCard: {
    backgroundColor: '#0066FF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  portfolioLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  portfolioStats: {
    flexDirection: 'row',
    marginTop: 20,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 14,
    color: '#0066FF',
  },
  marketCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  marketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketCardLabel: {
    fontSize: 12,
    color: '#666',
  },
  marketCardSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  marketCardPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  marketCardChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  assetAmount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  assetValue: {
    alignItems: 'flex-end',
  },
  assetValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
});
