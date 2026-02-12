import React from "react";
import { View, Button, Alert, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    query,
    limit,
    serverTimestamp,
} from "firebase/firestore";

export default function FirebaseTestScreen() {
    const addTestDoc = async () => {
        try {
        const ref = await addDoc(collection(db, "test"), {
            message: "Hello from Expo + Firestore 🚀",
            createdAt: serverTimestamp(),
        });

        Alert.alert("Success", `Document ID: ${ref.id}`);
        } catch (error: any) {
        Alert.alert("Error", error.message);
        }
    };

    const readTestDocs = async () => {
        try {
        const q = query(collection(db, "test"), limit(5));
        const snapshot = await getDocs(q);

        const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        Alert.alert("Documents", JSON.stringify(docs, null, 2));
        } catch (error: any) {
        Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
        <Button title="Add Test Document" onPress={addTestDoc} />
        <View style={{ height: 16 }} />
        <Button title="Read Test Documents" onPress={readTestDocs} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
});
