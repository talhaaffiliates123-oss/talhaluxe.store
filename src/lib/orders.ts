

'use client';
import {
    doc,
    updateDoc,
    Firestore,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
    deleteDoc,
  } from 'firebase/firestore';
  import type { Order } from './types';
  import { errorEmitter } from '@/firebase/error-emitter';
  import { FirestorePermissionError } from '@/firebase/errors';
  
  export async function updateOrderStatus(
    db: Firestore,
    orderId: string,
    status: Order['status']
  ) {
    const docRef = doc(db, 'orders', orderId);
    
    const orderData = { status };
    await updateDoc(docRef, orderData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
  }
  
  export async function clearCompletedOrders(db: Firestore) {
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where('status', 'in', ['Shipped', 'Delivered', 'Cancelled']));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return; // Nothing to delete
        }
        
        // Firestore security rules may prevent batch deletes across different documents
        // if the rule depends on resource data. Deleting one by one is safer.
        const deletePromises = querySnapshot.docs.map(docSnapshot => 
            deleteDoc(doc(db, 'orders', docSnapshot.id))
        );

        await Promise.all(deletePromises);

    } catch(serverError: any) {
        // Broad error for permission denied on a list/query
        const permissionError = new FirestorePermissionError({
            path: ordersCollection.path,
            operation: 'list', // The initial query might fail
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
  }

  export async function clearUserOrderHistory(db: Firestore, userId: string) {
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, 
        where('userId', '==', userId),
        where('status', 'in', ['Shipped', 'Delivered', 'Cancelled'])
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return; // Nothing to delete
    }

    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit().catch((serverError) => {
        // Since this is a batch, we can't point to a single doc, so we use the collection path.
        // This error will be less specific but still indicates a permissions problem with deleting orders.
        const permissionError = new FirestorePermissionError({
          path: ordersCollection.path,
          operation: 'delete',
          requestResourceData: { note: `Batch delete for user ${userId} orders failed.`},
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  }
    
