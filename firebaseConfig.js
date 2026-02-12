// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCLuvEm111aYSlHE71ARXpePL5P0fxbM20",
    authDomain: "campusly-mobile.firebaseapp.com",
    projectId: "campusly-mobile",
    storageBucket: "campusly-mobile.firebasestorage.app",
    messagingSenderId: "635822272073",
    appId: "1:635822272073:web:01e0b399170ac98ac11998",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// ✅ React Native persistent auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
