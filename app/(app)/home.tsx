import React, { useEffect, useMemo, useState } from "react";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

type Role = "student" | "staff" | "advisor" | "admin";

function Tile({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");

  const user = auth.currentUser;

  const greeting = useMemo(() => {
    if (role === "admin") return "welcome, admin!";
    if (role === "staff") return "welcome, staff!";
    if (role === "advisor") return "welcome, wellness advisor!";
    return "welcome, students!";
  }, [role]);

  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const r = (snap.data() as any)?.role as Role | undefined;
          if (r) setRole(r);
        }
      } catch (e) {
        // If Firestore fails, default stays student
      }
    })();
  }, [user?.uid]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Campusly</Text>

        {/* Profile button */}
        <Pressable onPress={() => router.push("/(app)/profile" as Href)} style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </Pressable>
      </View>

      <Text style={styles.welcome}>{greeting}</Text>
      <Text style={styles.sub}>Have a great day on campus</Text>

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Tip of the day</Text>
        <Text style={styles.tipText}>
          Take a 5-minute break every hour while studying to improve focus and retention!
        </Text>
      </View>

      {/* Base features (everyone) */}
      <View style={styles.grid}>
        <Tile title="Places" onPress={() => router.push("/(app)/places" as Href)} />
        <Tile title="Events" onPress={() => router.push("/(app)/events" as Href)} />
        <Tile title="Study Groups" onPress={() => router.push("/(app)/study-groups" as Href)} />
        <Tile title="Wellness Services" onPress={() => router.push("/(app)/wellness" as Href)} />

        {/* Staff extras */}
        {role === "staff" && (
          <>
            <Tile title="Manage Events" onPress={() => router.push("/(app)/staff-events" as Href)} />
            <Tile title="Contact Requests" onPress={() => router.push("/(app)/contact-requests" as Href)} />
          </>
        )}

        {/* Advisor extras */}
        {role === "advisor" && (
          <>
            <Tile title="My Schedule" onPress={() => router.push("/(app)/advisor-schedule" as Href)} />
            <Tile title="My Bookings" onPress={() => router.push("/(app)/advisor-bookings" as Href)} />
          </>
        )}

        {/* Admin extras */}
        {role === "admin" && (
          <>
            <Tile title="Role Requests" onPress={() => router.push("/(app)/admin-role-requests" as Href)} />
            <Tile title="Admin Dashboard" onPress={() => router.push("/(app)/admin-dashboard" as Href)} />
          </>
        )}
      </View>

      <View style={styles.quickLinks}>
        <Text style={styles.quickTitle}>Quick Links</Text>
        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/(app)/places" as Href)}>
            <Text style={styles.quickBtnText}>Maps</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/(app)/events" as Href)}>
            <Text style={styles.quickBtnText}>Clubs</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/(app)/wellness" as Href)}>
            <Text style={styles.quickBtnText}>Services</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingTop: 56,
    backgroundColor: "#F6F7FB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 20, fontWeight: "800", color: "#111827" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6D5BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontWeight: "900" },

  welcome: { marginTop: 18, fontSize: 16, fontWeight: "800", color: "#111827" },
  sub: { marginTop: 6, color: "#6B7280", fontWeight: "500" },

  tip: {
    marginTop: 14,
    backgroundColor: "#FFF6DD",
    borderRadius: 16,
    padding: 14,
  },
  tipTitle: { fontWeight: "900", marginBottom: 6, color: "#111827" },
  tipText: { color: "#374151", fontWeight: "500" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "48%",
    height: 132,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 12,
    justifyContent: "flex-end",
  },
  tileTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },

  quickLinks: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
    color: "#111827",
  },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  quickBtnText: { fontWeight: "700", color: "#111827" },
});
