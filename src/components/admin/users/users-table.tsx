
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentData, DocumentSnapshot, collection, getDocs, limit, orderBy, query, startAfter, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PAGE_SIZE = 10;

type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
};


export default function UsersTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData, DocumentData> | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async (direction: 'next' | 'initial' = 'initial') => {
    if (!firestore) return;
    setLoading(true);

    try {
        const baseQuery = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
        let q;

        if (direction === 'next' && lastVisible) {
            q = query(baseQuery, startAfter(lastVisible), limit(PAGE_SIZE));
        } else {
            q = query(baseQuery, limit(PAGE_SIZE));
        }
        
        const documentSnapshots = await getDocs(q);
        const newUsers = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));

        if (!documentSnapshots.empty) {
            if (direction === 'initial') {
                setUsers(newUsers);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        } else if (direction === 'initial') {
            setUsers([]);
        }

        setIsLastPage(documentSnapshots.docs.length < PAGE_SIZE);

    } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
            variant: "destructive",
            title: "Error fetching users",
            description: `Could not retrieve user data. This might be a Firestore permissions issue. \n ${error.message}`,
        });
    } finally {
        setLoading(false);
    }
}, [firestore, lastVisible, toast]);

    const fetchTotalCount = useCallback(async () => {
         if(!firestore) return;
         const coll = collection(firestore, 'users');
         const snap = await getDocs(coll);
         setTotalUsers(snap.size);
    }, [firestore]);
  
  useEffect(() => {
    if(firestore){
      fetchTotalCount();
      fetchUsers('initial');
    }
  }, [firestore, fetchUsers, fetchTotalCount]);


  const handleNextPage = () => {
    if (isLastPage) return;
    setPage(p => p + 1);
    fetchUsers('next');
  }

  const handlePrevPage = () => {
    setPage(1);
    setLastVisible(null);
    fetchUsers('initial');
  }

  return (
    <Card>
      <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{!loading ? `Showing ${users.length} of ${totalUsers} users.` : 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Joined</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {loading && users.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    </TableRow>
                  ))
              ) : users.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={3} className="text-center py-10">
                          <p>No users found.</p>
                      </TableCell>
                  </TableRow>
              ) : users.map((user) => {
                  return (
                      <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} alt={user.name}/>
                                    <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                      </TableRow>
                  )
              })}
              </TableBody>
          </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Page <strong>{page}</strong>
        </div>
        <div className="ml-auto space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={isLastPage}>Next</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
