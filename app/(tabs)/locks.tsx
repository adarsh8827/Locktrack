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
} from 'react-native';
import { Lock as LockIcon, Plus, X, Clock, MapPin, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getLocks, addLock, updateLockStatus } from '@/services/firestore';
import { Lock } from '@/types';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [lockNumber, setLockNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLocks();
  }, []);

  const loadLocks = async () => {
    try {
      const locksData = await getLocks();
      setLocks(locksData);
    } catch (error) {
      console.error('Error loading locks:', error);
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

    setLoading(true);
    try {
      await addLock({
        lockNumber: lockNumber.trim(),
        status: 'available',
        lastUpdated: new Date(),
      });
      
      setModalVisible(false);
      setLockNumber('');
      loadLocks();
      Alert.alert('Success', 'Lock added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add lock');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (lockId: string, newStatus: Lock['status']) => {
    try {
      await updateLockStatus(lockId, newStatus);
      loadLocks();
      Alert.alert('Success', 'Lock status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update lock status');
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

  const renderLockCard = (lock: Lock) => {
    const statusActions = getStatusActions(lock.status);
    const isAssignedToUser = lock.assignedTo === user?.id;
    const canUpdate = user?.role !== 'tracking' || isAssignedToUser;

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
            </View>
          </View>
          <Text style={styles.lastUpdated}>
            {lock.lastUpdated.toLocaleDateString()}
          </Text>
        </View>

        {lock.assignedTo && (
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentText}>
              Assigned to: {lock.assignedTo === user?.id ? 'You' : 'Other user'}
            </Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.role === 'tracking' ? 'My Locks' : 'Lock Management'}
        </Text>
        {user?.role !== 'tracking' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        )}
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
                : 'Add your first lock to get started'
              }
            </Text>
          </View>
        ) : (
          filteredLocks.map(renderLockCard)
        )}
      </ScrollView>

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
                <Text style={styles.modalTitle}>Add New Lock</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Lock Number:</Text>
                <TextInput
                  style={styles.textInput}
                  value={lockNumber}
                  onChangeText={setLockNumber}
                  placeholder="Enter lock number (e.g., L001)"
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleAddLock}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Adding...' : 'Add Lock'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6c757d',
  },
  assignmentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  assignmentText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
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