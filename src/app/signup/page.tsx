'use client';

import { useState } from 'react';
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
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase is not available.',
      });
      return;
    }
    setLoading(true);
    try {
      // 1. Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Firebase Auth profile
      await updateProfile(user, { displayName: name });

      // 3. Create user profile in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const userData = {
        name: name,
        email: email,
        createdAt: serverTimestamp(),
      };

      setDoc(userDocRef, userData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({
        title: 'Account Created!',
        description: "Welcome to Talha Luxe!",
      });

      router.push('/');

    } catch (error: any) {
      console.error('Sign up failed', error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join Talha Luxe for a premium shopping experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Your Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
