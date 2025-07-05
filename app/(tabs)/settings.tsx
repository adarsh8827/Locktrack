import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LogOut, User, Shield, Bell, Info, CircleHelp as HelpCircle, Settings as SettingsIcon, Building2, Code, Database } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/signoutin');
              Alert.alert('Success', 'You have been signed out successfully.', [{ text: 'OK' }]);
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const handleSwitchToSpringBoot = () => {
    Alert.alert(
      'Spring Boot Backend',
      'You are currently connected to the Spring Boot backend.\n\nFeatures:\n• Complete multi-vendor support\n• Real-time data synchronization\n• Advanced user management\n• Production-ready APIs',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    color = '#495057' 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Icon size={24} color={color} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color }]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'tracking':
        return 'Tracking Team';
      default:
        return role;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <SettingItem
            icon={User}
            title={user?.name || 'User'}
            subtitle={user?.email}
          />
          <SettingItem
            icon={Shield}
            title="Role"
            subtitle={getRoleDisplayName(user?.role || '')}
          />
          <SettingItem
            icon={Building2}
            title="Vendor"
            subtitle={user?.vendorName || 'Unknown Vendor'}
          />
        </View>

        {/* Development Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend</Text>
          <SettingItem
            icon={Database}
            title="Data Source"
            subtitle="Spring Boot Backend (Production Ready)"
            color="#28a745"
          />
          <SettingItem
            icon={Code}
            title="API Integration"
            subtitle="Complete REST API with JWT authentication"
            onPress={handleSwitchToSpringBoot}
            color="#28a745"
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Push notification settings"
            onPress={() => Alert.alert('Info', 'Notification settings coming soon')}
          />
          <SettingItem
            icon={SettingsIcon}
            title="Preferences"
            subtitle="App preferences and defaults"
            onPress={() => Alert.alert('Info', 'Preferences coming soon')}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon={HelpCircle}
            title="Help & FAQ"
            subtitle="Get help and answers"
            onPress={() => Alert.alert('Help', 'Help documentation coming soon')}
          />
          <SettingItem
            icon={Info}
            title="About"
            subtitle="App version and information"
            onPress={() => Alert.alert('About', `SecureFlow Pro v1.0.0\n\nAdvanced lock tracking and management system.\n\nVendor: ${user?.vendorName || 'Unknown'}\nMode: Production (Spring Boot Backend)\nAPI: REST with JWT Authentication`)}
          />
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <SettingItem
            icon={LogOut}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleSignOut}
            color="#dc3545"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SecureFlow Pro v1.0</Text>
          <Text style={styles.footerText}>
            Advanced lock tracking and management system
          </Text>
          {user?.vendorName && (
            <Text style={styles.footerText}>
              {user.vendorName} Portal
            </Text>
          )}
          <Text style={styles.footerText}>
            Production Mode - Spring Boot Backend
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 15,
    paddingLeft: 5,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    marginBottom: 5,
  },
});