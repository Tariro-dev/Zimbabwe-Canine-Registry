import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'owner' | 'breeder' | 'vet' | 'regulator';
export type Gender = 'male' | 'female';
export type SterilizationStatus = 'Sterilized' | 'Not Sterilized';
export type BlockchainSyncStatus = 'pending' | 'confirmed' | 'failed';

export interface BreederCertification {
  certNumber: string;
  issuedDate: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  gender: Gender;
  color: string;
  birthDate: string;
  microchipId: string;
  ownerId: string;
  ownerName: string;
  breederId: string;
  breederName: string;
  dameMicrochip?: string;
  sireMicrochip?: string;
  litterId?: string;
  vaccineHistory: string;
  sterilizationStatus: SterilizationStatus;
  lastCheckup?: string;
  dnaHash?: string;
  registrationDate: string;
  isStolen: boolean;
  weight?: string;
  // Blockchain
  blockchainTxHash?: string;
  blockchainSyncStatus: BlockchainSyncStatus;
  blockchainConfirmedAt?: string;
  // Breeder certification
  breederCertification?: BreederCertification;
}

export interface Litter {
  id: string;
  dameMicrochip: string;
  sireMicrochip: string;
  expectedBirthDate: string;
  registeredAt: string;
  breederId: string;
  breederName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  kennelName?: string;
  licenseNumber?: string;
  registeredAt: string;
}

interface RegistryContextType {
  user: User | null;
  users: User[];
  dogs: Dog[];
  litters: Litter[];
  loading: boolean;
  requireDeviceSecurity: boolean;
  setRequireDeviceSecurity: (val: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: Omit<User, 'id' | 'registeredAt'>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addDog: (dog: Omit<Dog, 'id' | 'registrationDate' | 'ownerId' | 'ownerName' | 'breederId' | 'breederName' | 'blockchainTxHash' | 'blockchainSyncStatus' | 'blockchainConfirmedAt'>) => Dog;
  updateHealthRecord: (dogId: string, vaccines: string, status: SterilizationStatus, lastCheckup?: string) => void;
  transferOwnership: (dogId: string, newOwnerName: string, newOwnerId: string) => void;
  toggleStolen: (dogId: string) => void;
  addLitter: (litter: Omit<Litter, 'id' | 'registeredAt' | 'breederId' | 'breederName'>) => void;
  findDogByMicrochip: (microchip: string) => Dog | undefined;
  updateUser: (updates: Partial<Pick<User, 'name' | 'kennelName' | 'licenseNumber' | 'role'>>) => void;
}

const genId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

/** Simulate a deterministic-looking blockchain transaction hash */
function genTxHash(): string {
  const hex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `0x${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
}

const SEED_USER: User = {
  id: 'user-001',
  name: 'Thamsanqa Zwana',
  role: 'breeder',
  kennelName: 'Zwana Kennels',
  licenseNumber: 'ZCR-BR-2024-001',
  registeredAt: '2024-01-15',
};

const SEED_DOGS: Dog[] = [
  {
    id: 'dog-001',
    name: 'Rex',
    breed: 'German Shepherd',
    gender: 'male',
    color: 'Black & Tan',
    birthDate: '2022-03-14',
    microchipId: 'ZWE000001234567',
    ownerId: 'user-001',
    ownerName: 'Thamsanqa Zwana',
    breederId: 'user-001',
    breederName: 'Thamsanqa Zwana',
    dameMicrochip: 'ZWE000009876543',
    sireMicrochip: 'ZWE000001122334',
    litterId: 'LIT-2022-001',
    vaccineHistory: 'Rabies (2024-03-14), DHPP (2024-03-14), Bordetella (2023-09-01)',
    sterilizationStatus: 'Not Sterilized',
    lastCheckup: '2024-03-14',
    dnaHash: 'SHA256:a3f2b1c9d8e7f6a5',
    registrationDate: '2022-04-01',
    isStolen: false,
    weight: '32 kg',
    blockchainTxHash: '0x3a4f9c1b2d8e7f6a5c4b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
    blockchainSyncStatus: 'confirmed',
    blockchainConfirmedAt: '2022-04-01',
    breederCertification: { certNumber: 'ZCR-CERT-2022-0001', issuedDate: '2022-04-01', status: 'active' },
  },
  {
    id: 'dog-002',
    name: 'Luna',
    breed: 'Labrador Retriever',
    gender: 'female',
    color: 'Golden',
    birthDate: '2021-07-20',
    microchipId: 'ZWE000007654321',
    ownerId: 'user-002',
    ownerName: 'Rudo Moyo',
    breederId: 'user-001',
    breederName: 'Thamsanqa Zwana',
    vaccineHistory: 'Rabies (2024-07-20), DHPP (2024-07-20)',
    sterilizationStatus: 'Sterilized',
    lastCheckup: '2024-07-20',
    dnaHash: 'SHA256:b4c3d2e1f0a9b8c7',
    registrationDate: '2021-08-05',
    isStolen: false,
    weight: '28 kg',
    blockchainTxHash: '0xf1e2d3c4b5a6978869504132acbd4ef56789012345678901234567890abcdef01',
    blockchainSyncStatus: 'confirmed',
    blockchainConfirmedAt: '2021-08-05',
    breederCertification: { certNumber: 'ZCR-CERT-2021-0042', issuedDate: '2021-08-05', status: 'active' },
  },
  {
    id: 'dog-003',
    name: 'Duke',
    breed: 'Rottweiler',
    gender: 'male',
    color: 'Black & Mahogany',
    birthDate: '2023-01-05',
    microchipId: 'ZWE000003456789',
    ownerId: 'user-001',
    ownerName: 'Thamsanqa Zwana',
    breederId: 'user-001',
    breederName: 'Thamsanqa Zwana',
    dameMicrochip: 'ZWE000005544332',
    sireMicrochip: 'ZWE000006677889',
    litterId: 'LIT-2023-001',
    vaccineHistory: 'Rabies (2024-01-05), DHPP (2024-01-05)',
    sterilizationStatus: 'Not Sterilized',
    lastCheckup: '2024-01-05',
    registrationDate: '2023-02-01',
    isStolen: false,
    weight: '45 kg',
    blockchainTxHash: '0x9c8b7a6f5e4d3c2b1a09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7',
    blockchainSyncStatus: 'confirmed',
    blockchainConfirmedAt: '2023-02-01',
    breederCertification: { certNumber: 'ZCR-CERT-2023-0007', issuedDate: '2023-02-01', status: 'active' },
  },
  {
    id: 'dog-004',
    name: 'Bella',
    breed: 'Border Collie',
    gender: 'female',
    color: 'Black & White',
    birthDate: '2022-11-30',
    microchipId: 'ZWE000008901234',
    ownerId: 'user-003',
    ownerName: 'Chiedza Mutasa',
    breederId: 'user-001',
    breederName: 'Thamsanqa Zwana',
    vaccineHistory: 'Rabies (2023-11-30), DHPP (2023-11-30)',
    sterilizationStatus: 'Sterilized',
    lastCheckup: '2023-11-30',
    registrationDate: '2022-12-15',
    isStolen: false,
    weight: '18 kg',
    blockchainTxHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    blockchainSyncStatus: 'confirmed',
    blockchainConfirmedAt: '2022-12-15',
    breederCertification: { certNumber: 'ZCR-CERT-2022-0093', issuedDate: '2022-12-15', status: 'active' },
  },
];

const SEED_LITTERS: Litter[] = [
  {
    id: 'lit-001',
    dameMicrochip: 'ZWE000009876543',
    sireMicrochip: 'ZWE000001122334',
    expectedBirthDate: '2022-03-14',
    registeredAt: '2022-02-01',
    breederId: 'user-001',
    breederName: 'Thamsanqa Zwana',
  },
];

const KEY_DOGS = '@zcr:dogs';
const KEY_LITTERS = '@zcr:litters';
const KEY_USER = '@zcr:user';
const KEY_USERS = '@zcr:users';
const KEY_SECURITY = '@zcr:require_security';

const RegistryContext = createContext<RegistryContextType | null>(null);

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dogs, setDogs] = useState<Dog[]>(SEED_DOGS);
  const [litters, setLitters] = useState<Litter[]>(SEED_LITTERS);
  const [requireDeviceSecurity, setRequireDeviceSecurityState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sd, sl, su, sus, sec] = await Promise.all([
          AsyncStorage.getItem(KEY_DOGS),
          AsyncStorage.getItem(KEY_LITTERS),
          AsyncStorage.getItem(KEY_USER),
          AsyncStorage.getItem(KEY_USERS),
          AsyncStorage.getItem(KEY_SECURITY),
        ]);
        if (sd) setDogs(JSON.parse(sd));
        if (sl) setLitters(JSON.parse(sl));
        if (su) setUser(JSON.parse(su));
        if (sus) setUsers(JSON.parse(sus));
        if (sec) setRequireDeviceSecurityState(JSON.parse(sec));
      } catch (_) {
        // use seed data on error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistDogs = async (next: Dog[]) => {
    setDogs(next);
    try { await AsyncStorage.setItem(KEY_DOGS, JSON.stringify(next)); } catch (_) {}
  };
  const persistLitters = async (next: Litter[]) => {
    setLitters(next);
    try { await AsyncStorage.setItem(KEY_LITTERS, JSON.stringify(next)); } catch (_) {}
  };
  const persistUser = async (next: User | null) => {
    setUser(next);
    try {
      if (next) {
        await AsyncStorage.setItem(KEY_USER, JSON.stringify(next));
      } else {
        await AsyncStorage.removeItem(KEY_USER);
      }
    } catch (_) {}
  };
  const persistUsers = async (next: User[]) => {
    setUsers(next);
    try { await AsyncStorage.setItem(KEY_USERS, JSON.stringify(next)); } catch (_) {}
  };

  const setRequireDeviceSecurity = async (val: boolean) => {
    setRequireDeviceSecurityState(val);
    try { await AsyncStorage.setItem(KEY_SECURITY, JSON.stringify(val)); } catch (_) {}
  };

  async function login(email: string, password: string) {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { success: false, message: 'User not found' };
    if (found.password !== password) return { success: false, message: 'Incorrect password' };

    // In a real app, don't store password in session
    const sessionUser = { ...found };
    delete sessionUser.password;
    persistUser(sessionUser);
    return { success: true };
  }

  async function signup(userData: Omit<User, 'id' | 'registeredAt'>) {
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser: User = {
      ...userData,
      id: genId(),
      registeredAt: new Date().toISOString().split('T')[0]!,
    };

    const nextUsers = [...users, newUser];
    await persistUsers(nextUsers);

    const sessionUser = { ...newUser };
    delete sessionUser.password;
    persistUser(sessionUser);

    return { success: true };
  }

  function logout() {
    persistUser(null);
  }

  function addDog(dogData: Omit<Dog, 'id' | 'registrationDate' | 'ownerId' | 'ownerName' | 'breederId' | 'breederName' | 'blockchainTxHash' | 'blockchainSyncStatus' | 'blockchainConfirmedAt'>): Dog {
    if (!user) throw new Error('Must be logged in to add a dog');
    const today = new Date().toISOString().split('T')[0]!;
    const newDog: Dog = {
      ...dogData,
      id: genId(),
      registrationDate: today,
      ownerId: user.id,
      ownerName: user.name,
      breederId: user.id,
      breederName: user.name,
      blockchainTxHash: genTxHash(),
      blockchainSyncStatus: 'confirmed',
      blockchainConfirmedAt: today,
      breederCertification: dogData.breederCertification ?? {
        certNumber: `ZCR-CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        issuedDate: today,
        status: 'active',
      },
    };
    persistDogs([...dogs, newDog]);
    return newDog;
  }

  function updateHealthRecord(dogId: string, vaccines: string, status: SterilizationStatus, lastCheckup?: string) {
    persistDogs(
      dogs.map(d =>
        d.id === dogId
          ? { ...d, vaccineHistory: vaccines, sterilizationStatus: status, lastCheckup: lastCheckup ?? new Date().toISOString().split('T')[0]! }
          : d
      )
    );
  }

  function transferOwnership(dogId: string, newOwnerName: string, newOwnerId: string) {
    persistDogs(dogs.map(d => d.id === dogId ? { ...d, ownerId: newOwnerId, ownerName: newOwnerName } : d));
  }

  function toggleStolen(dogId: string) {
    persistDogs(dogs.map(d => d.id === dogId ? { ...d, isStolen: !d.isStolen } : d));
  }

  function addLitter(data: Omit<Litter, 'id' | 'registeredAt' | 'breederId' | 'breederName'>) {
    if (!user) throw new Error('Must be logged in to add a litter');
    persistLitters([
      ...litters,
      { ...data, id: genId(), registeredAt: new Date().toISOString().split('T')[0]!, breederId: user.id, breederName: user.name },
    ]);
  }

  function findDogByMicrochip(microchip: string): Dog | undefined {
    return dogs.find(d => d.microchipId.toLowerCase() === microchip.trim().toLowerCase());
  }

  function updateUser(updates: Partial<Pick<User, 'name' | 'kennelName' | 'licenseNumber' | 'role'>>) {
    if (!user) return;
    persistUser({ ...user, ...updates });
  }

  return (
    <RegistryContext.Provider
      value={{ user, users, dogs, litters, loading, requireDeviceSecurity, setRequireDeviceSecurity, login, signup, logout, addDog, updateHealthRecord, transferOwnership, toggleStolen, addLitter, findDogByMicrochip, updateUser }}
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
