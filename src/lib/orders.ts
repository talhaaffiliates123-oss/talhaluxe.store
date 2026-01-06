
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
    status: Order['status'],
    cancelledBy: 'admin' | 'customer' = 'admin'
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
    const shortOrderId = orderId.substring(0,6);

    switch(status) {
        case 'Shipped':
            message = `Your order #${shortOrderId}... has been shipped!`;
            break;
        case 'Delivered':
            message = `Your order #${shortOrderId}... has been delivered. We hope you enjoy your purchase!`;
            break;
        case 'Cancelled':
            if (cancelledBy === 'admin') {
                message = `Your order #${shortOrderId}... has been cancelled by an admin. For more information, please contact us at Talhaluxe999@gmail.com.`;
            } else { // customer
                message = `Your order cancellation for order #${shortOrderId}... has been accepted. If you didn't cancel this, please reorder. If you have any other questions, contact us at Talhaluxe999@gmail.com.`
            }
            break;
        default:
            return; // Don't send notification for 'Processing'
    }
    
    if (message) {
        // The createNotification function now handles link creation internally
        await createNotification(db, userId, { message });
    }
  }
  