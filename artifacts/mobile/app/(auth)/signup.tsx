import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { Role, useRegistry } from '@/context/RegistryContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const ROLES: { label: string; value: Role; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { label: 'Dog Owner', value: 'owner', icon: 'account' },
  { label: 'Breeder', value: 'breeder', icon: 'home-group' },
  { label: 'Veterinarian', value: 'vet', icon: 'medical-bag' },
  { label: 'Regulator', value: 'regulator', icon: 'shield-check' },
];

export default function SignupScreen() {
  const colors = useColors();
  const { signup } = useRegistry();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('owner');
  const [kennelName, setKennelName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await signup({
      name,
      email,
      password,
      role,
      kennelName: role === 'breeder' ? kennelName : undefined,
      licenseNumber: (role === 'breeder' || role === 'vet' || role === 'regulator') ? licenseNumber : undefined,
    });
    setLoading(false);

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigation is handled by the root layout redirect
    } else {
      Alert.alert('Signup Failed', result.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Join the Zimbabwe Canine Registry
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: colors.radius }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                placeholder="e.g. Thamsanqa Zwana"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: colors.radius }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                placeholder="e.g. thami@example.com"
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
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                placeholder="At least 6 characters"
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

          <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Register as</Text>
          <View style={styles.rolesGrid}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.roleCard,
                  {
                    borderColor: role === r.value ? colors.primary : colors.border,
                    backgroundColor: role === r.value ? colors.primary + '10' : colors.surfaceRaised,
                    borderRadius: colors.radius
                  }
                ]}
                onPress={() => setRole(r.value)}
              >
                <MaterialCommunityIcons
                  name={r.icon}
                  size={24}
                  color={role === r.value ? colors.primary : colors.mutedForeground}
                />
                <Text style={[
                  styles.roleLabel,
                  {
                    color: role === r.value ? colors.primary : colors.foreground,
                    fontFamily: role === r.value ? 'Inter_600SemiBold' : 'Inter_400Regular'
                  }
                ]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {role === 'breeder' && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Kennel Name</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: colors.radius }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                  placeholder="e.g. Zwana Kennels"
                  placeholderTextColor={colors.mutedForeground}
                  value={kennelName}
                  onChangeText={setKennelName}
                />
              </View>
            </View>
          )}

          {(role === 'breeder' || role === 'vet' || role === 'regulator') && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                {role === 'vet' ? 'License Number' : role === 'regulator' ? 'Badge/ID Number' : 'Breeder License'}
              </Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderRadius: colors.radius }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                  placeholder="e.g. ZCR-BR-2024-001"
                  placeholderTextColor={colors.mutedForeground}
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.signupButtonText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                Login
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
  scrollContent: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, marginBottom: 8, marginTop: 10 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12 },
  input: { flex: 1, height: 48 },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20, marginTop: 4 },
  roleCard: { width: '48%', padding: 12, borderWidth: 1, alignItems: 'center', gap: 6 },
  roleLabel: { fontSize: 12 },
  signupButton: { height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  signupButtonText: { fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 8 },
  footerText: { fontSize: 14 },
  loginLink: { fontSize: 14 },
});
