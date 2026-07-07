import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { RegistryProvider, useRegistry } from '@/context/RegistryContext';
import { useColors } from '@/hooks/useColors';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();
  const { user, loading, requireDeviceSecurity } = useRegistry();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  useEffect(() => {
    if (loading || !user || !requireDeviceSecurity || isAuthenticated) return;

    const authenticate = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock ZCR',
          fallbackLabel: 'Use Device Passcode',
        });

        if (result.success) {
          setIsAuthenticated(true);
        } else {
          // Keep trying if they cancel? Or just wait for them to click a button?
          // For now, let's just not set authenticated to true.
        }
      } else {
        // Device doesn't support local auth, so we just let them in
        setIsAuthenticated(true);
      }
    };

    authenticate();
  }, [loading, user, requireDeviceSecurity, isAuthenticated]);

  if (loading) return null;

  // If app is protected and we haven't authenticated yet, show a lock screen
  if (user && requireDeviceSecurity && !isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
        <MaterialCommunityIcons name="lock-outline" size={64} color={colors.primary} />
        <Text style={{ color: colors.foreground, fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>ZCR is Locked</Text>
        <TouchableOpacity
          onPress={() => setIsAuthenticated(false)} // This will trigger the effect again
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }}>Unlock App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="dog/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="dog/health" options={{ title: 'Health Record' }} />
      <Stack.Screen name="dog/transfer" options={{ title: 'Transfer Ownership' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RegistryProvider>
                <RootLayoutNav />
              </RegistryProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
