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
import { Building2, Plus, X, Edit3, Trash2, Users, Lock, TrendingUp, Phone, Mail, Calendar, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { springAuthService } from '@/services/springBootService';
import { Vendor } from '@/types';

export default function VendorsScreen() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [vendorName, setVendorName] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const vendorsData = await springAuthService.getAllVendors();
      // Filter out system vendor (ID: 1) and show all vendors for system admin
      setVendors(vendorsData.filter(v => v.id !== '1'));
    } catch (error) {
      console.error('Error loading vendors:', error);
      Alert.alert('Error', 'Failed to load vendors');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendors();
    setRefreshing(false);
  };

  const resetForm = () => {
    setVendorName('');
    setVendorCode('');
    setDescription('');
    setContactEmail('');
    setContactPhone('');
    setEditingVendor(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorName(vendor.vendorName);
    setVendorCode(vendor.vendorCode);
    setDescription(vendor.description || '');
    setContactEmail(vendor.contactEmail);
    setContactPhone(vendor.contactPhone || '');
    setModalVisible(true);
  };

  const handleSaveVendor = async () => {
    if (!vendorName.trim() || !vendorCode.trim() || !contactEmail.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const vendorData = {
        vendorName: vendorName.trim(),
        vendorCode: vendorCode.trim().toUpperCase(),
        description: description.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      };

      if (editingVendor) {
        await springAuthService.updateVendor(editingVendor.id, vendorData);
        Alert.alert('Success! 🎉', 'Vendor updated successfully', [{ text: 'OK' }]);
      } else {
        await springAuthService.createVendor(vendorData);
        Alert.alert('Success! 🎉', 'Vendor added successfully', [{ text: 'OK' }]);
      }

      setModalVisible(false);
      resetForm();
      loadVendors();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateVendor = (vendor: Vendor) => {
    Alert.alert(
      'Deactivate Vendor',
      `Are you sure you want to deactivate ${vendor.vendorName}? This will disable access for all their users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await springAuthService.deactivateVendor(vendor.id);
              loadVendors();
              Alert.alert('Success! ⚠️', 'Vendor deactivated successfully', [{ text: 'OK' }]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to deactivate vendor');
            }
          },
        },
      ]
    );
  };

  const renderVendorCard = (vendor: Vendor) => {
    const isActive = vendor.isActive;

    return (
      <View key={vendor.id} style={[styles.vendorCard, !isActive && styles.inactiveCard]}>
        <View style={styles.vendorHeader}>
          <View style={styles.vendorInfo}>
            <View style={styles.vendorTitleRow}>
              <Building2 size={24} color={isActive ? '#667eea' : '#adb5bd'} />
              <View style={styles.vendorDetails}>
                <Text style={[styles.vendorName, !isActive && styles.inactiveText]}>
                  {vendor.vendorName}
                </Text>
                <Text style={styles.vendorCode}>Code: {vendor.vendorCode}</Text>
                {!isActive && (
                  <View style={styles.inactiveLabel}>
                    <Text style={styles.inactiveLabelText}>INACTIVE</Text>
                  </View>
                )}
              </View>
            </View>
            {vendor.description && (
              <Text style={styles.vendorDescription}>{vendor.description}</Text>
            )}
          </View>
          
          <View style={styles.vendorActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(vendor)}
            >
              <Edit3 size={18} color="#667eea" />
            </TouchableOpacity>
            {isActive && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeactivateVendor(vendor)}
              >
                <Trash2 size={18} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Mail size={16} color="#6c757d" />
            <Text style={styles.contactText}>{vendor.contactEmail}</Text>
          </View>
          {vendor.contactPhone && (
            <View style={styles.contactItem}>
              <Phone size={16} color="#6c757d" />
              <Text style={styles.contactText}>{vendor.contactPhone}</Text>
            </View>
          )}
          <View style={styles.contactItem}>
            <Calendar size={16} color="#6c757d" />
            <Text style={styles.contactText}>
              Created: {vendor.createdAt.toLocaleDateString()}
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
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Access Denied</Text>
            </View>
          </View>
        </View>
        <View style={styles.accessDenied}>
          <Shield size={64} color="#dc3545" />
          <Text style={styles.accessDeniedTitle}>Insufficient Permissions</Text>
          <Text style={styles.accessDeniedText}>
            Only System Super Administrators can access vendor management.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Vendor Management</Text>
            <Text style={styles.headerSubtitle}>System-wide vendor administration</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>System Overview</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{vendors.length}</Text>
              <Text style={styles.summaryLabel}>Total Vendors</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {vendors.filter(v => v.isActive).length}
              </Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {vendors.filter(v => !v.isActive).length}
              </Text>
              <Text style={styles.summaryLabel}>Inactive</Text>
            </View>
          </View>
        </View>

        {vendors.length === 0 ? (
          <View style={styles.emptyState}>
            <Building2 size={64} color="#adb5bd" />
            <Text style={styles.emptyTitle}>No vendors found</Text>
            <Text style={styles.emptySubtitle}>
              Add your first vendor to get started
            </Text>
          </View>
        ) : (
          vendors.map(renderVendorCard)
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
              <Text style={styles.modalTitle}>
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Vendor Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={vendorName}
                  onChangeText={setVendorName}
                  placeholder="Enter vendor name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Vendor Code *</Text>
                <TextInput
                  style={styles.textInput}
                  value={vendorCode}
                  onChangeText={setVendorCode}
                  placeholder="Enter vendor code (e.g., ABC001)"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter vendor description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contact Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder="Enter contact email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contact Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="Enter contact phone"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSaveVendor}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  vendorCard: {
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
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  vendorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  inactiveText: {
    color: '#6c757d',
  },
  vendorCode: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  inactiveLabel: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  inactiveLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  vendorDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  vendorActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  contactInfo: {
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
    maxWidth: 500,
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
  inputContainer: {
    marginBottom: 20,
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
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
});