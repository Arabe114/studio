import { db as firebaseDb } from './firebase';
import { 
    collection as fbCollection,
    onSnapshot as fbOnSnapshot, 
    addDoc as fbAddDoc,
    doc as fbDoc,
    deleteDoc as fbDeleteDoc,
    updateDoc as fbUpdateDoc,
    writeBatch as fbWriteBatch,
    setDoc as fbSetDoc,
    getDoc as fbGetDoc,
    getDocs as fbGetDocs,
    query as fbQuery,
    where as fbWhere,
    Timestamp
} from 'firebase/firestore';

// --- Storage Mode ---
export type StorageMode = 'firebase' | 'local';
export let storageMode: StorageMode = 'firebase';

export function setStorageMode(mode: StorageMode) {
    console.log("Storage mode set to:", mode);
    storageMode = mode;
}

// --- Local Storage Implementation ---
const localData: Record<string, Record<string, any>> = {};
const localListeners: Record<string, ((data: any) => void)[]> = {};

function getLocalCollection(collectionPath: string) {
    if (!localData[collectionPath]) {
        try {
            const storedData = localStorage.getItem(`localDB_${collectionPath}`);
            localData[collectionPath] = storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Error parsing local storage data for", collectionPath, e);
            localData[collectionPath] = {};
        }
    }
    return localData[collectionPath];
}

function saveLocalCollection(collectionPath: string) {
    try {
        localStorage.setItem(`localDB_${collectionPath}`, JSON.stringify(localData[collectionPath]));
    } catch (e) {
        console.error("Error saving to local storage for", collectionPath, e);
    }
}

function notifyLocalListeners(collectionPath: string) {
    if (localListeners[collectionPath]) {
        const snapshot = Object.entries(localData[collectionPath]).map(([id, data]) => ({
            id,
            data: () => data,
        }));
        localListeners[collectionPath].forEach(callback => callback(snapshot));
    }
}

function notifyLocalDocListeners(collectionPath: string, docId: string) {
    const docPath = `${collectionPath}/${docId}`;
     if (localListeners[docPath]) {
        const doc = localData[collectionPath]?.[docId];
        const snapshot = doc ? { id: docId, data: () => doc, exists: () => true } : { id: docId, data: () => null, exists: () => false };
        localListeners[docPath].forEach(callback => callback(snapshot));
    }
}


// --- Unified API ---
type Unsubscribe = () => void;
type QueryConstraint = { type: 'where', field: string, op: '>=', value: any };

// Collection functions
export function onSnapshot(
    collectionPath: string, 
    callback: (snapshot: any[]) => void
): Unsubscribe | undefined;
export function onSnapshot(
    query: { collection: string, constraints: QueryConstraint[] },
    callback: (snapshot: any[]) => void
): Unsubscribe | undefined;
export function onSnapshot(
    pathOrQuery: string | { collection: string, constraints: QueryConstraint[] }, 
    callback: (snapshot: any[]) => void
): Unsubscribe | undefined {

    if (storageMode === 'firebase') {
        let q;
        if (typeof pathOrQuery === 'string') {
             q = fbCollection(firebaseDb, pathOrQuery);
        } else {
            const constraints = pathOrQuery.constraints.map(c => fbWhere(c.field, c.op, Timestamp.fromDate(new Date(c.value))));
            q = fbQuery(fbCollection(firebaseDb, pathOrQuery.collection), ...constraints);
        }
       return fbOnSnapshot(q, (querySnapshot) => {
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                data: () => doc.data()
            }));
            callback(docs);
        });
    } else { // local
        let collectionPath: string;
         if (typeof pathOrQuery === 'string') {
            collectionPath = pathOrQuery;
        } else {
            collectionPath = pathOrQuery.collection;
        }
        
        getLocalCollection(collectionPath);
        
        const listener = (snapshot) => {
            if (typeof pathOrQuery === 'object') { // Apply query constraints
                const filteredSnapshot = snapshot.filter(doc => {
                    return pathOrQuery.constraints.every(c => {
                        const docValue = doc.data()[c.field];
                        if (c.op === '>=') {
                           return new Date(docValue) >= new Date(c.value);
                        }
                        return false;
                    })
                })
                 callback(filteredSnapshot);
            } else {
                 callback(snapshot);
            }
        };

        if (!localListeners[collectionPath]) localListeners[collectionPath] = [];
        localListeners[collectionPath].push(listener);
        
        // Initial call
        listener(Object.entries(localData[collectionPath]).map(([id, data]) => ({ id, data: () => data })));
        
        return () => {
            const index = localListeners[collectionPath].indexOf(listener);
            if (index > -1) {
                localListeners[collectionPath].splice(index, 1);
            }
        };
    }
}

export async function addDoc(collectionPath: string, data: any) {
    if (storageMode === 'firebase') {
        return fbAddDoc(fbCollection(firebaseDb, collectionPath), data);
    } else { // local
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        if (!localData[collectionPath]) getLocalCollection(collectionPath);
        localData[collectionPath][id] = { ...data, id };
        saveLocalCollection(collectionPath);
        notifyLocalListeners(collectionPath);
        return { id };
    }
}

// Document functions
export function onDoc(
    collectionPath: string, 
    docId: string,
    callback: (doc: any) => void
): Unsubscribe | undefined {
    if (storageMode === 'firebase') {
        const docRef = fbDoc(firebaseDb, collectionPath, docId);
        return fbOnSnapshot(docRef, (docSnapshot) => {
             const docData = docSnapshot.exists() ? { id: docSnapshot.id, data: () => docSnapshot.data(), exists: () => true } : null;
             callback(docData);
        });
    } else { // local
        const docPath = `${collectionPath}/${docId}`;
        const listener = (doc) => callback(doc);

        if (!localListeners[docPath]) localListeners[docPath] = [];
        localListeners[docPath].push(listener);

        // Initial call
        const docData = localData[collectionPath]?.[docId];
        listener(docData ? { id: docId, data: () => docData, exists: () => true } : null);

        return () => {
            const index = localListeners[docPath].indexOf(listener);
            if (index > -1) {
                localListeners[docPath].splice(index, 1);
            }
        };
    }
}

export async function setDoc(collectionPath: string, docId: string, data: any, options?: { merge: boolean }) {
    if (storageMode === 'firebase') {
        return fbSetDoc(fbDoc(firebaseDb, collectionPath, docId), data, options || {});
    } else { // local
        if (!localData[collectionPath]) getLocalCollection(collectionPath);
        if (options?.merge && localData[collectionPath][docId]) {
            localData[collectionPath][docId] = { ...localData[collectionPath][docId], ...data };
        } else {
            localData[collectionPath][docId] = data;
        }
        saveLocalCollection(collectionPath);
        notifyLocalListeners(collectionPath);
        notifyLocalDocListeners(collectionPath, docId);
    }
}

export async function updateDoc(collectionPath: string, docId: string, data: any) {
    if (storageMode === 'firebase') {
        return fbUpdateDoc(fbDoc(firebaseDb, collectionPath, docId), data);
    } else { // local
        if (!localData[collectionPath] || !localData[collectionPath][docId]) return;
        localData[collectionPath][docId] = { ...localData[collectionPath][docId], ...data };
        saveLocalCollection(collectionPath);
        notifyLocalListeners(collectionPath);
        notifyLocalDocListeners(collectionPath, docId);
    }
}


export async function deleteDoc(collectionPath: string, docId: string) {
    if (storageMode === 'firebase') {
        return fbDeleteDoc(fbDoc(firebaseDb, collectionPath, docId));
    } else { // local
        if (!localData[collectionPath] || !localData[collectionPath][docId]) return;
        delete localData[collectionPath][docId];
        saveLocalCollection(collectionPath);
        notifyLocalListeners(collectionPath);
        notifyLocalDocListeners(collectionPath, docId);
    }
}


// Query functions
export function query(collection: string, ...constraints: QueryConstraint[]) {
    return { collection, constraints };
}

export function where(field: string, op: '>=', value: any): QueryConstraint {
     return { type: 'where', field, op, value };
}

// Batch - This is a bit tricky for local. We'll just execute promises.
// Note: This local implementation is NOT atomic.
export function writeBatch() {
     if (storageMode === 'firebase') {
         return fbWriteBatch(firebaseDb);
     } else {
         const operations: Promise<any>[] = [];
         return {
             delete: (collectionPath: string, docId: string) => operations.push(deleteDoc(collectionPath, docId)),
             set: (collectionPath: string, docId: string, data: any) => operations.push(setDoc(collectionPath, docId, data)),
             update: (collectionPath: string, docId: string, data: any) => operations.push(updateDoc(collectionPath, docId, data)),
             commit: () => Promise.all(operations),
         }
     }
}
