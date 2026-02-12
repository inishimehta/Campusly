import React, { useEffect, useState } from "react";
import { Stack, useRouter, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { auth } from "../../firebaseConfig";
import { onAuthStateChanged, reload, signOut } from "firebase/auth";

export default function AppLayout() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
        try {
            if (!user) {
            router.replace("/(auth)/sign-in" as Href);
            return;
            }

            await reload(user);

            if (!user.emailVerified) {
            await signOut(auth);
            router.replace("/(auth)/sign-in" as Href);
            return;
            }

            setReady(true);
        } catch {
            await signOut(auth);
            router.replace("/(auth)/sign-in" as Href);
        }
        });

        return () => unsub();
    }, [router]);

    if (!ready) {
        return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
        </View>
        );
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
