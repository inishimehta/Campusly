import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    } from "react-native";
    import { Ionicons } from "@expo/vector-icons";
    import { useRouter } from "expo-router";

    import { auth, db } from "../../../firebaseConfig";
    import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

    type ReqStatus = "pending" | "approved" | "rejected";

    type PlaceRequest = {
    id: string;
    name: string;
    campus?: string;
    rating?: number;
    reviewsCount?: number;
    tags?: any;
    desc?: string;
    status: ReqStatus;
    createdAt?: any;
    };

    function normalizeTags(raw: any): string[] {
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === "string")
    return raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    return [];
    }

    function StatusPill({ status }: { status: ReqStatus }) {
    const cfg =
    status === "approved"
        ? { bg: "#E9F9EE", border: "#BBF7D0", text: "#166534", label: "Approved" }
        : status === "rejected"
        ? { bg: "#FEE2E2", border: "#FECACA", text: "#991B1B", label: "Rejected" }
        : { bg: "#EEF2FF", border: "#C7D2FE", text: "#1D4ED8", label: "Pending" };

    return (
    <View style={[styles.statusPill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
    );
    }

    export default function MyPlaceRequests() {
    const router = useRouter();
    const [items, setItems] = useState<PlaceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [qText, setQText] = useState("");

    useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
        setItems([]);
        setLoading(false);
        return;
    }

    const qRef = query(
        collection(db, "placeRequests"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
        qRef,
        (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
        },
        (err) => {
        console.log("my place requests error:", err);
        setItems([]);
        setLoading(false);
        }
    );

    return () => unsub();
    }, []);

    const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return items;

    return items.filter((r) => {
        const tags = normalizeTags(r.tags).join(" ");
        const blob = `${r.name ?? ""} ${r.campus ?? ""} ${r.desc ?? ""} ${tags}`.toLowerCase();
        return blob.includes(t);
    });
    }, [items, qText]);

    return (
    <View style={styles.page}>
        <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>My Place Requests</Text>
        <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
            value={qText}
            onChangeText={setQText}
            placeholder="Search your requests…"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
        />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
            <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading…</Text>
            </View>
        ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyText}>
                Submit one from Places using the + button.
            </Text>
            </View>
        ) : (
            filtered.map((r) => {
            const tags = normalizeTags(r.tags);
            return (
                <View key={r.id} style={styles.card}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{r.name}</Text>
                    <StatusPill status={r.status} />
                </View>

                <Text style={styles.metaLine}>
                    ⭐ {Number(r.rating ?? 0).toFixed(1)} • {Number(r.reviewsCount ?? 0)} reviews
                    {r.campus ? ` • ${r.campus}` : ""}
                </Text>

                {tags.length > 0 && (
                    <Text style={styles.tagsLine} numberOfLines={2}>
                    Tags: {tags.join(", ")}
                    </Text>
                )}

                {!!r.desc && (
                    <Text style={styles.desc} numberOfLines={3}>
                    {r.desc}
                    </Text>
                )}

                {r.status === "approved" && (
                    <Text style={styles.hint}>
                    Approved places appear in the main Places list.
                    </Text>
                )}
                {r.status === "rejected" && (
                    <Text style={styles.hint}>
                    You can submit a new request with more details.
                    </Text>
                )}
                </View>
            );
            })
        )}

        <View style={{ height: 24 }} />
        </ScrollView>
    </View>
    );
    }

    const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },

    topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    },
    iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 18, fontWeight: "800", color: "#111827" },

    searchWrap: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    },
    searchInput: { flex: 1, color: "#111827", fontWeight: "600" },

    scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },

    loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
    muted: { color: "#6B7280", fontWeight: "700" },

    emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    },
    emptyTitle: { fontWeight: "900", color: "#111827", fontSize: 16 },
    emptyText: { marginTop: 6, fontWeight: "700", color: "#6B7280", lineHeight: 18 },

    card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
    },
    cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    cardTitle: { fontWeight: "900", color: "#111827", fontSize: 16, flex: 1 },

    statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
    statusText: { fontWeight: "900", fontSize: 12 },

    metaLine: { color: "#374151", fontWeight: "800" },
    tagsLine: { color: "#6B7280", fontWeight: "700" },
    desc: { color: "#111827", fontWeight: "700", lineHeight: 18 },
    hint: { color: "#6B7280", fontWeight: "700" },
});
