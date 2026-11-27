import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    try {
      const token = await this.registerForPushNotifications();
      this.expoPushToken = token;
      console.log('Push token:', token);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0066FF',
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('trades', {
          name: 'Trade Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });

        await Notifications.setNotificationChannelAsync('security', {
          name: 'Security Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#F44336',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async scheduleLocalNotification(
    notification: NotificationData,
    seconds: number = 0
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: seconds > 0 ? { seconds } : null,
    });

    return identifier;
  }

  async sendTradeNotification(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<void> {
    await this.scheduleLocalNotification({
      title: `${side.toUpperCase()} Order Executed`,
      body: `${amount} ${symbol} at $${price.toFixed(2)}`,
      data: {
        type: 'trade',
        symbol,
        side,
        amount,
        price,
      },
    });
  }

  async sendPriceAlert(symbol: string, price: number, condition: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: `Price Alert: ${symbol}`,
      body: `${symbol} ${condition} $${price.toFixed(2)}`,
      data: {
        type: 'price_alert',
        symbol,
        price,
        condition,
      },
    });
  }

  async sendSecurityAlert(message: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'Security Alert',
      body: message,
      data: {
        type: 'security',
      },
    });
  }

  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();
