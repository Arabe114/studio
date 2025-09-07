import * as admin from 'firebase-admin';

const firebaseConfig = {
  "projectId": "synergyhub-i1sba",
  "appId": "1:1089312786800:web:1bd26c7fc9c80731ca67b5",
  "storageBucket": "synergyhub-i1sba.firebasestorage.app",
  "apiKey": "AIzaSyCY9dJftZ2gBGMTpdCrrz6dXgsW4C4KBl4",
  "authDomain": "synergyhub-i1sba.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1089312786800"
};

if (!admin.apps.length) {
  admin.initializeApp({
    // Use projectId from your config
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();

export { db };