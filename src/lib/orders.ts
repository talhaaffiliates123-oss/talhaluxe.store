
'use client';
import {
    doc,
    updateDoc,
    Firestore,
    getDoc,
  } from 'firebase/firestore';
  import type { Order } from './types';
  import { errorEmitter } from '@/firebase/error-emitter';
  import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from './notifications';
  
  export async function updateOrderStatus(
    db: Firestore,
    orderId: string,
    status: Order['status']
  ) {
    const docRef = doc(db, 'orders', orderId);
    
    const orderSnap = await getDoc(docRef);
    if (!orderSnap.exists()) {
        throw new Error("Order not found.");
    }
    const order = orderSnap.data() as Order;
    const userId = order.userId;

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

    let message = '';
    let link: string | undefined = undefined;

    switch(status) {
        case 'Shipped':
            message = `Your order #${orderId.substring(0,6)}... has been shipped!`;
            break;
        case 'Delivered':
            message = `Your order #${orderId.substring(0,6)}... has been delivered. We hope you enjoy your purchase!`;
            break;
        case 'Cancelled':
            message = `Your order #${orderId.substring(0,6)}... has been cancelled. If you have any questions or concerns, please do not hesitate to contact us at Talhaluxe999@gmail.com.`;
            break;
        default:
            return;
    }
    
    if (message) {
        await createNotification(db, userId, { message, link });
    }
  }
  