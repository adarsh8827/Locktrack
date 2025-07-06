import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Users as UsersIcon, Shield, Building2, Mail, Calendar, UserCheck, UserX, Crown, CreditCard as Edit3, Trash2, Phone, Briefcase, CircleCheck as CheckCircle, Circle as XCircle, UserPlus } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '@/contexts/AuthContext';
import { springAuthService } from '@/services/springBootService';
import { User } from '@/types';

export default function UsersScreen() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await springAuthService.getAllUsers();
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return '#dc3545';
      case 'admin': return '#ffc107';
      case 'tracking': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return Crown;
      case 'admin': return Shield;
      case 'tracking': return UserCheck;
      default: return UserX;
    }
  };

  const getUserStats = () => {
    const systemUsers = allUsers.filter(u => u.vendorId === '1');
    const vendorUsers = allUsers.filter(u => u.vendorId !== '1');
    
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.isActive).length,
      inactive: allUsers.filter(u => !u.isActive).length,
      systemAdmins: systemUsers.length,
      vendorUsers: vendorUsers.length,
      superAdmins: allUsers.filter(u => u.role === 'superadmin').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      tracking: allUsers.filter(u => u.role === 'tracking').length,
    };
  };

  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setNewRole(userData.role);
    setEditModalVisible(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    setLoading(true);
    try {
      await springAuthService.updateUserRole(selectedUser.id, newRole.toUpperCase());
      setEditModalVisible(false);
      setSelectedUser(null);
      setNewRole('');
      await loadUsers(); // Reload users to reflect changes
      Alert.alert('Success! 🎉', `User role has been successfully updated to ${newRole.toUpperCase()}.`, [{ text: 'OK' }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user role', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userData: User) => {
    try {
      await springAuthService.activateUser(userData.id);
      await loadUsers(); // Reload users to reflect changes
      Alert.alert('Success! ✅', `${userData.name} has been successfully activated and can now login.`, [{ text: 'OK' }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to activate user', [{ text: 'OK' }]);
    }
  };

  const handleDeactivateUser = async (userData: User) => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${userData.name}? They will not be able to login.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await springAuthService.deactivateUser(userData.id);
              await loadUsers(); // Reload users to reflect changes
              Alert.alert('Success! ⚠️', `${userData.name} has been deactivated and can no longer login.`, [{ text: 'OK' }]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to deactivate user', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (userData: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userData.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await springAuthService.deleteUser(userData.id);
              await loadUsers(); // Reload users to reflect changes
              Alert.alert('Success! 🗑️', `${userData.name} has been permanently deleted from the system.`, [{ text: 'OK' }]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const renderUserCard = (userData: User) => {
    const RoleIcon = getRoleIcon(userData.role);
    const roleColor = getRoleColor(userData.role);
    const isSystemUser = userData.vendorId === '1';

    return (
      <View key={userData.id} style={[styles.userCard, isSystemUser && styles.systemUserCard]}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userTitleRow}>
              <View style={[styles.roleIndicator, { backgroundColor: roleColor }]}>
                <RoleIcon size={16} color="#fff" />
              </View>
              <View style={styles.userDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  {userData.isActive ? (
                    <CheckCircle size={16} color="#28a745" />
                  ) : (
                    <XCircle size={16} color="#dc3545" />
                  )}
                </View>
                <Text style={styles.userRole}>
                  {userData.role.toUpperCase()}
                  {isSystemUser && ' (SYSTEM)'}
                </Text>
                <Text style={[styles.statusText, { color: userData.isActive ? '#28a745' : '#dc3545' }]}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditUser(userData)}
            >
              <Edit3 size={18} color="#667eea" />
            </TouchableOpacity>
            {userData.isActive ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#dc3545' + '20' }]}
                onPress={() => handleDeactivateUser(userData)}
              >
                <UserX size={18} color="#dc3545" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#28a745' + '20' }]}
                onPress={() => handleActivateUser(userData)}
              >
                <UserCheck size={18} color="#28a745" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteUser(userData)}
            >
              <Trash2 size={18} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userContactInfo}>
          <View style={styles.contactItem}>
            <Mail size={16} color="#6c757d" />
            <Text style={styles.contactText}>{userData.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Building2 size={16} color="#6c757d" />
            <Text style={styles.contactText}>{userData.vendorName}</Text>
          </View>
          {userData.phone && (
            <View style={styles.contactItem}>
              <Phone size={16} color="#6c757d" />
              <Text style={styles.contactText}>{userData.phone}</Text>
            </View>
          )}
          {userData.department && (
            <View style={styles.contactItem}>
              <Briefcase size={16} color="#6c757d" />
              <Text style={styles.contactText}>{userData.department}</Text>
            </View>
          )}
          <View style={styles.contactItem}>
            <Calendar size={16} color="#6c757d" />
            <Text style={styles.contactText}>
              Joined: {userData.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Check if user is system super admin
  if (user?.vendorId !== '1' || user?.role !== 'superadmin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Access Denied</Text>
        </View>
        <View style={styles.accessDenied}>
          <Shield size={64} color="#dc3545" />
          <Text style={styles.accessDeniedTitle}>Insufficient Permissions</Text>
          <Text style={styles.accessDeniedText}>
            Only System Super Administrators can access user management.
          </Text>
        </View>
      </View>
    );
  }

  const stats = getUserStats();
  const roleOptions = [
    { label: 'Tracking Team', value: 'tracking' },
    { label: 'Administrator', value: 'admin' },
    { label: 'Super Administrator', value: 'superadmin' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>System-wide user administration</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>User Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#28a745' }]}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#dc3545' }]}>{stats.inactive}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>
          
          <View style={styles.roleStats}>
            <View style={styles.roleStatItem}>
              <Crown size={16} color="#dc3545" />
              <Text style={styles.roleStatText}>{stats.superAdmins} Super Admins</Text>
            </View>
            <View style={styles.roleStatItem}>
              <Shield size={16} color="#ffc107" />
              <Text style={styles.roleStatText}>{stats.admins} Admins</Text>
            </View>
            <View style={styles.roleStatItem}>
              <UserCheck size={16} color="#28a745" />
              <Text style={styles.roleStatText}>{stats.tracking} Tracking</Text>
            </View>
          </View>
        </View>

        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>All Users</Text>
          <Text style={styles.sectionSubtitle}>
            {allUsers.length} user{allUsers.length !== 1 ? 's' : ''} registered
          </Text>
        </View>

        {allUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <UsersIcon size={64} color="#adb5bd" />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>
              Users will appear here once they register
            </Text>
          </View>
        ) : (
          allUsers.map(renderUserCard)
        )}
      </ScrollView>

      {/* Edit User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User Role</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <UserX size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedUser && (
                <>
                  <Text style={styles.userNameText}>{selectedUser.name}</Text>
                  <Text style={styles.userEmailText}>{selectedUser.email}</Text>
                  
                  <Text style={styles.inputLabel}>Select New Role:</Text>
                  <View style={styles.pickerContainer}>
                    <RNPickerSelect
                      placeholder={{
                        label: 'Select a role...',
                        value: '',
                      }}
                      items={roleOptions}
                      onValueChange={setNewRole}
                      value={newRole}
                      style={{
                        inputIOS: styles.pickerInput,
                        inputAndroid: styles.pickerInput,
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleUpdateRole}
                    disabled={loading || !newRole}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Update Role</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  roleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  roleStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleStatText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 5,
  },
  usersSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  systemUserCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  userContactInfo: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalBody: {
    padding: 20,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  userEmailText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginBottom: 20,
  },
  pickerInput: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#495057',
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});