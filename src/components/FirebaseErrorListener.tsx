'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useUser } from '@/firebase/auth/use-user';

// This is a client component that will listen for Firestore permission errors
// and throw them to be caught by the Next.js error overlay.
// This is for development purposes only and should be disabled in production.
export default function FirebaseErrorListener({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    const handleError = (error: any) => {
        // We are augmenting the error message with the user state
        // to provide more context in the error overlay.
        const augmentedError = new Error(error.message);
        augmentedError.stack = error.stack;
        
        const userState = user ? `Authenticated user: { uid: ${user.uid}, email: ${user.email} }` : 'User is not authenticated.';
        
        augmentedError.message += `\n\n--- Firebase Auth State ---\n${userState}\n---------------------------\n`;

        // Throwing the error will trigger the Next.js error overlay
        throw augmentedError;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [user]);

  return <>{children}</>;
}
