import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen() {
  const colors = useColors();
  const { login, users } = useRegistry();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-fill email if there's only one user
  useEffect(() => {
    if (users.length === 1 && !email) {
      setEmail(users[0].email);
    }
  }, [users]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Login Failed', result.message || 'Check your credentials');
    }
  };

  const handleDeviceSecurityLogin = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Not Available', 'Device security (PIN/Biometrics) is not set up on this device.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login to ZCR',
      fallbackLabel: 'Use Device Passcode',
    });

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // If we have a user with this email, log them in
      const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (userToLogin) {
        // In a real app, you'd use a secure token.
        // Here we'll simulate by calling login with their stored password if available,
        // or just force a login state in the context.
        // For this demo, let's assume we can log them in because device security passed.
        await login(userToLogin.email, userToLogin.password || '');
      } else if (users.length > 0) {
        // If no email entered, login the most recent user
        await login(users[0].email, users[0].password || '');
      } else {
        Alert.alert('No Account Found', 'Please sign up first.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Welcome to ZCR
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Zimbabwe Canine Registry
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: colors.radius }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Password</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: colors.radius }]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginButtonText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.biometricButton, { borderColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleDeviceSecurityLogin}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="shield-account-variant-outline" size={24} color={colors.primary} />
            <Text style={[styles.biometricButtonText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Use Device Security
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[styles.signupLink, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 100, height: 100, marginBottom: 16, borderRadius: 20 },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48 },
  loginButton: { height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  loginButtonText: { fontSize: 16 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 12, fontWeight: '600' },
  biometricButton: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 10 },
  biometricButtonText: { fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8 },
  footerText: { fontSize: 14 },
  signupLink: { fontSize: 14 },
});
