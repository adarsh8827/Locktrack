import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { UserPlus, User, Mail, Lock, Phone, Briefcase, Building2, Eye, EyeOff, CircleCheck as CheckCircle, ChevronDown } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '@/contexts/AuthContext';
import { springAuthService } from '@/services/springBootService';
import { Vendor } from '@/types';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    vendorId: '',
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { signUp } = useAuth();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const vendorsData = await springAuthService.getAllVendors();
      // Filter out system vendor (ID: 1) and only show active vendors
      setVendors(vendorsData.filter(v => v.isActive && v.id !== '1'));
    } catch (error) {
      console.error('Error loading vendors:', error);
      Alert.alert('Error', 'Failed to load vendors. Please try again.');
    } finally {
      setLoadingVendors(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Vendor validation
    if (!formData.vendorId) {
      newErrors.vendorId = 'Please select a vendor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        vendorId: formData.vendorId,
        phone: formData.phone.trim(),
        department: formData.department.trim(),
      });

      Alert.alert(
        'Registration Successful! 🎉',
        'Your account has been created successfully. Please wait for admin approval to activate your account.',
        [{ text: 'OK' }]
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        vendorId: '',
      });
      setErrors({});
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account. Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const vendorOptions = vendors.map(vendor => ({
    label: `${vendor.vendorName} (${vendor.vendorCode})`,
    value: vendor.id,
  }));

  if (loadingVendors) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading vendors...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the SecureFlow Pro platform</Text>
        </View>

        <View style={styles.form}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <User size={20} color={errors.name ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholderTextColor="rgba(102, 126, 234, 0.6)"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Mail size={20} color={errors.email ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="rgba(102, 126, 234, 0.6)"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  placeholderTextColor="rgba(102, 126, 234, 0.6)"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Briefcase size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Department (Optional)"
                  value={formData.department}
                  onChangeText={(text) => setFormData({ ...formData, department: text })}
                  placeholderTextColor="rgba(102, 126, 234, 0.6)"
                />
              </View>
            </View>
          </View>

          {/* Account Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Lock size={20} color={errors.password ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="rgba(102, 126, 234, 0.6)"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(102, 126, 234, 0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(102, 126, 234, 0.6)" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                <Lock size={20} color={errors.confirmPassword ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="rgba(102, 126, 234, 0.6)"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="rgba(102, 126, 234, 0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(102, 126, 234, 0.6)" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          </View>

          {/* Organization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organization</Text>

            <View style={styles.inputContainer}>
              <View style={[styles.pickerWrapper, errors.vendorId && styles.inputError]}>
                <Building2 size={20} color={errors.vendorId ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    placeholder={{
                      label: 'Select your vendor...',
                      value: '',
                      color: 'rgba(102, 126, 234, 0.6)',
                    }}
                    items={vendorOptions}
                    onValueChange={(value) => {
                      setFormData({ ...formData, vendorId: value });
                      if (errors.vendorId) {
                        setErrors(prev => ({ ...prev, vendorId: '' }));
                      }
                    }}
                    value={formData.vendorId}
                    style={{
                      inputIOS: {
                        ...styles.pickerInput,
                        paddingRight: 30,
                      },
                      inputAndroid: {
                        ...styles.pickerInput,
                        paddingRight: 30,
                      },
                      placeholder: {
                        color: 'rgba(102, 126, 234, 0.6)',
                        fontSize: 16,
                      },
                      iconContainer: {
                        top: Platform.OS === 'ios' ? 20 : 15,
                        right: 15,
                      },
                    }}
                    Icon={() => <ChevronDown size={20} color="rgba(102, 126, 234, 0.6)" />}
                    useNativeAndroidPickerStyle={false}
                  />
                </View>
              </View>
              {errors.vendorId && <Text style={styles.errorText}>{errors.vendorId}</Text>}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <UserPlus size={20} color="#fff" />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <CheckCircle size={20} color="#38a169" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Registration Process</Text>
              <Text style={styles.infoText}>• Account created with basic access</Text>
              <Text style={styles.infoText}>• Role assigned by system administrator</Text>
              <Text style={styles.infoText}>• Account activation required by admin</Text>
              <Text style={styles.infoText}>• Secure vendor-specific access</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#667eea',
    fontSize: 16,
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 16,
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
  pickerContainer: {
    flex: 1,
  },
  pickerInput: {
    fontSize: 16,
    paddingVertical: 16,
    color: '#2d3748',
    backgroundColor: 'transparent',
  },
  registerButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#38a169',
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