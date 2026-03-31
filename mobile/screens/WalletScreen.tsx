import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useBalances, useTransactions } from '../hooks/useApi';

export default function WalletScreen() {
  const { data: balances, isLoading: balancesLoading, refetch: refetchBalances } = useBalances();
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBalances(), refetchTransactions()]);
    setRefreshing(false);
  };

  const calculateTotalValue = () => {
    if (!balances) return 0;
    return balances.reduce((total, balance) => total + balance.usdValue, 0);
  };

  const getFilteredBalances = () => {
    if (!balances) return [];
    if (showZeroBalances) return balances;
    return balances.filter(b => b.total > 0);
  };

  const handleDeposit = (asset: string) => {
    Alert.alert('Deposit', `Deposit ${asset} functionality would open here`);
  };

  const handleWithdraw = (asset: string) => {
    Alert.alert('Withdraw', `Withdraw ${asset} functionality would open here`);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'arrow-down';
      case 'withdrawal':
        return 'arrow-up';
      case 'trade':
        return 'swap-horizontal';
      default:
        return 'cash-outline';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return '#4CAF50';
      case 'withdrawal':
        return '#F44336';
      case 'trade':
        return '#0066FF';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="scan-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>
            ${calculateTotalValue().toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity 
              style={[styles.balanceAction, styles.depositAction]}
              onPress={() => handleDeposit('USDT')}
            >
              <Ionicons name="arrow-down" size={20} color="#FFF" />
              <Text style={styles.balanceActionText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.balanceAction, styles.withdrawAction]}
              onPress={() => handleWithdraw('USDT')}
            >
              <Ionicons name="arrow-up" size={20} color="#FFF" />
              <Text style={styles.balanceActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
            <TouchableOpacity onPress={() => setShowZeroBalances(!showZeroBalances)}>
              <Text style={styles.filterText}>
                {showZeroBalances ? 'Hide' : 'Show'} Zero Balances
              </Text>
            </TouchableOpacity>
          </View>

          {balancesLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : getFilteredBalances().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No assets found</Text>
            </View>
          ) : (
            getFilteredBalances().map((balance) => (
              <View key={balance.asset} style={styles.assetCard}>
                <View style={styles.assetHeader}>
                  <View style={styles.assetInfo}>
                    <View style={styles.assetIcon}>
                      <Text style={styles.assetIconText}>
                        {balance.asset.substring(0, 2)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.assetName}>{balance.asset}</Text>
                      <Text style={styles.assetValue}>
                        ${balance.usdValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.assetBalances}>
                    <Text style={styles.assetTotal}>{balance.total.toFixed(8)}</Text>
                    <Text style={styles.assetAvailable}>
                      Available: {balance.available.toFixed(8)}
                    </Text>
                  </View>
                </View>
                <View style={styles.assetActions}>
                  <TouchableOpacity
                    style={styles.assetActionButton}
                    onPress={() => handleDeposit(balance.asset)}
                  >
                    <Ionicons name="arrow-down" size={16} color="#0066FF" />
                    <Text style={styles.assetActionButtonText}>Deposit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.assetActionButton}
                    onPress={() => handleWithdraw(balance.asset)}
                  >
                    <Ionicons name="arrow-up" size={16} color="#0066FF" />
                    <Text style={styles.assetActionButtonText}>Withdraw</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.assetActionButton}>
                    <Ionicons name="swap-horizontal" size={16} color="#0066FF" />
                    <Text style={styles.assetActionButtonText}>Trade</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactionsLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : !transactions || transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((transaction) => (
              <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: getTransactionColor(transaction.type) + '20' }
                ]}>
                  <Ionicons
                    name={getTransactionIcon(transaction.type)}
                    size={20}
                    color={getTransactionColor(transaction.type)}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Text>
                  <Text style={styles.transactionTime}>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    transaction.type === 'deposit' && styles.positive,
                    transaction.type === 'withdrawal' && styles.negative,
                  ]}>
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {transaction.amount.toFixed(8)} {transaction.asset}
                  </Text>
                  <View style={[
                    styles.transactionStatus,
                    transaction.status === 'completed' && styles.statusCompleted,
                    transaction.status === 'pending' && styles.statusPending,
                    transaction.status === 'failed' && styles.statusFailed,
                  ]}>
                    <Text style={styles.transactionStatusText}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#0066FF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
  },
  balanceAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  depositAction: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  withdrawAction: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  balanceActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  filterText: {
    fontSize: 14,
    color: '#0066FF',
  },
  seeAll: {
    fontSize: 14,
    color: '#0066FF',
  },
  assetCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  assetValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  assetBalances: {
    alignItems: 'flex-end',
  },
  assetTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  assetAvailable: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  assetActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 16,
  },
  assetActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  assetActionButtonText: {
    fontSize: 12,
    color: '#0066FF',
    marginLeft: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  transactionStatus: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusFailed: {
    backgroundColor: '#FFEBEE',
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
});
