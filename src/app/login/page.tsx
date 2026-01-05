
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
import { useAuth, useUser } from '@/firebase';
import { signInWithGoogle, handleRedirectResult } from '@/firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // This state will show a loading screen while we process the redirect.
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  // This effect handles both the initial redirect check and user state changes.
  useEffect(() => {
    // Don't do anything until Firebase auth is initialized.
    if (!auth) {
      setIsProcessingRedirect(false);
      return;
    }

    // If a user is already logged in, redirect them.
    if (user) {
      router.replace('/');
      return;
    }

    // If we're not logged in, try to process a redirect result.
    handleRedirectResult(auth)
      .then((result) => {
        if (result) {
          // A sign-in was successful. The `useUser` hook will see the new user.
          // The component will re-render, and the check `if (user)` above
          // will then handle the redirect.
          toast({ title: 'Login Successful', description: 'Welcome back!' });
        }
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'Could not process Google sign-in.',
        });
      })
      .finally(() => {
        // We're done checking, so we can now show the login form.
        setIsProcessingRedirect(false);
      });
      
  }, [auth, user, router, toast]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase is not available.' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect above will handle the redirect once the user state is updated.
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message || 'An unexpected error occurred.' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Authentication service is not available.'});
      return;
    }
    setIsLoading(true);
    // This function now just starts the redirect.
    // The result is handled by the useEffect when the user comes back.
    try {
        await signInWithGoogle(auth);
    } catch(error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Could not sign in with Google.' });
      setIsLoading(false);
    }
  };

  // While checking for redirect result OR while waiting for the user state to load, show a spinner.
  // This also covers the brief moment when the user is logged in but before the redirect happens.
  if (isProcessingRedirect || userLoading) {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
           <Card className="w-full max-w-md">
           <CardHeader>
               <CardTitle className="text-2xl font-headline">Verifying...</CardTitle>
               <CardDescription>Please wait while we check your credentials.</CardDescription>
           </CardHeader>
           <CardContent className="flex justify-center items-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </CardContent>
           </Card>
       </div>
   );
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
            disabled={isLoading}
          >
            {isLoading ? (
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
              {isLoading ? 'Logging In...' : 'Log In'}
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
