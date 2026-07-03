import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

const MAX_SIZE_MB = 5;

export async function uploadPropertyImages(files) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase Storage is not configured. Add image URLs instead.');
  }

  const uploads = Array.from(files).map(async (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error(`${file.name} is not an image`);
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`${file.name} exceeds ${MAX_SIZE_MB}MB`);
    }
    const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });

  return Promise.all(uploads);
}
