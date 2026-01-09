
'use server';
import {
  collection,
  addDoc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Resend } from 'resend';

type NotificationData = {
  message: string;
  link?: string;
};

// This is the admin's email address.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'talhaaffiliates123@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev'; // Resend's default "from" email

const resend = new Resend(process.env.RESEND_API_KEY);

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
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `[Talha Luxe] New Order Received! #${orderId.substring(0, 8)}`,
            html: `<p>You've received a new order!</p><p><strong>Order ID:</strong> ${orderId}</p><p><strong>Customer:</strong> ${customerName}</p><p><strong>Total:</strong> PKR ${totalPrice.toFixed(2)}</p><p>Please log in to the admin panel to view details and process the order.</p>`,
        });
    } catch (error) {
        console.error("Resend (admin new order) error:", error);
        // We don't throw here to avoid breaking the user-facing checkout flow
    }
}

// Sends an email notification to the ADMIN when an order is cancelled by a customer.
export async function sendAdminCancellationNotification(db: Firestore, { orderId, customerName, reasons, customReason }: { orderId: string, customerName: string, reasons: string[], customReason: string}) {
    const reasonHtml = `<ul>${reasons.map(r => `<li>${r}</li>`).join('')}${customReason ? `<li>Other: ${customReason}</li>` : ''}</ul>`;
    
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `[Talha Luxe] Order Cancellation: #${orderId.substring(0, 8)}`,
            html: `<p>An order has been cancelled by a customer.</p><p><strong>Order ID:</strong> ${orderId}</p><p><strong>Customer:</strong> ${customerName}</p><hr/><p><strong>Reasons:</strong></p>${reasonHtml}`,
        });
    } catch (error) {
        console.error("Resend (admin cancellation) error:", error);
    }
}

// Sends an email notification to a CUSTOMER when their order is cancelled by an admin.
export async function sendCustomerCancellationNotification(db: Firestore, { orderId, customerName, customerEmail }: { orderId: string, customerName: string, customerEmail: string }) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: customerEmail,
            subject: `Regarding your Talha Luxe Order #${orderId.substring(0, 8)}`,
            html: `<p>Dear ${customerName},</p><p>We are writing to inform you that your recent order #${orderId} has been cancelled.</p><p>If you have any questions or concerns, please do not hesitate to contact us by replying to this email or reaching out to Talhaluxe999@gmail.com.</p><p>We apologize for any inconvenience this may cause.</p><p>Sincerely,<br/>The Talha Luxe Team</p>`,
        });
    } catch (error) {
        console.error("Resend (customer cancellation) error:", error);
    }
}
