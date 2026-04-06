import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    where
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

type EventRequestStatus = "pending" | "approved" | "rejected";

type EventRequest = {
    id: string;
    title?: string;
    description?: string;
    location?: string;
    campus?: string;
    tags?: any;
    status?: EventRequestStatus;
    requestedBy?: string | null;
    createdAt?: any;
};

function normalizeTags(raw: any): string[] {
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === "string") {
        return raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
}

const getStatusStyle = (status?: EventRequestStatus) => {
    switch (status) {
        case "approved":
        return {
            backgroundColor: "#E9F9EE",
            borderColor: "#BBF7D0",
            color: "#166534",
            label: "Approved",
        };
        case "rejected":
        return {
            backgroundColor: "#FEE2E2",
            borderColor: "#FECACA",
            color: "#991B1B",
            label: "Rejected",
        };
        default:
        return {
            backgroundColor: "#EEF2FF",
            borderColor: "#C7D2FE",
            color: "#1D4ED8",
            label: "Pending",
        };
    }
    };

    export default function MyEventRequests() {
    const router = useRouter();

    const [items, setItems] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [qText, setQText] = useState("");

    useEffect(() => {
        const user = auth.currentUser;

        if (!user?.uid) {
        setItems([]);
        setLoading(false);
        return;
        }

        const qRef = query(
        collection(db, "event_requests"),
        where("requestedBy", "==", user.uid),
        orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(
        qRef,
        (snap) => {
            const list: EventRequest[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
            }));
            setItems(list);
            setLoading(false);
        },
        (err) => {
            console.log("my event requests error:", err);
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
        const blob =
            `${r.title ?? ""} ${r.location ?? ""} ${r.campus ?? ""} ${r.description ?? ""} ${tags}`.toLowerCase();

        return blob.includes(t);
        });
    }, [items, qText]);

    const deleteRequest = (id: string) => {
        Alert.alert(
        "Delete Request",
        "Are you sure you want to delete this event request?",
        [
            { text: "Cancel", style: "cancel" },
            {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
                try {
                await deleteDoc(doc(db, "event_requests", id));
                } catch (error) {
                console.log("delete event request error:", error);
                Alert.alert("Error", "Could not delete the request.");
                }
            },
            },
        ]
        );
    };

    return (
        <View style={styles.page}>
        <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
            </Pressable>
            <Text style={styles.title}>My Event Requests</Text>
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
                Your submitted event requests will appear here.                
                </Text>
            </View>
            ) : (
            filtered.map((item) => {
                const tags = normalizeTags(item.tags);
                const statusStyle = getStatusStyle(item.status);

                return (
                <View key={item.id} style={styles.card}>
                    <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>
                        {item.title || "Untitled Event"}
                    </Text>

                    <View
                        style={[
                        styles.statusPill,
                        {
                            backgroundColor: statusStyle.backgroundColor,
                            borderColor: statusStyle.borderColor,
                        },
                        ]}
                    >
                        <Text
                        style={[styles.statusText, { color: statusStyle.color }]}
                        >
                        {statusStyle.label}
                        </Text>
                    </View>
                    </View>

                    <Text style={styles.metaLine}>
                    {item.location ? `📍 ${item.location}` : "📍 Location not provided"}
                    {item.campus ? ` • ${item.campus}` : ""}
                    </Text>

                    {tags.length > 0 && (
                    <Text style={styles.tagsLine} numberOfLines={2}>
                        Tags: {tags.join(", ")}
                    </Text>
                    )}

                    {!!item.description && (
                    <Text style={styles.desc} numberOfLines={3}>
                        {item.description}
                    </Text>
                    )}

                    {item.status === "approved" && (
                    <Text style={styles.hint}>
                        Approved events appear in the main Events list.
                    </Text>
                    )}

                    {item.status === "rejected" && (
                    <Text style={styles.hint}>
                        You can submit a new request with more details.
                    </Text>
                    )}

                    {item.status === "pending" && (
                    <Pressable
                        style={styles.deleteBtn}
                        onPress={() => deleteRequest(item.id)}
                    >
                        <Text style={styles.deleteBtnText}>Delete Request</Text>
                    </Pressable>
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
    iconBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
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

    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },
    muted: { color: "#6B7280", fontWeight: "700" },

    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    emptyTitle: { fontWeight: "900", color: "#111827", fontSize: 16 },
    emptyText: {
        marginTop: 6,
        fontWeight: "700",
        color: "#6B7280",
        lineHeight: 18,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 8,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    cardTitle: {
        fontWeight: "900",
        color: "#111827",
        fontSize: 16,
        flex: 1,
    },

    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    statusText: { fontWeight: "900", fontSize: 12 },

    metaLine: { color: "#374151", fontWeight: "800" },
    tagsLine: { color: "#6B7280", fontWeight: "700" },
    desc: { color: "#111827", fontWeight: "700", lineHeight: 18 },
    hint: { color: "#6B7280", fontWeight: "700" },

    deleteBtn: {
        marginTop: 6,
        backgroundColor: "#DC2626",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    deleteBtnText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },
});