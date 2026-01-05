
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
import { signInWithEmailAndPassword, getRedirectResult } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


function RedirectHandler({auth, onResult}: {auth: any, onResult: () => void}) {
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const checkRedirect = async () => {
            if (!auth) return;
            try {
                const result = await handleRedirectResult(auth);
                // If the result object is not null, the sign-in was successful.
                if (result) {
                   onResult(); // This will just set isVerifying to false
                   toast({ title: 'Login Successful', description: 'Welcome back!'});
                   // DO NOT REDIRECT HERE. Let the main component handle it.
                } else {
                    // This can happen if the page is loaded without a redirect in progress.
                    onResult(); // Go back to the normal login form
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Login Failed', description: error.message || 'Could not process Google sign-in.'});
                onResult(); // Stop showing the verifying message
            }
        };

        checkRedirect();
    }, [auth, toast, router, onResult]);


    return (
         <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Verifying...</CardTitle>
                <CardDescription>Please wait while we complete your sign-in.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
            </Card>
        </div>
    );
}


export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // This state will track if we are in the middle of a Google redirect flow.
  const [isVerifying, setIsVerifying] = useState(true); // Default to true

  // Check on initial load if a redirect is happening
  useEffect(() => {
    if (auth) {
        getRedirectResult(auth)
            .then((result) => {
                if (!result) {
                    // No redirect happened, show the login page normally
                    setIsVerifying(false);
                }
                // If there IS a result, `isVerifying` will remain true,
                // and the RedirectHandler will take care of it.
            })
            .catch(() => {
                // An error occurred, show the login page
                setIsVerifying(false);
            });
    } else {
        // Auth not ready yet, wait
        setIsVerifying(true);
    }
  }, [auth]);

  // If user is already logged in, redirect them away from the login page.
  useEffect(() => {
    if (!userLoading && user && !isVerifying) {
      router.replace('/');
    }
  }, [user, userLoading, router, isVerifying]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase is not available.' });
      return;
    }
    setEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect above will handle the redirect once the user state is updated.
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
    setIsVerifying(true); // Show the "Verifying" screen
    try {
        await signInWithGoogle(auth);
        // The redirect will happen. The RedirectHandler will take over when the user returns.
    } catch(error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Could not sign in with Google.' });
      setGoogleLoading(false);
      setIsVerifying(false);
    }
  };

  if (isVerifying || userLoading || (!isVerifying && user)) {
    // Show verifying/loading screen if a redirect is in progress, if we are checking the user,
    // or if the user is logged in and about to be redirected.
    return <RedirectHandler auth={auth} onResult={() => setIsVerifying(false)}/>;
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
