import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTradingPairs, useApi } from '../hooks/useApi';
import api from '../services/api';
import { OrderType, OrderSide, CreateOrderParams } from '../types';

export default function TradeScreen() {
  const { data: pairs, isLoading: pairsLoading, refetch } = useTradingPairs();
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('0.00');

  const createOrderApi = useApi(api.createOrder.bind(api));

  useEffect(() => {
    if (price && quantity) {
      const totalValue = (parseFloat(price) * parseFloat(quantity)).toFixed(2);
      setTotal(totalValue);
    } else {
      setTotal('0.00');
    }
  }, [price, quantity]);

  const getCurrentPair = () => {
    return pairs?.find(p => p.symbol === selectedPair);
  };

  const handlePlaceOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const orderParams: CreateOrderParams = {
      symbol: selectedPair,
      type: orderType,
      side: orderSide,
      quantity: parseFloat(quantity),
    };

    if (orderType === 'limit') {
      orderParams.price = parseFloat(price);
    }

    Alert.alert(
      'Confirm Order',
      `Place ${orderSide.toUpperCase()} order for ${quantity} at ${orderType === 'market' ? 'market price' : `$${price}`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const result = await createOrderApi.execute(orderParams);
            if (result) {
              Alert.alert('Success', 'Order placed successfully');
              setPrice('');
              setQuantity('');
            }
          },
        },
      ]
    );
  };

  const currentPair = getCurrentPair();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trade</Text>
        <TouchableOpacity onPress={refetch}>
          <Ionicons name="refresh" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Pair Selector */}
        <View style={styles.pairSelector}>
          <TouchableOpacity style={styles.pairButton}>
            <Text style={styles.pairSymbol}>{selectedPair}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {currentPair && (
            <View style={styles.pairInfo}>
              <Text style={styles.pairPrice}>
                ${currentPair.lastPrice.toLocaleString()}
              </Text>
              <Text style={[
                styles.pairChange,
                currentPair.priceChangePercentage24h >= 0 ? styles.positive : styles.negative
              ]}>
                {currentPair.priceChangePercentage24h >= 0 ? '+' : ''}
                {currentPair.priceChangePercentage24h.toFixed(2)}%
              </Text>
            </View>
          )}
        </View>

        {/* Order Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Order Type</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                orderType === 'limit' && styles.segmentButtonActive,
              ]}
              onPress={() => setOrderType('limit')}
            >
              <Text style={[
                styles.segmentText,
                orderType === 'limit' && styles.segmentTextActive,
              ]}>
                Limit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                orderType === 'market' && styles.segmentButtonActive,
              ]}
              onPress={() => setOrderType('market')}
            >
              <Text style={[
                styles.segmentText,
                orderType === 'market' && styles.segmentTextActive,
              ]}>
                Market
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buy/Sell Tabs */}
        <View style={styles.tradeTabs}>
          <TouchableOpacity
            style={[
              styles.tradeTab,
              orderSide === 'buy' && styles.tradeTabBuyActive,
            ]}
            onPress={() => setOrderSide('buy')}
          >
            <Text style={[
              styles.tradeTabText,
              orderSide === 'buy' && styles.tradeTabTextActive,
            ]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tradeTab,
              orderSide === 'sell' && styles.tradeTabSellActive,
            ]}
            onPress={() => setOrderSide('sell')}
          >
            <Text style={[
              styles.tradeTabText,
              orderSide === 'sell' && styles.tradeTabTextActive,
            ]}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Form */}
        <View style={styles.orderForm}>
          {orderType === 'limit' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputSuffix}>USDT</Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>BTC</Text>
            </View>
          </View>

          <View style={styles.percentageButtons}>
            {[25, 50, 75, 100].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={styles.percentButton}
                onPress={() => {
                  // This would calculate based on available balance
                  setQuantity((0.1 * percent / 100).toFixed(8));
                }}
              >
                <Text style={styles.percentText}>{percent}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>${total} USDT</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available</Text>
              <Text style={styles.summaryValue}>10,000.00 USDT</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              orderSide === 'buy' ? styles.buyButton : styles.sellButton,
            ]}
            onPress={handlePlaceOrder}
            disabled={createOrderApi.isLoading}
          >
            {createOrderApi.isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.placeOrderButtonText}>
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Market Stats */}
        {currentPair && (
          <View style={styles.marketStats}>
            <Text style={styles.sectionTitle}>Market Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>24h High</Text>
                <Text style={styles.statValue}>
                  ${currentPair.high24h.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>24h Low</Text>
                <Text style={styles.statValue}>
                  ${currentPair.low24h.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>24h Volume</Text>
                <Text style={styles.statValue}>
                  {currentPair.volume24h.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Bid/Ask</Text>
                <Text style={styles.statValue}>
                  {currentPair.bid.toFixed(2)}/{currentPair.ask.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
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
  content: {
    flex: 1,
  },
  pairSelector: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  pairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pairSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  pairInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 12,
  },
  pairChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#FFF',
  },
  segmentText: {
    fontSize: 14,
    color: '#666',
  },
  segmentTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  tradeTabs: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tradeTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  tradeTabBuyActive: {
    backgroundColor: '#4CAF50',
  },
  tradeTabSellActive: {
    backgroundColor: '#F44336',
  },
  tradeTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tradeTabTextActive: {
    color: '#FFF',
  },
  orderForm: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#666',
  },
  percentageButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  percentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  percentText: {
    fontSize: 12,
    color: '#666',
  },
  summary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeOrderButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  sellButton: {
    backgroundColor: '#F44336',
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  marketStats: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
