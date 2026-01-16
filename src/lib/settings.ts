'use client';

import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import type { SiteSettings, PaymentSettings } from './types';

export async function getSiteSettings(db: Firestore): Promise<SiteSettings | null> {
  const settingsRef = doc(db, 'settings', 'site');
  const docSnap = await getDoc(settingsRef);
  if (docSnap.exists()) {
    return docSnap.data() as SiteSettings;
  }
  return null;
}

export async function saveSiteSettings(db: Firestore, settings: SiteSettings): Promise<void> {
  const settingsRef = doc(db, 'settings', 'site');
  await setDoc(settingsRef, settings, { merge: true });
}

export async function getPaymentSettings(db: Firestore): Promise<PaymentSettings | null> {
    const settingsRef = doc(db, 'settings', 'payment');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as PaymentSettings;
    }
    return null;
  }
  
  export async function savePaymentSettings(db: Firestore, settings: PaymentSettings): Promise<void> {
    const settingsRef = doc(db, 'settings', 'payment');
    await setDoc(settingsRef, settings, { merge: true });
  }
