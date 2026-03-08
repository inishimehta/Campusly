import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function AdminDashboard() {
    const router = useRouter();

    const [counts, setCounts] = useState({
        users: 0,
        pendingRoleRequests: 0,
        places: 0,
        events: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
        try {
            setLoading(true);

            // These collections must exist for counts to work:
            // users, roleRequests, places, events
            const usersCount = await getCountFromServer(collection(db, "users"));

            const pendingReqCount = await getCountFromServer(
            query(collection(db, "roleRequests"), where("status", "==", "pending"))
            );

            const placesCount = await getCountFromServer(collection(db, "places"));
            const eventsCount = await getCountFromServer(collection(db, "events"));

            setCounts({
            users: usersCount.data().count,
            pendingRoleRequests: pendingReqCount.data().count,
            places: placesCount.data().count,
            events: eventsCount.data().count,
            });
        } catch (e) {
            // If some collections aren't created yet, keep zeros
            console.log("Admin dashboard count error:", e);
        } finally {
            setLoading(false);
        }
        })();
    }, []);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
            <Text style={styles.h1}>Admin Dashboard</Text>
            <Text style={styles.sub}>{loading ? "Loading…" : "Overview"}</Text>
        </View>

        <View style={styles.cards}>
            <StatCard title="Total Users" value={counts.users} />
            <StatCard title="Pending Role Requests" value={counts.pendingRoleRequests} />
            <StatCard title="Places" value={counts.places} />
            <StatCard title="Events" value={counts.events} />
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>

            <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(app)/admin-role-requests" as Href)}
            >
            <Text style={styles.primaryBtnText}>Manage Role Requests</Text>
            <Text style={styles.primaryBtnHint}>Approve / reject upgrades</Text>
            </Pressable>

            <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.push("/(app)/manage-places" as Href)}
            >
            <Text style={styles.secondaryBtnText}>Manage Places List</Text>
            <Text style={styles.secondaryBtnHint}>Review + edit places</Text>
            </Pressable>
        </View>

        <Text style={styles.note}>
            Tip: If any count stays at 0, create the collection at least once (add 1 doc) so Firestore can count it.
        </Text>
        </ScrollView>
    );
    }

    function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        </View>
    );
    }

    const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#F6F7FB" },
    container: { padding: 18, paddingTop: 56, paddingBottom: 24, gap: 14 },

    headerRow: { gap: 6 },
    h1: { fontSize: 22, fontWeight: "900", color: "#111827" },
    sub: { color: "#6B7280", fontWeight: "700" },

    cards: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    card: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    cardTitle: { color: "#374151", fontWeight: "800", fontSize: 12 },
    cardValue: { marginTop: 8, color: "#111827", fontWeight: "900", fontSize: 24 },

    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 10,
    },
    sectionTitle: { fontWeight: "900", color: "#111827", fontSize: 14, marginBottom: 4 },

    primaryBtn: {
        backgroundColor: "#111827",
        borderRadius: 16,
        padding: 14,
    },
    primaryBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
    primaryBtnHint: { marginTop: 4, color: "#E5E7EB", fontWeight: "700" },

    secondaryBtn: {
        backgroundColor: "#F3F4F6",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    secondaryBtnText: { color: "#111827", fontWeight: "900", fontSize: 16 },
    secondaryBtnHint: { marginTop: 4, color: "#6B7280", fontWeight: "700" },

    note: { textAlign: "center", color: "#6B7280", fontWeight: "600", marginTop: 4 },
});
