import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, Building2, Crown, Shield, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const { signIn } = useAuth();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      Alert.alert('Success', 'Login successful! Welcome back.', [{ text: 'OK' }]);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setErrors({}); // Clear any existing errors
  };

  const DemoCard = ({ 
    title, 
    subtitle, 
    email, 
    icon: Icon, 
    color, 
    users 
  }: {
    title: string;
    subtitle: string;
    email: string;
    icon: any;
    color: string;
    users?: any[];
  }) => (
    <View style={[styles.demoCard, { borderLeftColor: color }]}>
      <LinearGradient
        colors={[color + '10', color + '05']}
        style={styles.demoGradient}
      >
        <View style={styles.demoHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon size={24} color={color} />
          </View>
          <View style={styles.demoInfo}>
            <Text style={[styles.demoTitle, { color }]}>{title}</Text>
            <Text style={styles.demoSubtitle}>{subtitle}</Text>
          </View>
        </View>
        
        {users ? (
          <View style={styles.usersList}>
            {users.map((user, index) => (
              <TouchableOpacity
                key={index}
                style={styles.userItem}
                onPress={() => handleDemoLogin(user.email, 'demo123')}
                activeOpacity={0.7}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={[styles.roleTag, { backgroundColor: getRoleColor(user.role) }]}>
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={() => handleDemoLogin(email, 'demo123')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickLoginText}>Quick Login</Text>
            <LogIn size={16} color={color} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return '#dc3545';
      case 'admin': return '#ffc107';
      case 'tracking': return '#28a745';
      default: return '#6c757d';
    }
  };

  const demoVendors = [
    {
      title: 'ABC Transport Co.',
      subtitle: 'Leading transport and logistics',
      icon: Building2,
      color: '#007bff',
      users: [
        { name: 'John Smith', email: 'admin@abctransport.com', role: 'admin' },
        { name: 'Sarah Johnson', email: 'super@abctransport.com', role: 'superadmin' },
        { name: 'Mike Wilson', email: 'tracking@abctransport.com', role: 'tracking' },
      ]
    },
    {
      title: 'XYZ Logistics Ltd.',
      subtitle: 'Premium logistics solutions',
      icon: Users,
      color: '#28a745',
      users: [
        { name: 'Emily Davis', email: 'admin@xyzlogistics.com', role: 'admin' },
        { name: 'Robert Chen', email: 'super@xyzlogistics.com', role: 'superadmin' },
        { name: 'Lisa Garcia', email: 'tracking@xyzlogistics.com', role: 'tracking' },
      ]
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.formContainer}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Mail size={20} color={errors.email ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }));
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
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Lock size={20} color={errors.password ? "#dc3545" : "#667eea"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
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

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.loginGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <LogIn size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <View style={styles.demoHeaderSection}>
            <Sparkles size={20} color="#ffd700" />
            <Text style={styles.demoSectionTitle}>Demo Accounts</Text>
          </View>
          <Text style={styles.demoDescription}>
            Tap any user to auto-fill credentials (Password: demo123)
          </Text>
          
          {/* System Admin */}
          <DemoCard
            title="System Administration"
            subtitle="Platform management"
            email="superadmin@locktrackpro.com"
            icon={Crown}
            color="#dc3545"
            users={[
              { name: 'System Administrator', email: 'superadmin@locktrackpro.com', role: 'superadmin' },
              { name: 'Platform Admin', email: 'admin@locktrackpro.com', role: 'superadmin' },
            ]}
          />
          
          {/* Vendor Accounts */}
          {demoVendors.map((vendor, index) => (
            <DemoCard
              key={index}
              title={vendor.title}
              subtitle={vendor.subtitle}
              email=""
              icon={vendor.icon}
              color={vendor.color}
              users={vendor.users}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🚀 Connected to Spring Boot Backend</Text>
          <Text style={styles.footerSubtext}>
            Complete multi-vendor platform with real-time data
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  demoSection: {
    marginBottom: 20,
  },
  demoHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  demoSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginLeft: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },
  demoCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  demoGradient: {
    padding: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  demoInfo: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  usersList: {
    gap: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'monospace',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  quickLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38a169',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
});