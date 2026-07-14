import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useListDogs,
  useListLitters,
  useGetMyProfile,
  useCreateDog,
  useCreateLitter,
  useUpdateDogHealth,
  useTransferDogOwnership,
  useToggleDogStolen,
  useUpdateMyProfile,
  setAuthTokenGetter,
  Dog,
  Litter,
  UserProfile,
  DogSterilizationStatus,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react/src/custom-fetch';

export type Role = 'owner' | 'breeder' | 'vet' | 'regulator';
export type Gender = 'male' | 'female';
export type SterilizationStatus = 'Sterilized' | 'Not Sterilized';

export type { Dog, Litter };
export type User = UserProfile & { email?: string; isEmailVerified?: boolean };

interface RegistryContextType {
  user: User | null;
  users: User[];
  dogs: Dog[];
  litters: Litter[];
  loading: boolean;
  requireDeviceSecurity: boolean;
  setRequireDeviceSecurity: (val: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  addDog: (dog: any) => Promise<Dog>;
  updateHealthRecord: (dogId: string, vaccines: string, status: SterilizationStatus, lastCheckup?: string) => Promise<void>;
  transferOwnership: (dogId: string, newOwnerName: string, newOwnerId: string) => Promise<void>;
  toggleStolen: (dogId: string) => Promise<void>;
  addLitter: (litter: any) => Promise<void>;
  findDogByMicrochip: (microchip: string) => Dog | undefined;
  updateUser: (updates: any) => Promise<void>;
}

const KEY_SECURITY = '@zcr:require_security';
const KEY_TOKEN = '@zcr:auth_token';

const RegistryContext = createContext<RegistryContextType | null>(null);

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [requireDeviceSecurity, setRequireDeviceSecurityState] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Configure api-client to use our token
  useEffect(() => {
    setAuthTokenGetter(async () => {
      const stored = await AsyncStorage.getItem(KEY_TOKEN);
      return stored;
    });
  }, []);

  // Fetch data from backend using hooks
  const { data: userProfile, isLoading: userLoading, refetch: refetchUser } = useGetMyProfile({
    query: { enabled: !!token }
  });
  const { data: dogsData, isLoading: dogsLoading } = useListDogs({
    query: { enabled: !!token }
  });
  const { data: littersData, isLoading: littersLoading } = useListLitters({
    query: { enabled: !!token }
  });

  // Mutations
  const createDogMutation = useCreateDog();
  const createLitterMutation = useCreateLitter();
  const updateHealthMutation = useUpdateDogHealth();
  const transferMutation = useTransferDogOwnership();
  const toggleStolenMutation = useToggleDogStolen();
  const updateProfileMutation = useUpdateMyProfile();

  useEffect(() => {
    (async () => {
      try {
        const [sec, t] = await Promise.all([
          AsyncStorage.getItem(KEY_SECURITY),
          AsyncStorage.getItem(KEY_TOKEN),
        ]);
        if (sec) setRequireDeviceSecurityState(JSON.parse(sec));
        if (t) setToken(t);
      } catch (_) {}
    })();
  }, []);

  const setRequireDeviceSecurity = async (val: boolean) => {
    setRequireDeviceSecurityState(val);
    try { await AsyncStorage.setItem(KEY_SECURITY, JSON.stringify(val)); } catch (_) {}
  };

  async function login(email: string, password: string) {
    try {
      const res = await customFetch<{ token: string; user: any }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await AsyncStorage.setItem(KEY_TOKEN, res.token);
      setToken(res.token);
      await refetchUser();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.data?.error || 'Login failed' };
    }
  }

  async function signup(userData: any) {
    try {
      const res = await customFetch<{ token: string; user: any; message: string }>('/api/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      await AsyncStorage.setItem(KEY_TOKEN, res.token);
      setToken(res.token);
      await refetchUser();
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.data?.error || 'Registration failed' };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(KEY_TOKEN);
    setToken(null);
    queryClient.clear();
  }

  async function verifyEmail(vToken: string) {
    try {
      const res = await customFetch<{ message: string }>(`/api/verify-email?token=${vToken}`);
      await refetchUser();
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.data?.error || 'Verification failed' };
    }
  }

  async function addDog(dogData: any): Promise<Dog> {
    const result = await createDogMutation.mutateAsync({ data: dogData });
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
    return result;
  }

  async function updateHealthRecord(dogId: string, vaccines: string, status: SterilizationStatus, lastCheckup?: string) {
    await updateHealthMutation.mutateAsync({
      id: dogId,
      data: {
        vaccineHistory: vaccines,
        sterilizationStatus: status as DogSterilizationStatus,
        lastCheckup,
      },
    });
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
  }

  async function transferOwnership(dogId: string, newOwnerName: string, newOwnerId: string) {
    await transferMutation.mutateAsync({
      id: dogId,
      data: { newOwnerName, newOwnerId },
    });
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
  }

  async function toggleStolen(dogId: string) {
    await toggleStolenMutation.mutateAsync({ id: dogId });
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
  }

  async function addLitter(data: any) {
    await createLitterMutation.mutateAsync({ data });
    queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
  }

  function findDogByMicrochip(microchip: string): Dog | undefined {
    return (dogsData || []).find(d => d.microchipId.toLowerCase() === microchip.trim().toLowerCase());
  }

  async function updateUser(updates: any) {
    await updateProfileMutation.mutateAsync({ data: updates });
    queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
  }

  const loading = userLoading || dogsLoading || littersLoading;

  return (
    <RegistryContext.Provider
      value={{
        user: userProfile || null,
        users: [], // Backend doesn't support listing users yet
        dogs: dogsData || [],
        litters: littersData || [],
        loading,
        requireDeviceSecurity,
        setRequireDeviceSecurity,
        login,
        signup,
        logout,
        addDog,
        updateHealthRecord,
        transferOwnership,
        toggleStolen,
        addLitter,
        findDogByMicrochip,
        updateUser,
        verifyEmail,
      }}
    >
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useRegistry must be used within RegistryProvider');
  return ctx;
}
