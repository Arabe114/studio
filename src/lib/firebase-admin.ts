
import * as admin from 'firebase-admin';

// This is the most robust way to initialize the admin SDK in a server environment.
// It prevents re-initialization errors by getting the app if it already exists.
if (!admin.apps.length) {
    admin.initializeApp();
}


const db = admin.firestore();

export { db };
