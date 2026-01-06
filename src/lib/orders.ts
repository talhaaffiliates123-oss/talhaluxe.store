import {
    doc,
    updateDoc,
    Firestore,
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
  
    return updateDoc(docRef, orderData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw to be caught by the calling function
      });
  }
  