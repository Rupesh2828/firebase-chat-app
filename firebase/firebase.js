import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCGOQ3WH12Ir8kuoPAdoPif49DoCJTu8Sg",
  authDomain: "chat-app-19482.firebaseapp.com",
  projectId: "chat-app-19482",
  storageBucket: "chat-app-19482.appspot.com",
  messagingSenderId: "146087388997",
  appId: "1:146087388997:web:414a280a58ae50edb3002c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);