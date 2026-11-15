const DATABASE = 'moodora-local';
const STORE = 'photo-blobs';
let databasePromise: Promise<IDBDatabase> | null = null;

function database() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB is unavailable'));
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return databasePromise;
}

/** Stores the original upload as a Blob; small metadata and previews stay in localStorage. */
export async function persistLocalImage(id: string, image: Blob): Promise<void> {
  try {
    const db = await database();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(image, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // The data-URL preview remains available as a localStorage fallback.
  }
}

export async function createLocalImagePreview(file: File, maxEdge = 960): Promise<{ url: string; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('This image could not be opened.'));
      element.src = objectUrl;
    });
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image preview is unavailable in this browser.');
    context.drawImage(image, 0, 0, width, height);
    return { url: canvas.toDataURL('image/jpeg', 0.82), width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function readLocalImage(id: string): Promise<Blob | null> {
  try {
    const db = await database();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
      request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function clearLocalAssets(): Promise<void> {
  const db = await database();
  db.close();
  databasePromise = null;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other Moodora tabs before clearing local images.'));
  });
}
