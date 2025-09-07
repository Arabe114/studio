import * as admin from 'firebase-admin';

const projectId = "synergyhub-i1sba";

// This is the most robust way to initialize the admin SDK in a server environment.
// It prevents re-initialization errors by getting the app if it already exists.
const app = admin.apps.find((app) => app?.name === projectId) || admin.initializeApp({
  projectId: projectId,
}, projectId);

const db = admin.firestore(app);

export { db };
