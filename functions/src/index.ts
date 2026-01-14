/**
 * @fileoverview Firebase Cloud Functions for the e-commerce application.
 *
 * This file contains the backend logic that responds to events within Firebase,
 * such as new order creations.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// The SDK will automatically use the project's service account credentials
// when deployed in the Firebase environment. For other environments like Vercel,
// you must provide credentials via environment variables.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

// The hardcoded email of the single admin user for this application.
// In a production app, this should be moved to an environment variable.
const ADMIN_EMAIL = "talhaaffiliates123@gmail.com";

/**
 * Cloud Function that triggers when a new document is created in the 'orders' collection.
 * It sends a push notification to the admin if they have notifications enabled.
 */
export const onNewOrderSendNotification = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    functions.logger.log(`New order ${context.params.orderId} created:`, {
      structuredData: true,
      ...orderData,
    });

    try {
      // 1. Find the admin user by their email.
      const adminUserRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      const adminId = adminUserRecord.uid;

      if (!adminId) {
        functions.logger.log(
          `Admin user with email ${ADMIN_EMAIL} not found. Cannot send notification.`
        );
        return;
      }

      // 2. Get the admin's settings from Firestore.
      const adminSettingsRef = db.doc(`users/${adminId}`);
      const adminSettingsDoc = await adminSettingsRef.get();

      if (!adminSettingsDoc.exists) {
        functions.logger.log(
          `Admin settings for user ${adminId} not found. Cannot send notification.`
        );
        return;
      }

      const settings = adminSettingsDoc.data();
      const tokens = settings?.fcmSettings?.tokens;
      const notificationsEnabled = settings?.fcmSettings?.notificationsEnabled;

      // 3. Check if notifications are enabled and if there are tokens to send to.
      if (!notificationsEnabled) {
        functions.logger.log(
          `Notifications are disabled for admin ${adminId}. Aborting.`
        );
        return;
      }

      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        functions.logger.log(
          `No FCM tokens found for admin ${adminId}. Cannot send notification.`
        );
        return;
      }

      // 4. Construct the notification payload.
      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "New Order Received!",
          body: `Order #${context.params.orderId.substring(
            0,
            8
          )} for PKR ${orderData.totalPrice.toFixed(2)} has been placed.`,
          icon: "/logo.png", // Optional: path to your logo
          click_action: "/admin/orders", // URL to open when notification is clicked
        },
      };

      // 5. Send the notification to all of the admin's registered devices.
      const response = await messaging.sendToDevice(tokens, payload);
      functions.logger.log(
        `Successfully sent notification for order ${context.params.orderId} to ${response.successCount} device(s).`
      );

      // 6. Clean up any invalid or unregistered tokens from Firestore.
      const tokensToRemove: string[] = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          functions.logger.error(
            `Failure sending notification to token ${tokens[index]}`,
            error
          );
          // These error codes indicate that the token is no longer valid.
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            tokensToRemove.push(tokens[index]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        functions.logger.log("Cleaning up invalid tokens:", tokensToRemove);
        const updatedTokens = tokens.filter(
          (token) => !tokensToRemove.includes(token)
        );
        await adminSettingsRef.update({ "fcmSettings.tokens": updatedTokens });
      }
    } catch (error) {
      functions.logger.error(
        `An error occurred while processing notification for order ${context.params.orderId}:`,
        error
      );
    }
  });
