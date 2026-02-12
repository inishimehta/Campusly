import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useRouter, type Href } from "expo-router";

export default function RoleRequest() {
    const router = useRouter();
    const [requestedRole, setRequestedRole] = useState<"staff" | "advisor">("staff");
    const [reason, setReason] = useState("");

    const submit = async () => {
        const user = auth.currentUser;
        if (!user) {
        Alert.alert("Not signed in");
        return;
        }
        if (reason.trim().length < 10) {
        Alert.alert("Add details", "Please write at least 10 characters.");
        return;
        }

        await addDoc(collection(db, "roleRequests"), {
        uid: user.uid,
        email: user.email,
        requestedRole,
        reason: reason.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        });

        Alert.alert("Submitted", "An admin will review your request.");
        router.replace("/(app)/profile" as Href);
    };

    return (
        <View style={styles.container}>
        <Text style={styles.h1}>Request role upgrade</Text>

        <Text style={styles.label}>Requested role</Text>
        <View style={styles.row}>
            <Pressable
            style={[styles.pill, requestedRole === "staff" && styles.pillActive]}
            onPress={() => setRequestedRole("staff")}
            >
            <Text style={[styles.pillText, requestedRole === "staff" && styles.pillTextActive]}>Staff</Text>
            </Pressable>
            <Pressable
            style={[styles.pill, requestedRole === "advisor" && styles.pillActive]}
            onPress={() => setRequestedRole("advisor")}
            >
            <Text style={[styles.pillText, requestedRole === "advisor" && styles.pillTextActive]}>Advisor</Text>
            </Pressable>
        </View>

        <Text style={styles.label}>Reason</Text>
        <TextInput
            placeholder="Explain why you need this role…"
            value={reason}
            onChangeText={setReason}
            style={[styles.input, { height: 120 }]}
            multiline
        />

        <Pressable style={styles.btn} onPress={submit}>
            <Text style={styles.btnText}>Submit request</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Cancel</Text>
        </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F7FB", padding: 18, paddingTop: 56, gap: 12 },
    h1: { fontSize: 20, fontWeight: "900", color: "#111827" },
    label: { fontSize: 12, fontWeight: "800", color: "#374151" },
    row: { flexDirection: "row", gap: 10 },
    pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" },
    pillActive: { backgroundColor: "#111827" },
    pillText: { fontWeight: "900", color: "#111827" },
    pillTextActive: { color: "white" },
    input: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", textAlignVertical: "top" },
    btn: { backgroundColor: "#111827", padding: 12, borderRadius: 14, alignItems: "center" },
    btnText: { color: "white", fontWeight: "900" },
    link: { textAlign: "center", color: "#2563EB", fontWeight: "800", marginTop: 6 },
});
