import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../hooks/useAuth';

export default function SettingsScreen() {
  const { user, logout, biometricConfig, enableBiometric, disableBiometric } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const success = await enableBiometric();
      if (!success) {
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      Alert.alert(
        'Disable Biometric',
        'Are you sure you want to disable biometric authentication?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: disableBiometric,
          },
        ]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#0066FF" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={24} color="#0066FF" />
          </TouchableOpacity>
        </View>

        {/* Account Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingGroup}>
            <SettingItem
              icon="shield-checkmark-outline"
              title="KYC Verification"
              subtitle={user?.kycVerified ? 'Verified' : 'Not verified'}
              onPress={() => Alert.alert('KYC', 'KYC verification flow would open here')}
            />
            <SettingItem
              icon="mail-outline"
              title="Email"
              subtitle={user?.email || 'Not set'}
              onPress={() => Alert.alert('Email', 'Email settings would open here')}
            />
            <SettingItem
              icon="call-outline"
              title="Phone Number"
              subtitle={user?.phoneVerified ? user.phoneNumber : 'Not verified'}
              onPress={() => Alert.alert('Phone', 'Phone settings would open here')}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingGroup}>
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => Alert.alert('Password', 'Change password flow would open here')}
            />
            <SettingItem
              icon="shield-outline"
              title="Two-Factor Authentication"
              subtitle={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              onPress={() => Alert.alert('2FA', '2FA settings would open here')}
            />
            {biometricConfig.type && (
              <SettingItem
                icon={biometricConfig.type === 'face' ? 'scan' : 'finger-print'}
                title="Biometric Authentication"
                subtitle={`${biometricConfig.type === 'face' ? 'Face ID' : 'Fingerprint'}`}
                showArrow={false}
                rightComponent={
                  <Switch
                    value={biometricConfig.enabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{ false: '#CCC', true: '#0066FF' }}
                    thumbColor="#FFF"
                  />
                }
              />
            )}
            <SettingItem
              icon="key-outline"
              title="API Keys"
              onPress={() => Alert.alert('API Keys', 'API key management would open here')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingGroup}>
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#CCC', true: '#0066FF' }}
                  thumbColor="#FFF"
                />
              }
            />
            <SettingItem
              icon="pricetag-outline"
              title="Price Alerts"
              showArrow={false}
              rightComponent={
                <Switch
                  value={priceAlerts}
                  onValueChange={setPriceAlerts}
                  trackColor={{ false: '#CCC', true: '#0066FF' }}
                  thumbColor="#FFF"
                />
              }
            />
            <SettingItem
              icon="trending-up-outline"
              title="Trade Notifications"
              showArrow={false}
              rightComponent={
                <Switch
                  value={tradeAlerts}
                  onValueChange={setTradeAlerts}
                  trackColor={{ false: '#CCC', true: '#0066FF' }}
                  thumbColor="#FFF"
                />
              }
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingGroup}>
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              showArrow={false}
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#CCC', true: '#0066FF' }}
                  thumbColor="#FFF"
                />
              }
            />
            <SettingItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert('Language', 'Language selection would open here')}
            />
            <SettingItem
              icon="cash-outline"
              title="Currency"
              subtitle="USD"
              onPress={() => Alert.alert('Currency', 'Currency selection would open here')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingGroup}>
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => Alert.alert('Help', 'Help center would open here')}
            />
            <SettingItem
              icon="chatbubble-outline"
              title="Contact Support"
              onPress={() => Alert.alert('Support', 'Support chat would open here')}
            />
            <SettingItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => Alert.alert('Terms', 'Terms of service would open here')}
            />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() => Alert.alert('Privacy', 'Privacy policy would open here')}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingGroup}>
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <SettingItem
              icon="star-outline"
              title="Rate Us"
              onPress={() => Alert.alert('Rate', 'App store rating would open here')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  settingGroup: {
    backgroundColor: '#FFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginTop: 24,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
