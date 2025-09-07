import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "synergyhub-i1sba",
  "appId": "1:1089312786800:web:1bd26c7fc9c80731ca67b5",
  "storageBucket": "synergyhub-i1sba.appspot.com",
  "apiKey": "AIzaSyCY9dJftZ2gBGMTpdCrrz6dXgsW4C4KBl4",
  "authDomain": "synergyhub-i1sba.firebaseapp.com",
  "messagingSenderId": "1089312786800"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
