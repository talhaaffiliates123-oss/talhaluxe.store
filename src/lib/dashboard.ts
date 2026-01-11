

import { collection, getDocs, Firestore, query, where } from 'firebase/firestore';

// Note: These functions perform full collection scans and can be slow and costly on large datasets.
// For production apps, you should use aggregated data counters updated with Cloud Functions.

/**
 * Calculates the total revenue from all completed orders.
 * @param db - The Firestore instance.
 * @returns A promise that resolves to the total revenue.
 */
export async function getTotalRevenue(db: Firestore): Promise<number> {
  const ordersCollection = collection(db, 'orders');
  const q = query(ordersCollection, where('status', '==', 'Delivered')); // Or 'Shipped' if that counts
  const querySnapshot = await getDocs(q);

  let total = 0;
  querySnapshot.forEach((doc) => {
    total += doc.data().totalPrice;
  });

  return total;
}

/**
 * Counts the total number of sales (orders).
 * @param db - The Firestore instance.
 * @returns A promise that resolves to the total number of sales.
 */
export async function getTotalSales(db: Firestore): Promise<number> {
  const ordersCollection = collection(db, 'orders');
  const querySnapshot = await getDocs(ordersCollection);
  return querySnapshot.size;
}

/**
 * Counts the total number of products in the store.
 * @param db - The Firestore instance.
 * @returns A promise that resolves to the total number of products.
 */
export async function getTotalProducts(db: Firestore): Promise<number> {
  const productsCollection = collection(db, 'products');
  const querySnapshot = await getDocs(productsCollection);
  return querySnapshot.size;
}

/**
 * Fetches all dashboard statistics in parallel.
 * @param db - The Firestore instance.
 * @returns An object containing all dashboard stats.
 */
export async function getDashboardStats(db: Firestore) {
    try {
        const [totalRevenue, totalSales, totalProducts] = await Promise.all([
            getTotalRevenue(db),
            getTotalSales(db),
            getTotalProducts(db),
        ]);

        return {
            totalRevenue,
            totalSales,
            totalProducts,
            error: null,
        };
    } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        // This is likely a permissions error on one of the collections.
        // We return a specific error message to be displayed on the dashboard.
        return {
            totalRevenue: 0,
            totalSales: 0,
            totalProducts: 0,
            error: "Failed to fetch stats. Check Firestore permissions for 'orders' and 'products' collections.",
        }
    }
}
