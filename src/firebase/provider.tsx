'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { Messaging } from 'firebase/messaging';

export interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  messaging: Messaging | null;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export interface FirebaseProviderProps {
  children: ReactNode;
  value: FirebaseContextValue;
}

export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  return context?.app ?? null;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  return context?.auth ?? null;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  return context?.firestore ?? null;
};

export const useStorage = () => {
    const context = useContext(FirebaseContext);
    return context?.storage ?? null;
};

export const useMessaging = () => {
    const context = useContext(FirebaseContext);
    return context?.messaging ?? null;
};
