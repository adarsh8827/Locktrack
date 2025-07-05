import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Calendar, ChartBar as BarChart3, Users, TrendingUp, Shield, Crown, Building2, Activity, MapPin, Clock, Zap, Star, Sparkles, ArrowRight, Settings, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getLocks, getSchedules, getAnalytics } from '@/services/firestore';
import { springAuthService } from '@/services/springBootService';
import { Lock as LockType, Schedule, Analytics, User as UserType } from '@/types';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [locks, setLocks] = useState<LockType[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.vendorId === '1') {
        // System Super Admin - load all data
        const [usersData] = await Promise.all([
          springAuthService.getAllUsers(),
        ]);
        setAllUsers(usersData);
      } else {
        // Vendor-specific data
        const [locksData, schedulesData, analyticsData] = await Promise.all([
          getLocks(),
          getSchedules(),
          getAnalytics(),
        ]);
        setLocks(locksData);
        setSchedules(schedulesData);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

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

  const handleUserManagement = () => {
    router.push('/(tabs)/users');
  };

  const handleVendorManagement = () => {
    router.push('/(tabs)/vendors');
  };

  const handleSystemAnalytics = () => {
    router.push('/(tabs)/analytics');
  };

  const handleSecurityCenter = () => {
    Alert.alert(
      'Security Center',
      'Security monitoring and audit logs.\n\n• Real-time threat detection\n• Access control monitoring\n• Security event logging\n• Compliance reporting',
      [{ text: 'OK' }]
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle,
    trend,
    onPress
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    subtitle?: string;
    trend?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
          {trend && (
            <View style={styles.trendContainer}>
              <TrendingUp size={12} color="#28a745" />
              <Text style={styles.trendText}>{trend}</Text>
            </View>
          )}
        </View>
        {onPress && (
          <ArrowRight size={20} color={color} style={styles.arrowIcon} />
        )}
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    onPress 
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.actionCardContent}>
        <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
        <ArrowRight size={16} color={color} style={styles.actionArrow} />
      </View>
    </TouchableOpacity>
  );

  const renderSystemDashboard = () => {
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive).length;
    const superAdmins = allUsers.filter(u => u.role === 'superadmin').length;
    const vendors = new Set(allUsers.map(u => u.vendorId)).size;

    return (
      <View>
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeIconContainer}>
                <View style={styles.welcomeIcon}>
                  <Crown size={32} color="#fff" />
                </View>
                <Sparkles size={20} color="#ffd700" style={styles.sparkle} />
              </View>
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeTitle}>System Command Center</Text>
                <Text style={styles.welcomeSubtitle}>Platform-wide administration & oversight</Text>
                <View style={styles.systemBadge}>
                  <Text style={styles.systemBadgeText}>SYSTEM ADMIN</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            color="#667eea"
            subtitle="Across all vendors"
            trend="+12% this month"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={Activity}
            color="#28a745"
            subtitle="Currently active"
            trend="98% uptime"
          />
          <StatCard
            title="Super Admins"
            value={superAdmins}
            icon={Crown}
            color="#dc3545"
            subtitle="System administrators"
          />
          <StatCard
            title="Vendors"
            value={vendors}
            icon={Building2}
            color="#ffc107"
            subtitle="Active vendors"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>System Operations</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard
              title="User Management"
              description="Manage all platform users"
              icon={Users}
              color="#667eea"
              onPress={handleUserManagement}
            />
            <QuickActionCard
              title="Vendor Control"
              description="Configure vendor accounts"
              icon={Building2}
              color="#28a745"
              onPress={handleVendorManagement}
            />
            <QuickActionCard
              title="System Analytics"
              description="Platform performance metrics"
              icon={BarChart3}
              color="#ffc107"
              onPress={handleSystemAnalytics}
            />
            <QuickActionCard
              title="Security Center"
              description="Monitor system security"
              icon={Shield}
              color="#dc3545"
              onPress={handleSecurityCenter}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderVendorDashboard = () => {
    const statusCounts = {
      available: locks.filter(lock => lock.status === 'available').length,
      inTransit: locks.filter(lock => lock.status === 'in_transit').length,
      onReverse: locks.filter(lock => lock.status === 'on_reverse_transit').length,
      reached: locks.filter(lock => lock.status === 'reached').length,
    };

    const totalTrips = analytics.reduce((sum, a) => sum + a.totalTrips, 0);
    const totalDistance = analytics.reduce((sum, a) => sum + a.totalDistance, 0);

    if (user?.role === 'tracking') {
      const assignedLocks = locks.filter(lock => lock.assignedTo === user.id);
      return (
        <View>
          <View style={styles.welcomeCard}>
            <LinearGradient
              colors={['#28a745', '#20c997', '#17a2b8']}
              style={styles.welcomeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.welcomeContent}>
                <View style={styles.welcomeIconContainer}>
                  <View style={styles.welcomeIcon}>
                    <MapPin size={32} color="#fff" />
                  </View>
                  <Activity size={20} color="#ffd700" style={styles.sparkle} />
                </View>
                <View style={styles.welcomeText}>
                  <Text style={styles.welcomeTitle}>Track & Monitor</Text>
                  <Text style={styles.welcomeSubtitle}>Your assigned locks and routes</Text>
                  <View style={[styles.systemBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={styles.systemBadgeText}>TRACKING TEAM</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              title="Assigned Locks"
              value={assignedLocks.length}
              icon={Lock}
              color="#28a745"
              subtitle="Your responsibility"
            />
            <StatCard
              title="Active Routes"
              value={assignedLocks.filter(l => l.status === 'in_transit').length}
              icon={Activity}
              color="#ffc107"
              subtitle="Currently tracking"
            />
            <StatCard
              title="Completed"
              value={assignedLocks.filter(l => l.status === 'reached').length}
              icon={Star}
              color="#17a2b8"
              subtitle="Successfully delivered"
            />
          </View>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeIconContainer}>
                <View style={styles.welcomeIcon}>
                  <Shield size={32} color="#fff" />
                </View>
                <Zap size={20} color="#ffd700" style={styles.sparkle} />
              </View>
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeTitle}>SecureFlow Pro</Text>
                <Text style={styles.welcomeSubtitle}>Advanced lock tracking & management</Text>
                <View style={[styles.systemBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.systemBadgeText}>{user?.vendorName?.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Locks"
            value={locks.length}
            icon={Lock}
            color="#667eea"
            subtitle={`${statusCounts.available} available`}
            trend="+5 this week"
          />
          <StatCard
            title="Active Trips"
            value={statusCounts.inTransit + statusCounts.onReverse}
            icon={TrendingUp}
            color="#ff6b6b"
            subtitle="In progress"
            trend="Real-time tracking"
          />
          <StatCard
            title="Schedules"
            value={schedules.length}
            icon={Calendar}
            color="#ffa726"
            subtitle="This month"
            trend="On schedule"
          />
          <StatCard
            title="Distance"
            value={`${totalDistance.toFixed(1)}km`}
            icon={MapPin}
            color="#26c6da"
            subtitle="Total covered"
            trend="+15% efficiency"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard
              title="Add Lock"
              description="Register a new lock"
              icon={Lock}
              color="#667eea"
              onPress={() => router.push('/(tabs)/locks')}
            />
            <QuickActionCard
              title="Schedule Trip"
              description="Plan new delivery"
              icon={Calendar}
              color="#28a745"
              onPress={() => router.push('/(tabs)/schedules')}
            />
            <QuickActionCard
              title="View Analytics"
              description="Performance insights"
              icon={BarChart3}
              color="#ffc107"
              onPress={() => router.push('/(tabs)/analytics')}
            />
            <QuickActionCard
              title="Track Status"
              description="Real-time monitoring"
              icon={Activity}
              color="#dc3545"
              onPress={() => router.push('/(tabs)/locks')}
            />
          </View>
        </View>

        <View style={styles.statusOverview}>
          <Text style={styles.sectionTitle}>Lock Status Overview</Text>
          <View style={styles.statusGrid}>
            <View style={[styles.statusCard, { backgroundColor: '#e8f5e8' }]}>
              <Text style={[styles.statusCount, { color: '#2e7d32' }]}>
                {statusCounts.available}
              </Text>
              <Text style={styles.statusLabel}>Available</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: '#fff3e0' }]}>
              <Text style={[styles.statusCount, { color: '#f57c00' }]}>
                {statusCounts.inTransit}
              </Text>
              <Text style={styles.statusLabel}>In Transit</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: '#e3f2fd' }]}>
              <Text style={[styles.statusCount, { color: '#1976d2' }]}>
                {statusCounts.onReverse}
              </Text>
              <Text style={styles.statusLabel}>On Reverse</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: '#fce4ec' }]}>
              <Text style={[styles.statusCount, { color: '#c2185b' }]}>
                {statusCounts.reached}
              </Text>
              <Text style={styles.statusLabel}>Reached</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>
              Welcome, {user?.name || 'User'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {user?.vendorId === '1' ? 'System Administrator' : user?.vendorName}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {user?.vendorId === '1' ? (
              <View style={styles.systemHeaderBadge}>
                <Crown size={20} color="#fff" />
                <Text style={styles.systemHeaderBadgeText}>SYSTEM</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {user?.vendorId === '1' ? renderSystemDashboard() : renderVendorDashboard()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>🚀 SecureFlow Pro v1.0</Text>
          <Text style={styles.footerSubtext}>
            {user?.vendorId === '1' 
              ? 'System administration dashboard'
              : 'Advanced lock tracking platform'
            }
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
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  systemHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  systemHeaderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeGradient: {
    padding: 24,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  systemBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  systemBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#a0aec0',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 4,
    fontWeight: '500',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  actionArrow: {
    marginLeft: 8,
  },
  statusOverview: {
    marginBottom: 24,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});