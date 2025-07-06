import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Lock as LockIcon, Plus, X, Clock, MapPin, ArrowRight, CircleAlert as AlertCircle, Building2, ChevronDown, UserPlus, Users } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '@/contexts/AuthContext';
import { getLocks, addLock, updateLockStatus } from '@/services/firestore';
import { springAuthService } from '@/services/springBootService';
import { Lock, Vendor, User } from '@/types';

const STATUS_COLORS = {
  available: '#28a745',
  in_transit: '#ffc107',
  on_reverse_transit: '#17a2b8',
  reached: '#dc3545',
};

const STATUS_LABELS = {
  available: 'Available',
  in_transit: 'In Transit',
  on_reverse_transit: 'On Reverse Transit',
  reached: 'Reached',
};

export default function LocksScreen() {
  const { user } = useAuth();
  const [locks, setLocks] = useState<Lock[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorUsers, setVendorUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedLock, setSelectedLock] = useState<Lock | null>(null);
  const [lockNumber, setLockNumber] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isSystemSuperAdmin = user?.vendorId === '1' && user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadLocks();
    if (isSystemSuperAdmin) {
      loadVendors();
    }
    if (isAdmin && !isSystemSuperAdmin) {
      loadVendorUsers();
    }
  }, []);

  const loadLocks = async () => {
    try {
      const locksData = await getLocks();
      setLocks(locksData);
    } catch (error) {
      console.error('Error loading locks:', error);
    }
  };

  const loadVendors = async () => {
    if (!isSystemSuperAdmin) return;
    
    setLoadingVendors(true);
    try {
      const vendorsData = await springAuthService.getAllVendors();
      // Filter out system vendor and only show active vendors
      setVendors(vendorsData.filter(v => v.isActive && v.id !== '1'));
    } catch (error) {
      console.error('Error loading vendors:', error);
      Alert.alert('Error', 'Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const loadVendorUsers = async () => {
    if (!isAdmin || isSystemSuperAdmin) return;
    
    setLoadingUsers(true);
    try {
      const allUsers = await springAuthService.getAllUsers();
      // Filter users for current vendor with tracking role
      const currentVendorUsers = allUsers.filter(u => 
        u.vendorId === user?.vendorId && 
        u.role === 'tracking' && 
        u.isActive
      );
      setVendorUsers(currentVendorUsers);
    } catch (error) {
      console.error('Error loading vendor users:', error);
      Alert.alert('Error', 'Failed to load team members');
    } finally {
      setLoadingUsers(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocks();
    setRefreshing(false);
  };

  const handleAddLock = async () => {
    if (!lockNumber.trim()) {
      Alert.alert('Error', 'Please enter a lock number');
      return;
    }

    if (isSystemSuperAdmin && !selectedVendorId) {
      Alert.alert('Error', 'Please select a vendor for this lock');
      return;
    }

    setLoading(true);
    try {
      await addLock({
        lockNumber: lockNumber.trim(),
        status: 'available',
        vendorId: isSystemSuperAdmin ? selectedVendorId : user?.vendorId || '',
        lastUpdated: new Date(),
      });
      
      setModalVisible(false);
      setLockNumber('');
      setSelectedVendorId('');
      loadLocks();
      Alert.alert('Success! 🎉', 'Lock added successfully and is now available for assignment.', [{ text: 'OK' }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add lock');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLock = async () => {
    if (!selectedLock || !selectedUserId) {
      Alert.alert('Error', 'Please select a team member');
      return;
    }

    setLoading(true);
    try {
      await springAuthService.assignLock(selectedLock.id, selectedUserId);
      setAssignModalVisible(false);
      setSelectedLock(null);
      setSelectedUserId('');
      loadLocks();
      
      const assignedUser = vendorUsers.find(u => u.id === selectedUserId);
      Alert.alert('Success! 👥', `Lock ${selectedLock.lockNumber} has been assigned to ${assignedUser?.name}.`, [{ text: 'OK' }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to assign lock');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (lockId: string, newStatus: Lock['status']) => {
    try {
      await updateLockStatus(lockId, newStatus);
      loadLocks();
      Alert.alert('Success! ✅', `Lock status updated to ${STATUS_LABELS[newStatus]} successfully.`, [{ text: 'OK' }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update lock status');
    }
  };

  const getStatusActions = (currentStatus: Lock['status']) => {
    const actions: { status: Lock['status']; label: string }[] = [];
    
    switch (currentStatus) {
      case 'available':
        actions.push({ status: 'in_transit', label: 'Start Transit' });
        break;
      case 'in_transit':
        actions.push({ status: 'on_reverse_transit', label: 'Start Reverse' });
        actions.push({ status: 'reached', label: 'Mark Reached' });
        break;
      case 'on_reverse_transit':
        actions.push({ status: 'reached', label: 'Mark Reached' });
        break;
      case 'reached':
        actions.push({ status: 'available', label: 'Reset Available' });
        break;
    }
    
    return actions;
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.vendorName : 'Unknown Vendor';
  };

  const getAssignedUserName = (userId: string) => {
    const assignedUser = vendorUsers.find(u => u.id === userId);
    return assignedUser ? assignedUser.name : 'Unknown User';
  };

  const openAssignModal = (lock: Lock) => {
    setSelectedLock(lock);
    setAssignModalVisible(true);
  };

  const renderLockCard = (lock: Lock) => {
    const statusActions = getStatusActions(lock.status);
    const isAssignedToUser = lock.assignedTo === user?.id;
    const canUpdate = user?.role !== 'tracking' || isAssignedToUser;
    const canAssign = isAdmin && !isSystemSuperAdmin && lock.status === 'available';

    return (
      <View key={lock.id} style={styles.lockCard}>
        <View style={styles.lockHeader}>
          <View style={styles.lockInfo}>
            <LockIcon size={24} color={STATUS_COLORS[lock.status]} />
            <View style={styles.lockDetails}>
              <Text style={styles.lockNumber}>Lock #{lock.lockNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[lock.status] }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[lock.status]}</Text>
              </View>
              {isSystemSuperAdmin && (
                <View style={styles.vendorInfo}>
                  <Building2 size={14} color="#6c757d" />
                  <Text style={styles.vendorText}>{getVendorName(lock.vendorId)}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.lastUpdated}>
            {lock.lastUpdated.toLocaleDateString()}
          </Text>
        </View>

        {lock.assignedTo && (
          <View style={styles.assignmentInfo}>
            <Users size={16} color="#495057" />
            <Text style={styles.assignmentText}>
              Assigned to: {lock.assignedTo === user?.id ? 'You' : getAssignedUserName(lock.assignedTo)}
            </Text>
          </View>
        )}

        {canAssign && !lock.assignedTo && (
          <View style={styles.assignmentSection}>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => openAssignModal(lock)}
            >
              <UserPlus size={16} color="#667eea" />
              <Text style={styles.assignButtonText}>Assign to Team Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {canUpdate && statusActions.length > 0 && (
          <View style={styles.actionsContainer}>
            <Text style={styles.actionsTitle}>Available Actions:</Text>
            <View style={styles.actionButtons}>
              {statusActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionButton, { backgroundColor: STATUS_COLORS[action.status] }]}
                  onPress={() => handleStatusUpdate(lock.id, action.status)}
                >
                  <Text style={styles.actionButtonText}>{action.label}</Text>
                  <ArrowRight size={16} color="#fff" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!canUpdate && (
          <View style={styles.noAccessInfo}>
            <AlertCircle size={16} color="#6c757d" />
            <Text style={styles.noAccessText}>Read-only access</Text>
          </View>
        )}
      </View>
    );
  };

  const filterLocksByRole = () => {
    if (user?.role === 'tracking') {
      return locks.filter(lock => lock.assignedTo === user.id);
    }
    return locks;
  };

  const filteredLocks = filterLocksByRole();
  const vendorOptions = vendors.map(vendor => ({
    label: `${vendor.vendorName} (${vendor.vendorCode})`,
    value: vendor.id,
  }));

  const userOptions = vendorUsers.map(user => ({
    label: `${user.name} (${user.email})`,
    value: user.id,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {user?.role === 'tracking' ? 'My Locks' : 'Lock Management'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isSystemSuperAdmin 
                ? `${filteredLocks.length} locks across all vendors`
                : `${filteredLocks.length} locks in your system`
              }
            </Text>
          </View>
          {user?.role !== 'tracking' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredLocks.length === 0 ? (
          <View style={styles.emptyState}>
            <LockIcon size={64} color="#adb5bd" />
            <Text style={styles.emptyTitle}>
              {user?.role === 'tracking' ? 'No locks assigned' : 'No locks found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {user?.role === 'tracking' 
                ? 'Wait for admin to assign locks to you'
                : isSystemSuperAdmin
                ? 'Add locks for vendors to get started'
                : 'Add your first lock to get started'
              }
            </Text>
          </View>
        ) : (
          filteredLocks.map(renderLockCard)
        )}
      </ScrollView>

      {/* Add Lock Modal */}
      {user?.role !== 'tracking' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isSystemSuperAdmin ? 'Add Lock for Vendor' : 'Add New Lock'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {isSystemSuperAdmin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Select Vendor:</Text>
                    <View style={styles.pickerWrapper}>
                      <Building2 size={20} color="#667eea" style={styles.inputIcon} />
                      <View style={styles.pickerContainer}>
                        {loadingVendors ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#667eea" />
                            <Text style={styles.loadingText}>Loading vendors...</Text>
                          </View>
                        ) : (
                          <RNPickerSelect
                            placeholder={{
                              label: 'Select a vendor...',
                              value: '',
                              color: 'rgba(102, 126, 234, 0.6)',
                            }}
                            items={vendorOptions}
                            onValueChange={setSelectedVendorId}
                            value={selectedVendorId}
                            style={{
                              inputIOS: styles.pickerInput,
                              inputAndroid: styles.pickerInput,
                              placeholder: {
                                color: 'rgba(102, 126, 234, 0.6)',
                                fontSize: 16,
                              },
                              iconContainer: {
                                top: 20,
                                right: 15,
                              },
                            }}
                            Icon={() => <ChevronDown size={20} color="rgba(102, 126, 234, 0.6)" />}
                            useNativeAndroidPickerStyle={false}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Lock Number:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={lockNumber}
                    onChangeText={setLockNumber}
                    placeholder="Enter lock number (e.g., L001)"
                    autoCapitalize="characters"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleAddLock}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isSystemSuperAdmin ? 'Add Lock for Vendor' : 'Add Lock'}
                    </Text>
                  )}
                </TouchableOpacity>

                {isSystemSuperAdmin && (
                  <View style={styles.infoBox}>
                    <Building2 size={20} color="#667eea" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>Vendor Lock Assignment</Text>
                      <Text style={styles.infoText}>• Lock will be assigned to selected vendor</Text>
                      <Text style={styles.infoText}>• Vendor admins can manage and assign to users</Text>
                      <Text style={styles.infoText}>• Lock number must be unique per vendor</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Assign Lock Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Lock to Team Member</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedLock && (
                <View style={styles.lockInfoSection}>
                  <LockIcon size={24} color="#667eea" />
                  <View style={styles.lockInfoText}>
                    <Text style={styles.lockInfoTitle}>Lock #{selectedLock.lockNumber}</Text>
                    <Text style={styles.lockInfoSubtitle}>Ready for assignment</Text>
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Select Team Member:</Text>
                <View style={styles.pickerWrapper}>
                  <Users size={20} color="#667eea" style={styles.inputIcon} />
                  <View style={styles.pickerContainer}>
                    {loadingUsers ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#667eea" />
                        <Text style={styles.loadingText}>Loading team members...</Text>
                      </View>
                    ) : (
                      <RNPickerSelect
                        placeholder={{
                          label: 'Select a team member...',
                          value: '',
                          color: 'rgba(102, 126, 234, 0.6)',
                        }}
                        items={userOptions}
                        onValueChange={setSelectedUserId}
                        value={selectedUserId}
                        style={{
                          inputIOS: styles.pickerInput,
                          inputAndroid: styles.pickerInput,
                          placeholder: {
                            color: 'rgba(102, 126, 234, 0.6)',
                            fontSize: 16,
                          },
                          iconContainer: {
                            top: 20,
                            right: 15,
                          },
                        }}
                        Icon={() => <ChevronDown size={20} color="rgba(102, 126, 234, 0.6)" />}
                        useNativeAndroidPickerStyle={false}
                      />
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAssignLock}
                disabled={loading || !selectedUserId}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Assign Lock</Text>
                )}
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <UserPlus size={20} color="#28a745" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Lock Assignment</Text>
                  <Text style={styles.infoText}>• Team member will be able to update lock status</Text>
                  <Text style={styles.infoText}>• Lock will appear in their "My Locks" section</Text>
                  <Text style={styles.infoText}>• Assignment can be changed later if needed</Text>
                </View>
              </View>
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
  addButton: {
    backgroundColor: '#667eea',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lockCard: {
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
  lockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  lockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lockDetails: {
    marginLeft: 12,
    flex: 1,
  },
  lockNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 5,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6c757d',
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  assignmentText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    marginLeft: 8,
  },
  assignmentSection: {
    marginBottom: 15,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  assignButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  noAccessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  noAccessText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 5,
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
    paddingHorizontal: 20,
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
    maxHeight: '80%',
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
  lockInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  lockInfoText: {
    marginLeft: 12,
  },
  lockInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  lockInfoSubtitle: {
    fontSize: 14,
    color: '#4a5568',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerInput: {
    fontSize: 16,
    paddingVertical: 16,
    color: '#2d3748',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#667eea',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 2,
  },
});