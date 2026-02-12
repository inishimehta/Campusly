import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { onAuthStateChanged, reload, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { ensureUserProfile, getMyRole } from "../src/auth/userProfile";

export default function Splash() {
  const router = useRouter();

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


        await ensureUserProfile("student");

        const role = await getMyRole();

        router.replace("/(app)/home" as Href);
      } catch {
        router.replace("/(auth)/sign-in" as Href);
      }
    });

    return () => unsub();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>C</Text>
      </View>
      <Text style={styles.title}>Campusly</Text>
      <Text style={styles.subtitle}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#6D5BFF", alignItems: "center", justifyContent: "center" },
  icon: { width: 72, height: 72, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 28, fontWeight: "800", color: "#2F5BFF" },
  title: { marginTop: 14, fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { marginTop: 10, fontSize: 14, fontWeight: "600", color: "#EDEBFF" },
});
