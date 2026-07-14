import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { StatCard } from '@/components/StatCard';
import { DogCard } from '@/components/DogCard';

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dogs, litters, user, loading } = useRegistry();

  if (loading || !user) return null;

  const thisMonth = dogs.filter(d => {
    const reg = new Date(d.registrationDate);
    const now = new Date();
    return reg.getMonth() === now.getMonth() && reg.getFullYear() === now.getFullYear();
  }).length;

  const stolenCount = dogs.filter(d => d.isStolen).length;
  const sterilizedCount = dogs.filter(d => d.sterilizationStatus === 'Sterilized').length;
  const recentDogs = [...dogs].sort((a, b) => b.registrationDate.localeCompare(a.registrationDate)).slice(0, 3);

  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPt + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logoIcon} contentFit="contain" />
          <View>
            <Text style={[styles.appName, { color: colors.primary, fontFamily: 'Inter_900Black' }]}>ZCR</Text>
            <Text style={[styles.appSub, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', letterSpacing: 1 }]}>
              ZIMBABWE CANINE REGISTRY
            </Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Gold separator gradient */}
      <LinearGradient
        colors={['transparent', colors.primary + '40', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.separatorGradient}
      />

      {/* Welcome Banner */}
      <View style={[styles.welcomeBanner, { backgroundColor: '#0A0A0A', borderColor: colors.primary + '30', borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 24, overflow: 'hidden' }]}>
        <LinearGradient
          colors={[colors.primary + '15', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.welcomeRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {user.name.split(' ')[0]}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
            <MaterialCommunityIcons name="shield-check" size={14} color={colors.primary} />
            <Text style={[styles.roleText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{user.role.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8, lineHeight: 18 }}>
          Your identity is secured on the National Canine Blockchain. All records are currently synchronized.
        </Text>
      </View>

      {/* Verification Warning */}
      {user.isEmailVerified === false && (
        <TouchableOpacity
          style={[styles.verifyBanner, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '40' }]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="email-alert" size={20} color={colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.verifyTitle, { color: colors.warning, fontFamily: 'Inter_700Bold' }]}>Verify your email</Text>
            <Text style={[styles.verifySub, { color: colors.warning, opacity: 0.8 }]}>Some features are restricted until verified.</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.warning} />
        </TouchableOpacity>
      )}

      {/* Stats */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Registry Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="paw" value={dogs.length} label="Total Dogs" />
        <StatCard icon="calendar-plus" value={thisMonth} label="This Month" color={colors.success} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="shield-alert" value={stolenCount} label="Stolen Reports" color={colors.destructive} />
        <StatCard icon="needle" value={sterilizedCount} label="Sterilized" color="#A78BFA" />
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 24 }]}>
        Quick Actions
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={() => router.push('/(tabs)/add')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="paw-off" size={22} color={colors.primaryForeground} />
          <Text style={[styles.actionText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
            Register Dog
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderWidth: 1, borderRadius: colors.radius }]}
          onPress={() => router.push('/(tabs)/verify')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="barcode-scan" size={22} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            Verify Chip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderWidth: 1, borderRadius: colors.radius }]}
          onPress={() => router.push('/(tabs)/dogs')}
          activeOpacity={0.8}
        >
          <Ionicons name="list" size={22} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            My Dogs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Recent Registrations</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dogs')}>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {recentDogs.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="paw-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            No dogs registered yet
          </Text>
        </View>
      ) : (
        recentDogs.map(dog => (
          <DogCard key={dog.id} dog={dog} compact onPress={() => router.push(`/dog/${dog.id}`)} />
        ))
      )}

      {/* Litters summary */}
      <View style={[styles.litterCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <MaterialCommunityIcons name="dog-side" size={24} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.litterTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            Litter Registry
          </Text>
          <Text style={[styles.litterSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {litters.length} litter{litters.length !== 1 ? 's' : ''} pre-registered
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: { width: 48, height: 48, borderRadius: 12 },
  appName: { fontSize: 24, letterSpacing: -0.5 },
  appSub: { fontSize: 9 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  welcomeRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 },
  greeting: { fontSize: 13, marginBottom: 2 },
  userName: { fontSize: 22 },
  welcomeBanner: { position: 'relative' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  roleText: { fontSize: 10, letterSpacing: 0.5 },
  separatorGradient: { height: 1, marginBottom: 20, width: '100%' },
  verifyBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 12, gap: 12, marginBottom: 24 },
  verifyTitle: { fontSize: 14 },
  verifySub: { fontSize: 11, marginTop: 1 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 24 },
  seeAll: { fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 6 },
  actionText: { fontSize: 12, textAlign: 'center' },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 32, borderWidth: 1, gap: 10 },
  emptyText: { fontSize: 14 },
  litterCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, gap: 12, marginTop: 10 },
  litterTitle: { fontSize: 14 },
  litterSub: { fontSize: 12, marginTop: 2 },
});
