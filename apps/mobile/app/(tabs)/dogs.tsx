import React, { useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { DogCard } from '@/components/DogCard';

type Filter = 'all' | 'mine' | 'stolen' | 'sterilized';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'stolen', label: 'Stolen' },
  { key: 'sterilized', label: 'Sterilized' },
];

export default function DogsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dogs, user, loading } = useRegistry();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = useMemo(() => {
    if (!user) return [];
    let list = dogs;
    if (filter === 'mine') list = list.filter(d => d.ownerId === user.id || d.breederId === user.id);
    if (filter === 'stolen') list = list.filter(d => d.isStolen);
    if (filter === 'sterilized') list = list.filter(d => d.sterilizationStatus === 'Sterilized');
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.breed.toLowerCase().includes(q) ||
          d.microchipId.toLowerCase().includes(q) ||
          d.ownerName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.registrationDate.localeCompare(a.registrationDate));
  }, [dogs, filter, query, user?.id]);

  if (loading || !user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: topPt + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Dog Registry</Text>
        <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </Text>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
            placeholder="Search name, breed, chip ID..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.key ? colors.primary : colors.card,
                  borderColor: filter === f.key ? colors.primary : colors.border,
                  borderRadius: colors.radius - 4,
                },
              ]}
            >
              <Text style={[
                styles.filterText,
                {
                  color: filter === f.key ? colors.primaryForeground : colors.mutedForeground,
                  fontFamily: filter === f.key ? 'Inter_600SemiBold' : 'Inter_400Regular',
                },
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 100 : 120 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        renderItem={({ item }) => (
          <DogCard dog={item} onPress={() => router.push(`/dog/${item.id}`)} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="paw-off" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>No dogs found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {query ? 'Try a different search term' : 'Register a new dog to get started'}
            </Text>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Platform.OS === 'web' ? 100 : 90 + insets.bottom }]}
        onPress={() => router.push('/(tabs)/add')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color={colors.primaryForeground} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 18, paddingBottom: 10, gap: 10 },
  title: { fontSize: 26 },
  count: { fontSize: 13, marginTop: -6 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  filterText: { fontSize: 12, letterSpacing: 0.5 },
  list: { paddingHorizontal: 18, paddingTop: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18 },
  emptySub: { fontSize: 14, textAlign: 'center' },
  fab: { position: 'absolute', right: 20, width: 64, height: 64, borderRadius: 32, overflow: 'hidden', shadowColor: '#C9A84C', shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  fabGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
