
import { getDownloadURL, ref, uploadBytesResumable, type FirebaseStorage } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

export const uploadImages = async (
    storage: FirebaseStorage,
    files: File[],
    onProgress: (progress: number) => void
): Promise<string[]> => {

    const uploadPromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
            const fileId = uuidv4();
            const fileExtension = file.name.split('.').pop();
            const storageRef = ref(storage, `products/${fileId}.${fileExtension}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    });

    return Promise.all(uploadPromises);
};
