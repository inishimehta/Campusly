import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { db } from "../../firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

type ReqStatus = "pending" | "approved" | "rejected";

type EventRequest = {
    id: string;
    title?: string;
    description?: string;
    location?: string;
    campus?: string;
    tags?: any;
    status?: ReqStatus;
    requestedBy?: string | null;
    requestedByEmail?: string | null;
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

function StatusPill({ status }: { status: ReqStatus }) {
    const cfg =
        status === "approved"
        ? { bg: "#E9F9EE", border: "#BBF7D0", text: "#166534", label: "Approved" }
        : status === "rejected"
        ? { bg: "#FEE2E2", border: "#FECACA", text: "#991B1B", label: "Rejected" }
        : { bg: "#EEF2FF", border: "#C7D2FE", text: "#1D4ED8", label: "Pending" };

    return (
        <View
        style={[
            styles.statusPill,
            { backgroundColor: cfg.bg, borderColor: cfg.border },
        ]}
        >
        <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
    );
}

export default function StaffEvents() {
    const router = useRouter();

    const [items, setItems] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [qText, setQText] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");

    useEffect(() => {
        const qRef = query(collection(db, "event_requests"), orderBy("createdAt", "desc"));

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
            console.log("staff events error:", err);
            setItems([]);
            setLoading(false);
        }
        );

        return () => unsub();
    }, []);

    const filtered = useMemo(() => {
        let list = items;

        if (activeTab !== "all") {
        list = list.filter((x) => (x.status ?? "pending") === activeTab);
        }

        const t = qText.trim().toLowerCase();
        if (!t) return list;

        return list.filter((r) => {
        const tags = normalizeTags(r.tags).join(" ");
        const blob =
            `${r.title ?? ""} ${r.location ?? ""} ${r.campus ?? ""} ${r.description ?? ""} ${r.requestedByEmail ?? ""} ${tags}`.toLowerCase();

        return blob.includes(t);
        });
    }, [items, qText, activeTab]);

    const counts = useMemo(() => {
        return {
        all: items.length,
        pending: items.filter((x) => (x.status ?? "pending") === "pending").length,
        approved: items.filter((x) => x.status === "approved").length,
        rejected: items.filter((x) => x.status === "rejected").length,
        };
    }, [items]);

    const updateStatus = async (id: string, status: ReqStatus) => {
    try {
        const reqRef = doc(db, "event_requests", id);
        const reqSnap = await getDoc(reqRef);

        if (!reqSnap.exists()) {
        Alert.alert("Error", "Request not found.");
        return;
        }

        const reqData = reqSnap.data();

        if (status === "approved") {
        const existingQ = query(
            collection(db, "events"),
            where("approvedFromRequestId", "==", id)
        );
        const existingSnap = await getDocs(existingQ);

        if (existingSnap.empty) {
            await addDoc(collection(db, "events"), {
            title: reqData.title ?? "",
            location: reqData.location ?? "",
            campus: reqData.campus ?? "st_james",
            tags: Array.isArray(reqData.tags) ? reqData.tags : [],
            description: reqData.description ?? "",
            date: reqData.date ?? serverTimestamp(),
            endDate: reqData.endDate ?? null,
            imageUrl: reqData.imageUrl ?? "",
            isFree: reqData.isFree ?? true,
            attending: 0,
            createdAt: serverTimestamp(),
            approvedFromRequestId: id,
            approvedAt: serverTimestamp(),
            });
        }
        }

        await updateDoc(reqRef, { status });

        Alert.alert("Success", `Request ${status}.`);
    } catch (error) {
        console.log("update status error:", error);
        Alert.alert("Error", "Could not update request.");
    }
};

    const confirmApprove = (id: string) => {
        Alert.alert("Approve Request", "Approve this event request?", [
        { text: "Cancel", style: "cancel" },
        {
            text: "Approve",
            onPress: () => updateStatus(id, "approved"),
        },
        ]);
    };

    const confirmReject = (id: string) => {
    Alert.alert(
        "Reject Request",
        "Are you sure you want to reject this event request?",
        [
        { text: "Cancel", style: "cancel" },
        {
            text: "Yes, Continue",
            style: "destructive",
            onPress: () => {
            Alert.alert(
                "Final Confirmation",
                "This will mark the event request as rejected. Do you want to proceed?",
                [
                { text: "No", style: "cancel" },
                {
                    text: "Reject Event",
                    style: "destructive",
                    onPress: () => updateStatus(id, "rejected"),
                },
                ]
            );
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
            <Text style={styles.title}>Manage Event Requests</Text>
            <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
            value={qText}
            onChangeText={setQText}
            placeholder="Search requests…"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            />
        </View>

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsScroll}
        >
            <Pressable
            style={[styles.tabChip, activeTab === "all" && styles.tabChipActive]}
            onPress={() => setActiveTab("all")}
            >
            <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                All ({counts.all})
            </Text>
            </Pressable>

            <Pressable
            style={[styles.tabChip, activeTab === "pending" && styles.tabChipActive]}
            onPress={() => setActiveTab("pending")}
            >
            <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
                Pending ({counts.pending})
            </Text>
            </Pressable>

            <Pressable
            style={[styles.tabChip, activeTab === "approved" && styles.tabChipActive]}
            onPress={() => setActiveTab("approved")}
            >
            <Text style={[styles.tabText, activeTab === "approved" && styles.tabTextActive]}>
                Approved ({counts.approved})
            </Text>
            </Pressable>

            <Pressable
            style={[styles.tabChip, activeTab === "rejected" && styles.tabChipActive]}
            onPress={() => setActiveTab("rejected")}
            >
            <Text style={[styles.tabText, activeTab === "rejected" && styles.tabTextActive]}>
                Rejected ({counts.rejected})
            </Text>
            </Pressable>
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll}>
            {loading ? (
            <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.muted}>Loading…</Text>
            </View>
            ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No event requests found</Text>
                <Text style={styles.emptyText}>
                Try changing the filter or search text.
                </Text>
            </View>
            ) : (
            filtered.map((item) => {
                const tags = normalizeTags(item.tags);
                const status = item.status ?? "pending";

                return (
                <View key={item.id} style={styles.card}>
                    <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>
                        {item.title || "Untitled Event"}
                    </Text>
                    <StatusPill status={status} />
                    </View>

                    <Text style={styles.metaLine}>
                    {item.location ? `📍 ${item.location}` : "📍 Location not provided"}
                    {item.campus ? ` • ${item.campus}` : ""}
                    </Text>

                    {!!(item.requestedByEmail || item.requestedBy) && (
                    <Text style={styles.subMeta}>
                        Requested by: {item.requestedByEmail || item.requestedBy}
                    </Text>
                    )}

                    {tags.length > 0 && (
                    <Text style={styles.tagsLine} numberOfLines={2}>
                        Tags: {tags.join(", ")}
                    </Text>
                    )}

                    {!!item.description && (
                    <Text style={styles.desc} numberOfLines={4}>
                        {item.description}
                    </Text>
                    )}

                    {status === "pending" && (
                    <View style={styles.actionsRow}>
                        <Pressable
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => confirmApprove(item.id)}
                        >
                        <Text style={styles.approveBtnText}>Approve</Text>
                        </Pressable>

                        <Pressable
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => confirmReject(item.id)}
                        >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                        </Pressable>
                    </View>
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
    page: {
        flex: 1,
        backgroundColor: "#F6F7FB",
        paddingTop: 48,
    },

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
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

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
    searchInput: {
        flex: 1,
        color: "#111827",
        fontWeight: "600",
    },

    tabsRow: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 0,
        gap: 6,
        alignItems: "center",
    },

    tabChip: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        alignSelf: "flex-start",
    },

    tabText: {
        color: "#374151",
        fontWeight: "800",
        fontSize: 12,
    },

    tabChipActive: {
        backgroundColor: "#111827",
        borderColor: "#111827",
    },

    tabTextActive: {
        color: "#FFFFFF",
    },

    tabsScroll: {
        maxHeight: 44,
    },

    scroll: {
        paddingHorizontal: 16,
        paddingTop: 4,
        gap: 12,
    },

    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },
    muted: {
        color: "#6B7280",
        fontWeight: "700",
    },

    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    emptyTitle: {
        fontWeight: "900",
        color: "#111827",
        fontSize: 16,
    },
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
    statusText: {
        fontWeight: "900",
        fontSize: 12,
    },

    metaLine: {
        color: "#374151",
        fontWeight: "800",
    },
    subMeta: {
        color: "#6B7280",
        fontWeight: "700",
    },
    tagsLine: {
        color: "#6B7280",
        fontWeight: "700",
    },
    desc: {
        color: "#111827",
        fontWeight: "700",
        lineHeight: 18,
    },

    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 6,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    approveBtn: {
        backgroundColor: "#166534",
    },
    rejectBtn: {
        backgroundColor: "#991B1B",
    },
    approveBtnText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
    },
    rejectBtnText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
    },  
});