import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { auth, db } from "../../firebaseConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

type RoleRequestDoc = {
    id: string;
    uid: string;
    email: string;
    requestedRole: "staff" | "advisor";
    reason: string;
    status: "pending" | "approved" | "rejected";
};

export default function AdminRoleRequests() {
    const [items, setItems] = useState<RoleRequestDoc[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);

        try {
        const q = query(
            collection(db, "roleRequests"),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load requests");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const approve = async (r: RoleRequestDoc) => {
        const admin = auth.currentUser;
        if (!admin) {
        Alert.alert("Error", "No admin is signed in.");
        return;
        }

        try {
        console.log("Approve clicked");
        console.log("Full request:", JSON.stringify(r, null, 2));

        if (!r.uid) {
            throw new Error("Request UID is missing.");
        }

        const userRef = doc(db, "users", r.uid);
        const reqRef = doc(db, "roleRequests", r.id);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User document does not exist for uid: ${r.uid}`);
        }

        console.log("User doc exists, updating role to:", r.requestedRole);

        await updateDoc(userRef, {
            role: r.requestedRole,
        });

        console.log("User role updated successfully");

        await updateDoc(reqRef, {
            status: "approved",
            reviewedBy: admin.uid,
            reviewedAt: serverTimestamp(),
        });

        console.log("Role request marked approved");

        Alert.alert("Approved", `${r.email} is now ${r.requestedRole}`);
        await load();
        } catch (e: any) {
        console.log("APPROVE FAILED:", e);
        Alert.alert("Approve failed", e?.message ?? "Unknown error");
        }
    };

    const reject = async (r: RoleRequestDoc) => {
        const admin = auth.currentUser;
        if (!admin) {
        Alert.alert("Error", "No admin user is signed in.");
        return;
        }

        try {
        await updateDoc(doc(db, "roleRequests", r.id), {
            status: "rejected",
            reviewedBy: admin.uid,
            reviewedAt: serverTimestamp(),
        });

        Alert.alert("Rejected", r.email);
        await load();
        } catch (e: any) {
        console.log("Reject failed:", e);
        Alert.alert("Reject failed", e?.message ?? "Unknown error");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Admin — Role Requests</Text>

        {loading && <Text style={styles.muted}>Loading...</Text>}
        {!loading && items.length === 0 && (
            <Text style={styles.muted}>No pending requests.</Text>
        )}

        {items.map((r) => (
            <View key={r.id} style={styles.card}>
            <Text style={styles.email}>{r.email}</Text>
            <Text style={styles.meta}>Requested: {r.requestedRole}</Text>
            <Text style={styles.reason}>{r.reason}</Text>

            <View style={styles.row}>
                <Pressable
                style={[styles.btn, styles.approve]}
                onPress={() => approve(r)}
                >
                <Text style={styles.btnText}>Approve</Text>
                </Pressable>

                <Pressable
                style={[styles.btn, styles.reject]}
                onPress={() => reject(r)}
                >
                <Text style={styles.btnText}>Reject</Text>
                </Pressable>
            </View>
            </View>
        ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 18,
        paddingTop: 56,
        gap: 12,
        backgroundColor: "#F6F7FB",
    },
    h1: {
        fontSize: 20,
        fontWeight: "900",
        color: "#111827",
    },
    muted: {
        color: "#6B7280",
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 6,
    },
    email: {
        fontWeight: "900",
        color: "#111827",
    },
    meta: {
        color: "#374151",
        fontWeight: "800",
    },
    reason: {
        color: "#111827",
    },
    row: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    approve: {
        backgroundColor: "#111827",
    },
    reject: {
        backgroundColor: "#EF4444",
    },
    btnText: {
        color: "white",
        fontWeight: "900",
    },
});