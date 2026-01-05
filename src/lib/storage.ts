'use client';

import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

/**
 * Uploads an image file to Firebase Storage.
 * @param storage The Firebase Storage instance.
 * @param file The image file to upload.
 * @param path The path where the file should be stored (e.g., 'products/image.jpg').
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export async function uploadImage(
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    // Depending on your error handling strategy, you might want to throw the error
    // or return a specific error message.
    throw new Error('Image upload failed.');
  }
}
