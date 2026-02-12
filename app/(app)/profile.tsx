import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { auth, db } from "../../firebaseConfig";
import { deleteUser, signOut } from "firebase/auth";

import { doc, getDoc, deleteDoc } from "firebase/firestore";

type Role = "student" | "staff" | "advisor" | "admin";

export default function ProfileScreen() {
    const router = useRouter();
    const user = auth.currentUser;

    console.log("Current UID:", auth.currentUser?.uid);

    const [role, setRole] = useState<Role>("student");
    const [loading, setLoading] = useState(true);

    const initials = useMemo(() => {
        const email = user?.email ?? "";
        const left = email.split("@")[0] ?? "";
        const a = left[0]?.toUpperCase() ?? "U";
        const b = left[1]?.toUpperCase() ?? "";
        return (a + b) || "U";
    }, [user?.email]);

    useEffect(() => {
        (async () => {
        try {
            if (!user) return;
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
            const data = snap.data() as { role?: Role };
            setRole(data.role ?? "student");
            }
        } finally {
            setLoading(false);
        }
        })();
    }, [user]);

    const onSignOut = async () => {
        await signOut(auth);
        router.replace("/" as Href); // index.tsx will send them to sign-in
    };

    const onDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    Alert.alert(
        "Delete account?",
        "This action cannot be undone. Your account will be permanently deleted.",
        [
        { text: "Cancel", style: "cancel" },
        {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
            try {
                // 1️⃣ Delete Firestore user document
                await deleteDoc(doc(db, "users", user.uid));

                // 2️⃣ Delete Firebase Auth account
                await deleteUser(user);

                // 3️⃣ Redirect to splash (which will go to sign-in)
                router.replace("/");
            } catch (error: any) {
            console.log("Delete account error:", error?.code, error?.message);

            if (error?.code === "auth/requires-recent-login") {
                Alert.alert(
                "Re-authentication required",
                "For security, please sign out, sign in again, then delete your account immediately."
                );
                return;
            }

            Alert.alert("Error", error?.message ?? "Failed to delete account.");
            }

            },
        },
        ]
    );
    };


    const goToRoleRequest = () => {
        router.push("/(app)/role-request" as Href);
    };

    if (!user) {
        return (
        <View style={styles.container}>
            <Text style={styles.h1}>Profile</Text>
            <Text style={styles.muted}>You are not signed in.</Text>
        </View>
        );
    }

    return (
        <View style={styles.container}>
        <View style={styles.headerRow}>
            <Text style={styles.h1}>Profile</Text>
            <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Done</Text>
            </Pressable>
        </View>

        <View style={styles.card}>
            <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.meta}>
            Role: {loading ? "Loading…" : role}
            </Text>
        </View>

        {/* Role request makes most sense for students (optional to show for others) */}
        {role === "student" && (
            <Pressable style={styles.secondaryBtn} onPress={goToRoleRequest}>
            <Text style={styles.secondaryText}>Request role upgrade</Text>
            </Pressable>
        )}

        <Pressable style={styles.primaryBtn} onPress={onSignOut}>
            <Text style={styles.primaryText}>Sign out</Text>
        </Pressable>

        <Pressable style={styles.dangerBtn} onPress={onDeleteAccount}>
            <Text style={styles.dangerText}>Delete account</Text>
        </Pressable>


        <Text style={styles.note}>
            Note: Account deletion may require you to sign in again (“recent login”).
        </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F7FB", padding: 18, paddingTop: 56, gap: 12 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    h1: { fontSize: 20, fontWeight: "900", color: "#111827" },
    link: { color: "#2563EB", fontWeight: "800" },
    muted: { color: "#6B7280", fontWeight: "600" },

    card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, gap: 8, borderWidth: 1, borderColor: "#E5E7EB" },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#6D5BFF", alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
    email: { fontWeight: "900", color: "#111827" },
    meta: { color: "#374151", fontWeight: "700" },

    secondaryBtn: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
    secondaryText: { color: "#111827", fontWeight: "900" },

    primaryBtn: { backgroundColor: "#111827", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    primaryText: { color: "#FFFFFF", fontWeight: "900" },

    dangerBtn: { backgroundColor: "#EF4444", borderRadius: 14, paddingVertical: 14, alignItems: "center",  marginTop: 12},
    dangerText: { color: "#FFFFFF", fontWeight: "900" },

    note: { color: "#6B7280", fontWeight: "600", textAlign: "center", marginTop: 6 },
});
