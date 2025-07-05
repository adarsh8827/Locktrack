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
import { MessageSquare, Plus, X, Clock, User } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '@/contexts/AuthContext';
import { addRemark, getRemarksByLock, getLocks } from '@/services/firestore';
import { Remark, Lock } from '@/types';

export default function RemarksScreen() {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [locks, setLocks] = useState<Lock[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLockId, setSelectedLockId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const locksData = await getLocks();
      setLocks(locksData);
      
      // Load remarks for all locks
      const allRemarks: Remark[] = [];
      for (const lock of locksData) {
        const lockRemarks = await getRemarksByLock(lock.id);
        allRemarks.push(...lockRemarks);
      }
      
      // Sort by timestamp (newest first)
      allRemarks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRemarks(allRemarks);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddRemark = async () => {
    if (!selectedLockId || !message.trim()) {
      Alert.alert('Error', 'Please select a lock and enter a message');
      return;
    }

    setLoading(true);
    try {
      await addRemark({
        lockId: selectedLockId,
        userId: user!.id,
        userName: user!.name,
        message: message.trim(),
        timestamp: new Date(),
      });
      
      setModalVisible(false);
      setSelectedLockId('');
      setMessage('');
      loadData();
      Alert.alert('Success', 'Remark added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add remark');
    } finally {
      setLoading(false);
    }
  };

  const getLockNumber = (lockId: string) => {
    const lock = locks.find(l => l.id === lockId);
    return lock ? lock.lockNumber : 'Unknown';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  const lockOptions = locks.map(lock => ({
    label: `Lock #${lock.lockNumber}`,
    value: lock.id,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Remarks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {remarks.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageSquare size={64} color="#adb5bd" />
            <Text style={styles.emptyTitle}>No remarks yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first remark to get started
            </Text>
          </View>
        ) : (
          remarks.map((remark) => (
            <View key={remark.id} style={styles.remarkCard}>
              <View style={styles.remarkHeader}>
                <View style={styles.remarkInfo}>
                  <Text style={styles.lockNumber}>
                    Lock #{getLockNumber(remark.lockId)}
                  </Text>
                  <View style={styles.authorInfo}>
                    <User size={16} color="#6c757d" />
                    <Text style={styles.authorName}>{remark.userName}</Text>
                  </View>
                </View>
                <View style={styles.timestampInfo}>
                  <Clock size={16} color="#6c757d" />
                  <Text style={styles.timestamp}>
                    {formatTimestamp(remark.timestamp)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.remarkMessage}>{remark.message}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Remark</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Select Lock:</Text>
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  placeholder={{
                    label: 'Select a lock...',
                    value: '',
                  }}
                  items={lockOptions}
                  onValueChange={setSelectedLockId}
                  value={selectedLockId}
                  style={{
                    inputIOS: styles.pickerInput,
                    inputAndroid: styles.pickerInput,
                  }}
                />
              </View>

              <Text style={styles.inputLabel}>Message:</Text>
              <TextInput
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Enter your remark..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAddRemark}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Adding...' : 'Add Remark'}
                </Text>
              </TouchableOpacity>
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
  remarkCard: {
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
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  remarkInfo: {
    flex: 1,
  },
  lockNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 5,
    fontWeight: '500',
  },
  timestampInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 5,
  },
  remarkMessage: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerInput: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#495057',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
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