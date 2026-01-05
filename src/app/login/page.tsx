'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { handleGoogleRedirectResult, signInWithGoogle } from '@/firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // This state will be true while we process a potential redirect from Google.
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  // Effect 1: Handle the redirect result from Google on page load.
  useEffect(() => {
    // Only run this check if firebase is ready and we haven't processed the redirect yet.
    if (auth && firestore && isProcessingRedirect) {
      handleGoogleRedirectResult(auth)
        .then((redirectUser) => {
          if (redirectUser) {
            // A user was returned from the redirect. Create their profile.
            setGoogleLoading(true); // Show loading state while we save to DB.
            const userDocRef = doc(firestore, 'users', redirectUser.uid);
            const userData = {
              name: redirectUser.displayName,
              email: redirectUser.email,
              createdAt: serverTimestamp(),
            };

            // Create or update the user document in Firestore.
            setDoc(userDocRef, userData, { merge: true })
              .then(() => {
                toast({
                  title: 'Signed in successfully!',
                  description: `Welcome, ${redirectUser.displayName}!`,
                });
                // IMPORTANT: We do NOT redirect here.
                // We let the auth state propagation handle it in the next effect.
              })
              .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'create',
                  requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({ variant: "destructive", title: "Login Failed", description: "Could not save your user profile." });
              })
              .finally(() => {
                setGoogleLoading(false);
                setIsProcessingRedirect(false);
              });
          } else {
            // No user from redirect, so we're not in a redirect flow.
            setIsProcessingRedirect(false);
          }
        })
        .catch((error) => {
          toast({ variant: "destructive", title: "Login Failed", description: error.message || "Could not complete sign in with Google." });
          setIsProcessingRedirect(false);
        });
    }
  }, [auth, firestore, toast, isProcessingRedirect]);


  // Effect 2: This is the source of truth for redirection.
  // It waits for the application's auth state to be confirmed.
  useEffect(() => {
    // If user is loaded and IS logged in, and we are NOT in the middle
    // of a redirect operation, then it's time to go to the homepage.
    if (!userLoading && user && !isProcessingRedirect) {
      router.replace('/');
    }
  }, [user, userLoading, isProcessingRedirect, router]);
  

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase is not available.' });
      return;
    }
    setEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // We don't redirect here. The effect above will handle it when `user` state changes.
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message || 'An unexpected error occurred.' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Authentication service is not available.'});
      return;
    }
    setGoogleLoading(true);
    // This will redirect the user away from the app.
    await signInWithGoogle(auth).catch(error => {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Could not start sign in with Google.' });
      setGoogleLoading(false);
    });
  };

  // While checking for redirect result or if user is loading, show a spinner.
  if (userLoading || isProcessingRedirect) {
     return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Signing In...</CardTitle>
            <CardDescription>Please wait while we check your login status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If we are done loading and a user exists, don't render the form.
  // The redirect effect will handle navigation.
  if (user) {
    return null;
  }

  const isLoading = emailLoading || googleLoading;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Log in to access your account and order history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {googleLoading ? (
                 <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div> Signing In...</>
            ) : (
                <><FcGoogle className="mr-2 h-5 w-5" /> Sign In with Google</>
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {emailLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
