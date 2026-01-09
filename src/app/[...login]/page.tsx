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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth, useUser } from '@/firebase';
import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSignIn, setIsLinkSignIn] = useState(false);

  // Effect to handle passwordless sign-in
  useEffect(() => {
    if (auth && isSignInWithEmailLink(auth, window.location.href)) {
      setIsLinkSignIn(true);
      let emailFromStorage = window.localStorage.getItem('emailForSignIn');
      if (!emailFromStorage) {
        // If email is not in storage, prompt the user for it
        emailFromStorage = window.prompt('Please provide your email for confirmation');
      }

      if (emailFromStorage) {
        signInWithEmailLink(auth, emailFromStorage, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            toast({ title: 'Login Successful', description: 'Welcome back!' });
            // Redirect is handled by the other useEffect
          })
          .catch((error) => {
            toast({ variant: 'destructive', title: 'Login Failed', description: error.message || 'Invalid or expired link.' });
            setIsLinkSignIn(false);
          });
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Email is required to complete sign-in.' });
        setIsLinkSignIn(false);
      }
    }
  }, [auth, toast, router]);
  
  // Effect to redirect logged-in users
  useEffect(() => {
    if (!userLoading && user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase is not available.' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful', description: 'Welcome back!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendSignInLink = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase is not available.' });
        return;
    }
    if (!forgotPasswordEmail) {
        toast({ variant: 'destructive', title: 'Email Required', description: 'Please enter your email address.' });
        return;
    }

    const actionCodeSettings = {
        url: window.location.href, // The URL to redirect to after sign-in
        handleCodeInApp: true,
    };

    setIsLoading(true);
    try {
        await sendSignInLinkToEmail(auth, forgotPasswordEmail, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', forgotPasswordEmail);
        toast({
            title: 'Check Your Email',
            description: `A sign-in link has been sent to ${forgotPasswordEmail}.`,
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error Sending Link', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };


  if (userLoading || user || isLinkSignIn) {
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
      <AlertDialog>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
            <CardDescription>
              Log in to access your account and order history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                   <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                    >
                        Forgot password?
                    </Button>
                  </AlertDialogTrigger>
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

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Passwordless Sign-In</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your email address below. We'll send you a magic link to log in instantly, no password needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendSignInLink} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Sign-In Link'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
