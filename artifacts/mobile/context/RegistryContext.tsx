import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'owner' | 'breeder' | 'vet' | 'regulator';
export type Gender = 'male' | 'female';
export type SterilizationStatus = 'Sterilized' | 'Not Sterilized';

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
  role: Role;
  kennelName?: string;
  licenseNumber?: string;
  registeredAt: string;
}

interface RegistryContextType {
  user: User;
  dogs: Dog[];
  litters: Litter[];
  loading: boolean;
  addDog: (dog: Omit<Dog, 'id' | 'registrationDate' | 'ownerId' | 'ownerName' | 'breederId' | 'breederName'>) => void;
  updateHealthRecord: (dogId: string, vaccines: string, status: SterilizationStatus, lastCheckup?: string) => void;
  transferOwnership: (dogId: string, newOwnerName: string, newOwnerId: string) => void;
  toggleStolen: (dogId: string) => void;
  addLitter: (litter: Omit<Litter, 'id' | 'registeredAt' | 'breederId' | 'breederName'>) => void;
  findDogByMicrochip: (microchip: string) => Dog | undefined;
  updateUser: (updates: Partial<Pick<User, 'name' | 'kennelName' | 'licenseNumber' | 'role'>>) => void;
}

const genId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

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

const RegistryContext = createContext<RegistryContextType | null>(null);

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(SEED_USER);
  const [dogs, setDogs] = useState<Dog[]>(SEED_DOGS);
  const [litters, setLitters] = useState<Litter[]>(SEED_LITTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sd, sl, su] = await Promise.all([
          AsyncStorage.getItem(KEY_DOGS),
          AsyncStorage.getItem(KEY_LITTERS),
          AsyncStorage.getItem(KEY_USER),
        ]);
        if (sd) setDogs(JSON.parse(sd));
        if (sl) setLitters(JSON.parse(sl));
        if (su) setUser(JSON.parse(su));
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
  const persistUser = async (next: User) => {
    setUser(next);
    try { await AsyncStorage.setItem(KEY_USER, JSON.stringify(next)); } catch (_) {}
  };

  function addDog(dogData: Omit<Dog, 'id' | 'registrationDate' | 'ownerId' | 'ownerName' | 'breederId' | 'breederName'>) {
    persistDogs([
      ...dogs,
      {
        ...dogData,
        id: genId(),
        registrationDate: new Date().toISOString().split('T')[0]!,
        ownerId: user.id,
        ownerName: user.name,
        breederId: user.id,
        breederName: user.name,
      },
    ]);
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
    persistLitters([
      ...litters,
      { ...data, id: genId(), registeredAt: new Date().toISOString().split('T')[0]!, breederId: user.id, breederName: user.name },
    ]);
  }

  function findDogByMicrochip(microchip: string): Dog | undefined {
    return dogs.find(d => d.microchipId.toLowerCase() === microchip.trim().toLowerCase());
  }

  function updateUser(updates: Partial<Pick<User, 'name' | 'kennelName' | 'licenseNumber' | 'role'>>) {
    persistUser({ ...user, ...updates });
  }

  return (
    <RegistryContext.Provider
      value={{ user, dogs, litters, loading, addDog, updateHealthRecord, transferOwnership, toggleStolen, addLitter, findDogByMicrochip, updateUser }}
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
