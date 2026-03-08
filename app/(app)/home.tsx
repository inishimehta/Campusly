import React, { useEffect, useMemo, useState } from "react";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

type Role = "student" | "staff" | "advisor" | "admin";

type LatestRoleRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  requestedRole?: "staff" | "advisor";
};

function Tile({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const user = auth.currentUser;

  const [role, setRole] = useState<Role>("student");
  const [latestReq, setLatestReq] = useState<LatestRoleRequest | null>(null);
  const [lastSeenReqId, setLastSeenReqId] = useState<string | null>(null);

  const greeting = useMemo(() => {
    if (role === "admin") return "welcome, admin!";
    if (role === "staff") return "welcome, staff!";
    if (role === "advisor") return "welcome, wellness advisor!";
    return "welcome, students!";
  }, [role]);

  const shouldShowBanner =
    !!latestReq &&
    (latestReq.status === "approved" || latestReq.status === "rejected") &&
    latestReq.id !== lastSeenReqId;

  const loadProfileAndLatestRequest = async () => {
    if (!user) return;

    // 1) Load user profile (role + lastSeenRoleRequestId)
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as any;
      const r = data?.role as Role | undefined;
      if (r) setRole(r);

      const seen = data?.lastSeenRoleRequestId as string | undefined;
      setLastSeenReqId(seen ?? null);
    } else {
      setRole("student");
      setLastSeenReqId(null);
    }

    // 2) Load latest role request for this user
    const q = query(
      collection(db, "roleRequests"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      setLatestReq(null);
      return;
    }

    const d = snap.docs[0];
    const data = d.data() as any;

    setLatestReq({
      id: d.id,
      status: data.status,
      requestedRole: data.requestedRole,
    });
  };

  useEffect(() => {
    loadProfileAndLatestRequest().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const dismissBanner = async () => {
    if (!user || !latestReq) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        lastSeenRoleRequestId: latestReq.id,
      });
      setLastSeenReqId(latestReq.id);
    } catch (e) {
      setLastSeenReqId(latestReq.id);
      console.log("Dismiss persist failed:", e);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>Campusly</Text>

        <Pressable
          style={styles.avatar}
          onPress={() => router.push("/(app)/profile" as Href)}
          accessibilityLabel="Open profile"
        >
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <Text style={styles.welcome}>{greeting}</Text>
      <Text style={styles.sub}>Have a great day on campus</Text>

      {shouldShowBanner && latestReq?.status === "approved" && (
        <View style={styles.noticeOk}>
          <Text style={styles.noticeTitle}>✅ Role request approved</Text>
          <Text style={styles.noticeText}>
            Your request was approved{latestReq.requestedRole ? ` for ${latestReq.requestedRole}` : ""}.
            You should now see extra tools on your home screen.
          </Text>
          <Pressable onPress={dismissBanner}>
            <Text style={styles.noticeLink}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {shouldShowBanner && latestReq?.status === "rejected" && (
        <View style={styles.noticeBad}>
          <Text style={styles.noticeTitle}>❌ Role request rejected</Text>
          <Text style={styles.noticeText}>
            Your request was not approved. You can submit a new request with more details.
          </Text>
          <Pressable onPress={dismissBanner}>
            <Text style={styles.noticeLink}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Tip of the day</Text>
        <Text style={styles.tipText}>
          Take a 5-minute break every hour while studying to improve focus and retention!
        </Text>
      </View>

      <View style={styles.grid}>
        <Tile title="Places" onPress={() => router.push("/(app)/places" as Href)} />
        <Tile title="Events" onPress={() => router.push("/(app)/events" as Href)} />
        <Tile title="Study Groups" onPress={() => router.push("/(app)/study-groups" as Href)} />
        <Tile title="Wellness Services" onPress={() => router.push("/(app)/wellness" as Href)} />

        {(role === "staff" || role === "admin") && (
          <>
            <Tile title="Manage Events" onPress={() => router.push("/(app)/staff-events" as Href)} />
            <Tile title="Contact Requests" onPress={() => router.push("/(app)/contact-requests" as Href)} />
          </>
        )}

        {(role === "advisor" || role === "admin") && (
          <>
            <Tile title="My Schedule" onPress={() => router.push("/(app)/advisor-schedule" as Href)} />
            <Tile title="My Bookings" onPress={() => router.push("/(app)/advisor-bookings" as Href)} />
          </>
        )}

        {role === "admin" && (
          <>
            <Tile title="Role Requests" onPress={() => router.push("/(app)/admin-role-requests" as Href)} />
            <Tile title="Manage Places" onPress={() => router.push("/(app)/manage-places" as Href)} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // NEW: wrapper so ScrollView has a background
  screen: { flex: 1, backgroundColor: "#F6F7FB" },

  // content container (same as before, just moved)
  container: {
    padding: 18,
    paddingTop: 56,
    paddingBottom: 24, // gives room at the bottom for scrolling
    backgroundColor: "#F6F7FB",
  },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 20, fontWeight: "800", color: "#111827" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6D5BFF",
    alignItems: "center",
    justifyContent: "center",
  },

  welcome: { marginTop: 18, fontSize: 16, fontWeight: "800", color: "#111827" },
  sub: { marginTop: 6, color: "#6B7280", fontWeight: "500" },

  noticeOk: {
    marginTop: 12,
    backgroundColor: "#E9F9EE",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  noticeBad: {
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  noticeTitle: { fontWeight: "900", marginBottom: 6, color: "#111827" },
  noticeText: { color: "#374151", fontWeight: "600" },
  noticeLink: { marginTop: 10, color: "#2563EB", fontWeight: "900" },

  tip: { marginTop: 14, backgroundColor: "#FFF6DD", borderRadius: 16, padding: 14 },
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

  quickLinks: { marginTop: 16, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14 },
  quickTitle: { fontSize: 14, fontWeight: "900", marginBottom: 10, color: "#111827" },
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
