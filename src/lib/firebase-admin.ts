
import * as admin from 'firebase-admin';

// This is the correct, robust way to initialize the admin SDK in a server environment.
// It prevents re-initialization errors by getting the app if it already exists.
// Using a function to get the db instance ensures this code only runs when needed.
function getDb() {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: "synergyhub-i1sba",
        });
    }
    return admin.firestore();
}

export { getDb };
