import { getDownloadURL, ref, uploadBytesResumable, type FirebaseStorage } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

export const uploadImages = async (
    storage: FirebaseStorage,
    files: File[],
    onProgress: (progress: number) => void
): Promise<string[]> => {
    
    let totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    let bytesTransferred = 0;

    const uploadPromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
            const fileId = uuidv4();
            const fileExtension = file.name.split('.').pop();
            const storageRef = ref(storage, `products/${fileId}.${fileExtension}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // This reports progress for an individual file, we need to aggregate
                },
                (error) => {
                    console.error("Upload failed for a file:", error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        // After each successful upload, update the total progress
                        bytesTransferred += file.size;
                        const progress = (bytesTransferred / totalBytes) * 100;
                        onProgress(progress);
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    });

    return Promise.all(uploadPromises);
};

    