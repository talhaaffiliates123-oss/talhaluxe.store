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
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    // This effect runs on page load to handle the redirect result from Google.
    if (auth && firestore) {
      handleGoogleRedirectResult(auth)
        .then((redirectUser) => {
          if (redirectUser) {
            // If we have a user from a redirect, create their profile
            const userDocRef = doc(firestore, 'users', redirectUser.uid);
            const userData = {
              name: redirectUser.displayName,
              email: redirectUser.email,
              createdAt: serverTimestamp(),
            };

            // Use setDoc with merge:true to create or update
            return setDoc(userDocRef, userData, { merge: true })
              .then(() => {
                toast({
                  title: 'Signed in successfully!',
                  description: `Welcome, ${redirectUser.displayName}!`,
                });
                router.replace('/'); // This will now happen after Firestore is done
              })
              .catch((serverError) => {
                // Firestore error
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'create',
                  requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', permissionError);
                setIsProcessingRedirect(false); // Stop processing
              });
          } else {
            // No user from redirect, so we're not in a redirect flow.
            setIsProcessingRedirect(false);
          }
        })
        .catch((error) => {
          // Auth error
          console.error("Login failed during redirect check", error);
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "Could not complete sign in.",
          });
          setIsProcessingRedirect(false); // Stop processing
        });
    }
  }, [auth, firestore, router, toast]);

  useEffect(() => {
    // If a user is already logged in (and not from a redirect), send them away.
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
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error: any) {
      console.error('Login failed', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Authentication service is not available.'});
      return;
    }
    setLoading(true);
    await signInWithGoogle(auth).catch(error => {
      console.error('Login failed', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not start sign in with Google.',
      });
      setLoading(false);
    });
  };

  // Show a loading screen while checking for redirect, or if user is loading
  if (isProcessingRedirect || userLoading) {
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

  // If we're done processing and there's a user, don't render the form (will be redirected)
  if (user) {
    return null;
  }

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
            disabled={!auth || loading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign In with Google
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
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
