import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";

import { auth, db } from "../../../firebaseConfig";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";

type EventRequestStatus = "pending" | "approved" | "rejected";

type EventRequest = {
    id: string;
    title?: string;
    description?: string;
    location?: string;
    campus?: string;
    tags?: string[];
    status?: EventRequestStatus;
    requestedBy?: string | null;
    createdAt?: any;
};

export default function MyEventRequestsScreen() {
    const router = useRouter();
    const [items, setItems] = useState<EventRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const user = auth.currentUser;

    useEffect(() => {
        if (!user?.uid) {
        setItems([]);
        setLoading(false);
        return;
        }

        const q = query(
        collection(db, "event_requests"),
        where("requestedBy", "==", user.uid),
        orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(
        q,
        (snap) => {
            const list: EventRequest[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<EventRequest, "id">),
            }));
            setItems(list);
            setLoading(false);
        },
        (error) => {
            console.log("Error loading event requests:", error);
            setLoading(false);
        }
        );

        return () => unsub();
    }, [user?.uid]);

    const pendingCount = useMemo(
        () => items.filter((x) => x.status === "pending").length,
        [items]
    );

    const approvedCount = useMemo(
        () => items.filter((x) => x.status === "approved").length,
        [items]
    );

    const rejectedCount = useMemo(
        () => items.filter((x) => x.status === "rejected").length,
        [items]
    );

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
                console.log(error);
                Alert.alert("Error", "Could not delete the request.");
                }
            },
            },
        ]
        );
    };

    const getStatusStyle = (status?: EventRequestStatus) => {
        switch (status) {
        case "approved":
            return { backgroundColor: "#DCFCE7", color: "#166534" };
        case "rejected":
            return { backgroundColor: "#FEE2E2", color: "#991B1B" };
        default:
            return { backgroundColor: "#FEF3C7", color: "#92400E" };
        }
    };

    if (!user?.uid) {
        return (
        <View style={styles.center}>
            <Text style={styles.emptyTitle}>Please log in first</Text>
            <Text style={styles.emptyText}>
            You need to be logged in to view your event requests.
            </Text>
        </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>My Event Requests</Text>
        <Text style={styles.subheading}>
            Track the status of the event requests you submitted.
        </Text>

        <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{items.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
            </View>

            <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
            </View>

            <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{approvedCount}</Text>
            <Text style={styles.summaryLabel}>Approved</Text>
            </View>

            <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{rejectedCount}</Text>
            <Text style={styles.summaryLabel}>Rejected</Text>
            </View>
        </View>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>

        {loading ? (
            <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading your requests...</Text>
            </View>
        ) : items.length === 0 ? (
            <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No event requests yet</Text>
            <Text style={styles.emptyText}>
                When you submit an event request, it will appear here.
            </Text>
            </View>
        ) : (
            items.map((item) => {
            const statusStyle = getStatusStyle(item.status);

            return (
                <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>
                    {item.title || "Untitled Event"}
                    </Text>

                    <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.backgroundColor },
                    ]}
                    >
                    <Text
                        style={[styles.statusText, { color: statusStyle.color }]}
                    >
                        {(item.status || "pending").toUpperCase()}
                    </Text>
                    </View>
                </View>

                {!!item.description && (
                    <Text style={styles.cardText}>{item.description}</Text>
                )}

                {!!item.location && (
                    <Text style={styles.metaText}>Location: {item.location}</Text>
                )}

                {!!item.campus && (
                    <Text style={styles.metaText}>Campus: {item.campus}</Text>
                )}

                {!!item.tags?.length && (
                    <Text style={styles.metaText}>
                    Tags: {item.tags.join(", ")}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
        backgroundColor: "#F8FAFC",
        flexGrow: 1,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    heading: {
        fontSize: 26,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 6,
    },
    subheading: {
        fontSize: 14,
        color: "#475569",
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        minWidth: 78,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    summaryLabel: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
    },
    backBtn: {
        alignSelf: "flex-start",
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 16,
    },
    backBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
    },
    loadingText: {
        marginTop: 10,
        color: "#475569",
    },
    emptyBox: {
        marginTop: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    cardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 10,
    },
    cardTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
    },
    cardText: {
        fontSize: 14,
        color: "#334155",
        marginBottom: 10,
        lineHeight: 20,
    },
    metaText: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 4,
    },
    deleteBtn: {
        marginTop: 14,
        backgroundColor: "#DC2626",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    deleteBtnText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
});