import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Sparkles } from 'lucide-react-native';
import LoginScreen from '@/components/auth/LoginScreen';

const { width, height } = Dimensions.get('window');

export default function SignOutInScreen() {
  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
        <View style={[styles.floatingCircle, styles.circle3]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Shield size={40} color="#667eea" />
          </View>
          <Sparkles size={20} color="#ffd700" style={styles.sparkle} />
        </View>
        <Text style={styles.appName}>SecureFlow Pro</Text>
        <Text style={styles.tagline}>You have been signed out successfully</Text>
        <Text style={styles.subtitle}>Please sign in again to continue</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <LoginScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  circle1: {
    width: 120,
    height: 120,
    top: height * 0.1,
    right: -60,
  },
  circle2: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: -40,
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    right: width * 0.2,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});