// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDg4AGpQhqjJiFlCszPdy7TjFQBZT0eDAo",
  authDomain: "tones-698e7.firebaseapp.com",
  projectId: "tones-698e7",
  storageBucket: "tones-698e7.firebasestorage.app",
  messagingSenderId: "851078170841",
  appId: "1:851078170841:web:078aa9f018873b58de96c8",
  measurementId: "G-D6MXLEXJ0K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 