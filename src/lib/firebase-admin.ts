import * as admin from 'firebase-admin';

// This is the correct way to initialize the admin SDK in a server environment.
// It will automatically use the project's service account credentials.
const projectId = "synergyhub-i1sba";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = admin.firestore();

export { db };
