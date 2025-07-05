import { Tabs } from 'expo-router';
import { Chrome as Home, Calendar, Lock, ChartBar as BarChart3, MessageSquare, Settings, Building2, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  const getTabsForRole = () => {
    // System Super Admin - can see everything across all vendors
    if (user?.vendorId === 'system' && user?.role === 'superadmin') {
      return [
        { name: 'index', title: 'System Overview', icon: Home },
        { name: 'vendors', title: 'Vendors', icon: Building2 },
        { name: 'users', title: 'All Users', icon: Users },
        { name: 'analytics', title: 'System Analytics', icon: BarChart3 },
        { name: 'settings', title: 'Settings', icon: Settings },
      ];
    }

    // Vendor Super Admin
    if (user?.role === 'superadmin') {
      return [
        { name: 'index', title: 'Dashboard', icon: Home },
        { name: 'schedules', title: 'Schedules', icon: Calendar },
        { name: 'locks', title: 'Locks', icon: Lock },
        { name: 'analytics', title: 'Analytics', icon: BarChart3 },
        { name: 'remarks', title: 'Remarks', icon: MessageSquare },
        { name: 'settings', title: 'Settings', icon: Settings },
      ];
    }

    // Vendor Admin
    if (user?.role === 'admin') {
      return [
        { name: 'index', title: 'Dashboard', icon: Home },
        { name: 'schedules', title: 'Schedules', icon: Calendar },
        { name: 'locks', title: 'Locks', icon: Lock },
        { name: 'analytics', title: 'Analytics', icon: BarChart3 },
        { name: 'remarks', title: 'Remarks', icon: MessageSquare },
      ];
    }

    // Tracking Team
    if (user?.role === 'tracking') {
      return [
        { name: 'index', title: 'My Locks', icon: Lock },
        { name: 'remarks', title: 'Remarks', icon: MessageSquare },
      ];
    }

    return [];
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ size, color }) => (
              <tab.icon size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}