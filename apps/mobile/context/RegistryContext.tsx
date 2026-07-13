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
  Dog,
  Litter,
  UserProfile,
  DogSterilizationStatus,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

export type Role = 'owner' | 'breeder' | 'vet' | 'regulator';
export type Gender = 'male' | 'female';
export type SterilizationStatus = 'Sterilized' | 'Not Sterilized';

export type { Dog, Litter };
export type User = UserProfile & { email?: string };

interface RegistryContextType {
  user: User | null;
  users: User[]; // Still mock/empty as backend doesn't list all users
  dogs: Dog[];
  litters: Litter[];
  loading: boolean;
  requireDeviceSecurity: boolean;
  setRequireDeviceSecurity: (val: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addDog: (dog: any) => Promise<Dog>;
  updateHealthRecord: (dogId: string, vaccines: string, status: SterilizationStatus, lastCheckup?: string) => Promise<void>;
  transferOwnership: (dogId: string, newOwnerName: string, newOwnerId: string) => Promise<void>;
  toggleStolen: (dogId: string) => Promise<void>;
  addLitter: (litter: any) => Promise<void>;
  findDogByMicrochip: (microchip: string) => Dog | undefined;
  updateUser: (updates: any) => Promise<void>;
}

const KEY_SECURITY = '@zcr:require_security';

const RegistryContext = createContext<RegistryContextType | null>(null);

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [requireDeviceSecurity, setRequireDeviceSecurityState] = useState(false);

  // Fetch data from backend using hooks
  const { data: userProfile, isLoading: userLoading, refetch: refetchUser } = useGetMyProfile();
  const { data: dogsData, isLoading: dogsLoading } = useListDogs();
  const { data: littersData, isLoading: littersLoading } = useListLitters();

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
        const sec = await AsyncStorage.getItem(KEY_SECURITY);
        if (sec) setRequireDeviceSecurityState(JSON.parse(sec));
      } catch (_) {}
    })();
  }, []);

  const setRequireDeviceSecurity = async (val: boolean) => {
    setRequireDeviceSecurityState(val);
    try { await AsyncStorage.setItem(KEY_SECURITY, JSON.stringify(val)); } catch (_) {}
  };

  // Mock login for now as backend just uses user-001 hardcoded
  async function login(email: string, password: string) {
    // In a real app, this would be a POST /api/login that sets a cookie/token
    // For now we just refetch the profile which seeds user-001
    await refetchUser();
    return { success: true };
  }

  async function signup(userData: any) {
    // Mock signup
    return { success: true };
  }

  function logout() {
    // Mock logout
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
