
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function getDb(): admin.firestore.Firestore {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: "synergyhub-i1sba",
        });
    }
    if (!db) {
        db = admin.firestore();
    }
    return db;
}

export { getDb };
