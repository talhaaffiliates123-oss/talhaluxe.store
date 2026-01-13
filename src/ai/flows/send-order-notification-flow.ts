'use server';
/**
 * @fileOverview A flow that sends a push notification when a new order is created.
 * This flow is designed to be triggered by a Firestore document creation event.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = getFirestore();
const messaging = getMessaging();

const OrderDataSchema = z.object({
  id: z.string(),
  totalPrice: z.number(),
  shippingInfo: z.object({
    name: z.string(),
  }),
});

export const sendOrderNotificationFlow = ai.defineFlow(
  {
    name: 'sendOrderNotificationFlow',
    inputSchema: z.any(),
    outputSchema: z.any(),
  },
  async (orderData) => {
    // This flow is intended to be triggered, but we can call it manually for testing.
    // In a real trigger, orderData would be the data from the new document.
    const parsedOrder = OrderDataSchema.safeParse(orderData);

    if (!parsedOrder.success) {
      console.error("Invalid order data received:", parsedOrder.error);
      return { success: false, error: "Invalid order data" };
    }

    const { totalPrice, shippingInfo } = parsedOrder.data;

    try {
      // Fetch all FCM tokens of admins
      // For simplicity, we assume all users in fcmTokens are admins.
      // In a real app, you might have a more robust way to identify admins.
      const tokensSnapshot = await db.collection('fcmTokens').get();
      
      if (tokensSnapshot.empty) {
        console.log('No FCM tokens found. No notifications sent.');
        return { success: true, message: 'No tokens to send to.' };
      }

      const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
      
      const message = {
        notification: {
          title: 'New Order Received!',
          body: `A new order was placed by ${shippingInfo.name} for PKR ${totalPrice.toFixed(2)}.`,
        },
        tokens: tokens,
      };

      // Send a message to the devices corresponding to the provided
      // registration tokens.
      const response = await messaging.sendEachForMulticast(message);
      console.log('Successfully sent message:', response);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
        // Optional: Clean up invalid tokens from your database
      }

      return { success: true, response };

    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }
  }
);


// This is the Cloud Function trigger.
// When you deploy this to Firebase, this function will automatically run
// whenever a new document is created in the /orders/{orderId} collection.
export const onordercreated = onDocumentCreated('orders/{orderId}', (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }
  const data = { id: snapshot.id, ...snapshot.data() };

  // Call the Genkit flow with the new order data
  return sendOrderNotificationFlow(data);
});
