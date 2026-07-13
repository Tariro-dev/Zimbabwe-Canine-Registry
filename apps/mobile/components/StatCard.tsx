import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons as MCIcon } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface Props {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon, value, label, color }: Props) {
  const colors = useColors();
  const tint = color ?? colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.iconWrap, { backgroundColor: tint + '18' }]}>
        <MCIcon name={icon} size={22} color={tint} />
      </View>
      <Text style={[styles.value, { color: tint, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 26,
  },
  label: {
    fontSize: 12,
  },
});
