import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function GoldButton({ title, onPress, loading = false, disabled = false, variant = 'filled', size = 'md', style }: Props) {
  const colors = useColors();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isDisabled = disabled || loading;
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 48;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;

  const textColor =
    variant === 'filled'
      ? colors.primaryForeground
      : colors.primary;

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize, fontFamily: 'Inter_700Bold' }]}>{title.toUpperCase()}</Text>
      )}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          height,
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {variant === 'filled' && !isDisabled ? (
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: colors.radius }]}
        >
          <ButtonContent />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.fallback,
            {
              backgroundColor: variant === 'filled' ? colors.primary : 'transparent',
              borderColor: variant === 'outline' ? colors.primary : 'transparent',
              borderWidth: variant === 'outline' ? 1.5 : 0,
              borderRadius: colors.radius,
            },
          ]}
        >
          <ButtonContent />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    width: '100%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    letterSpacing: 1.2,
  },
});
