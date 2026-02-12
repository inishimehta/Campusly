import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { isGeorgeBrownEmail } from "../../src/auth/roles";

export default function SignUp() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const onSignUp = async () => {
        const e = email.trim();

        if (!isGeorgeBrownEmail(e)) {
        Alert.alert("Invalid email", "Only <id>@georgebrown.ca emails can create an account.");
        return;
        }
        if (password.length < 6) {
        Alert.alert("Weak password", "Password must be at least 6 characters.");
        return;
        }
        if (password !== confirmPassword) {
        Alert.alert("Passwords don't match", "Please re-enter your password.");
        return;
        }

        try {
        const cred = await createUserWithEmailAndPassword(auth, e, password);

        // Create user profile doc (default role is student)
        await setDoc(doc(db, "users", cred.user.uid), {
            email: cred.user.email,
            role: "student",
            isActive: true,
            createdAt: serverTimestamp(),
        });

        // Send verification email
        await sendEmailVerification(cred.user);

        Alert.alert(
            "Verify your email",
            "We sent a verification email. Please verify, then sign in."
        );

        router.replace("/(auth)/sign-in");
        } catch (err: any) {
        Alert.alert("Sign up failed", err?.message ?? "Unknown error");
        }
    };

    return (
        <LinearGradient colors={["#F6F7FB", "#EEF0FF"]} style={styles.container}>
        <View style={styles.brand}>
            <View style={styles.icon}>
            <Text style={styles.iconText}>C</Text>
            </View>
            <Text style={styles.brandText}>Campusly</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.h1}>Create your Campusly account</Text>

            <Text style={styles.label}>George Brown Email</Text>
            <TextInput
            placeholder="123456@georgebrown.ca"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            />

            <Pressable style={styles.primaryBtn} onPress={onSignUp}>
            <Text style={styles.primaryBtnText}>Create account</Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
            </Pressable>
        </View>

        <Text style={styles.footerHint}>
            By creating an account, you agree to Campusly’s community guidelines.
        </Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: "center" },

    brand: { alignItems: "center", marginBottom: 18 },
    icon: {
        width: 66,
        height: 66,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 2,
    },
    iconText: { fontSize: 26, fontWeight: "800", color: "#2F5BFF" },
    brandText: { marginTop: 10, fontSize: 18, fontWeight: "700", color: "#111827" },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
    },
    h1: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 10 },

    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#374151",
        marginTop: 10,
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },

    primaryBtn: {
        marginTop: 14,
        borderRadius: 12,
        paddingVertical: 12,
        backgroundColor: "#111827",
        alignItems: "center",
    },
    primaryBtnText: { color: "#FFFFFF", fontWeight: "800" },

    link: {
        marginTop: 12,
        textAlign: "center",
        color: "#2563EB",
        fontWeight: "700",
    },

    footerHint: {
        marginTop: 14,
        textAlign: "center",
        color: "#6B7280",
        fontWeight: "600",
        paddingHorizontal: 10,
    },
});
