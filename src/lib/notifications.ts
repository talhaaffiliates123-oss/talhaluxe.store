
'use client';
import {
  collection,
  addDoc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type NotificationData = {
  message: string;
  link?: string;
};

// This is the admin's email address.
// In a real application, you'd want this to be a secure environment variable.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'talhaaffiliates123@gmail.com';

// Creates a notification for a user within their own 'notifications' subcollection.
export function createNotification(
  db: Firestore,
  userId: string,
  data: NotificationData
) {
  const notifCollection = collection(db, 'users', userId, 'notifications');
  
  const notificationData = {
    ...data,
    userId: userId,
    read: false,
    createdAt: serverTimestamp(),
    link: data.link || '/account', // Default to account page
  };

  return addDoc(notifCollection, notificationData).catch(
    async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: notifCollection.path,
        operation: 'create',
        requestResourceData: notificationData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError; // Re-throw to be caught by the calling function
    }
  );
}

// Sends an email notification to the ADMIN when a new order is placed.
export async function sendAdminNewOrderNotification(db: Firestore, { orderId, customerName, totalPrice }: { orderId: string, customerName: string, totalPrice: number}) {
    const mailCollection = collection(db, 'mail');
    const emailData = {
        to: ADMIN_EMAIL,
        message: {
            subject: `[Talha Luxe] New Order Received! #${orderId.substring(0, 8)}`,
            text: `You've received a new order!\n\nOrder ID: ${orderId}\nCustomer: ${customerName}\nTotal: PKR ${totalPrice.toFixed(2)}\n\nPlease log in to the admin panel to view details and process the order.`,
            html: `<p>You've received a new order!</p><p><strong>Order ID:</strong> ${orderId}</p><p><strong>Customer:</strong> ${customerName}</p><p><strong>Total:</strong> PKR ${totalPrice.toFixed(2)}</p><p>Please log in to the admin panel to view details and process the order.</p>`,
        }
    };
    return addDoc(mailCollection, emailData);
}

// Sends an email notification to the ADMIN when an order is cancelled by a customer.
export async function sendAdminCancellationNotification(db: Firestore, { orderId, customerName, reasons, customReason }: { orderId: string, customerName: string, reasons: string[], customReason: string}) {
    const mailCollection = collection(db, 'mail');
    const reasonText = `
        Reasons provided:
        - ${reasons.join('\n- ')}
        ${customReason ? `- Other: ${customReason}` : ''}
    `;

    const emailData = {
        to: ADMIN_EMAIL,
        message: {
            subject: `[Talha Luxe] Order Cancellation: #${orderId.substring(0, 8)}`,
            text: `An order has been cancelled by a customer.\n\nOrder ID: ${orderId}\nCustomer: ${customerName}\n\n${reasonText}`,
            html: `<p>An order has been cancelled by a customer.</p><p><strong>Order ID:</strong> ${orderId}</p><p><strong>Customer:</strong> ${customerName}</p><hr/><p><strong>Reasons:</strong></p><ul>${reasons.map(r => `<li>${r}</li>`).join('')}${customReason ? `<li>Other: ${customReason}</li>` : ''}</ul>`,
        }
    };
    return addDoc(mailCollection, emailData);
}

// Sends an email notification to a CUSTOMER when their order is cancelled by an admin.
export async function sendCustomerCancellationNotification(db: Firestore, { orderId, customerName, customerEmail }: { orderId: string, customerName: string, customerEmail: string }) {
    const mailCollection = collection(db, 'mail');
    const emailData = {
        to: customerEmail,
        message: {
            subject: `Regarding your Talha Luxe Order #${orderId.substring(0, 8)}`,
            text: `Dear ${customerName},\n\nWe are writing to inform you that your recent order #${orderId} has been cancelled by an admin.\n\nIf you have any questions or concerns, please do not hesitate to contact us by replying to this email or reaching out to Talhaluxe999@gmail.com.\n\nWe apologize for any inconvenience this may cause.\n\nSincerely,\nThe Talha Luxe Team`,
            html: `<p>Dear ${customerName},</p><p>We are writing to inform you that your recent order #${orderId} has been cancelled by an admin.</p><p>If you have any questions or concerns, please do not hesitate to contact us by replying to this email or reaching out to Talhaluxe999@gmail.com.</p><p>We apologize for any inconvenience this may cause.</p><p>Sincerely,<br/>The Talha Luxe Team</p>`,
        }
    };
    return addDoc(mailCollection, emailData);
}
