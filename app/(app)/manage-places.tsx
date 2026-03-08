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
import { useRouter, type Href } from "expo-router";

import { auth, db } from "../../firebaseConfig";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

type PlaceRequestStatus = "pending" | "approved" | "rejected";

type PlaceRequest = {
    id: string;
    name: string;
    rating: number;
    tags: string[];
    desc: string;
    status: "pending" | "approved" | "rejected";
    uid?: string;
    email?: string;
    createdAt?: any;
};

type Place = {
    id: string;
    name: string;
    rating: number;
    tags: string[];
    desc: string;
    createdAt?: any;
};

function Pill({
    active,
    label,
    onPress,
    }: {
    active: boolean;
    label: string;
    onPress: () => void;
    }) {
    return (
        <Pressable
        onPress={onPress}
        style={[styles.pill, active && styles.pillActive]}
        >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>
            {label}
        </Text>
        </Pressable>
    );
}

function Row({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <Text style={styles.meta}>
        <Text style={styles.metaLabel}>{label}: </Text>
        {value}
        </Text>
    );
}

export default function ManagePlaces() {
    const router = useRouter();

    const [tab, setTab] = useState<"requests" | "places">("requests");
    const [search, setSearch] = useState("");

    const [loadingReq, setLoadingReq] = useState(true);
    const [loadingPlaces, setLoadingPlaces] = useState(true);

    const [requests, setRequests] = useState<PlaceRequest[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);

    // Live: pending requests
    useEffect(() => {
        const qReq = query(
        collection(db, "placeRequests"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(
        qReq,
        (snap) => {
            setRequests(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
            );
            setLoadingReq(false);
        },
        (err) => {
            console.log("placeRequests snapshot error:", err);
            setLoadingReq(false);
        }
        );

        return () => unsub();
    }, []);

    // Live: places list
    useEffect(() => {
        const qPlaces = query(collection(db, "places"), orderBy("createdAt", "desc"));

        const unsub = onSnapshot(
        qPlaces,
        (snap) => {
            setPlaces(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            setLoadingPlaces(false);
        },
        (err) => {
            console.log("places snapshot error:", err);
            setLoadingPlaces(false);
        }
        );

        return () => unsub();
    }, []);

    const filteredRequests = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return requests;
        return requests.filter((r) => {
        const blob = `${r.name ?? ""} ${r.category ?? ""} ${r.campus ?? ""} ${r.address ?? ""}`
            .toLowerCase();
        return blob.includes(s);
        });
    }, [requests, search]);

    const filteredPlaces = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return places;
        return places.filter((p) => {
        const blob = `${p.name ?? ""} ${p.category ?? ""} ${p.campus ?? ""} ${p.address ?? ""}`
            .toLowerCase();
        return blob.includes(s);
        });
    }, [places, search]);

    const approveRequest = async (r: PlaceRequest) => {
        const admin = auth.currentUser;
        if (!admin) return;

        Alert.alert(
        "Approve request?",
        `Add "${r.name}" to Places?`,
        [
            { text: "Cancel", style: "cancel" },
            {
            text: "Approve",
            style: "default",
            onPress: async () => {
                try {
                // 1) Create a place doc
                const placeRef = await addDoc(collection(db, "places"), {
                    name: r.name,
                    category: r.category ?? "",
                    campus: r.campus ?? "",
                    address: r.address ?? "",
                    description: r.description ?? "",
                    createdAt: serverTimestamp(),
                    createdBy: r.uid ?? null,
                    approvedFromRequestId: r.id,
                    approvedBy: admin.uid,
                    approvedAt: serverTimestamp(),
                });

                // 2) Mark request approved
                await updateDoc(doc(db, "placeRequests", r.id), {
                    status: "approved",
                    reviewedBy: admin.uid,
                    reviewedAt: serverTimestamp(),
                    placeId: placeRef.id,
                });

                Alert.alert("Approved", "Place added to the list.");
                } catch (e: any) {
                console.log("approveRequest error:", e);
                Alert.alert("Approve failed", e?.message ?? "Unknown error");
                }
            },
            },
        ]
        );
    };

    const rejectRequest = async (r: PlaceRequest) => {
        const admin = auth.currentUser;
        if (!admin) return;

        Alert.alert(
        "Reject request?",
        `Reject "${r.name}"?`,
        [
            { text: "Cancel", style: "cancel" },
            {
            text: "Reject",
            style: "destructive",
            onPress: async () => {
                try {
                await updateDoc(doc(db, "placeRequests", r.id), {
                    status: "rejected",
                    reviewedBy: admin.uid,
                    reviewedAt: serverTimestamp(),
                });
                Alert.alert("Rejected", "Request rejected.");
                } catch (e: any) {
                console.log("rejectRequest error:", e);
                Alert.alert("Reject failed", e?.message ?? "Unknown error");
                }
            },
            },
        ]
        );
    };

    const deletePlace = async (p: Place) => {
        Alert.alert(
        "Delete place?",
        `Delete "${p.name}" from Places?`,
        [
            { text: "Cancel", style: "cancel" },
            {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
                try {
                await deleteDoc(doc(db, "places", p.id));
                Alert.alert("Deleted", "Place removed.");
                } catch (e: any) {
                console.log("deletePlace error:", e);
                Alert.alert("Delete failed", e?.message ?? "Unknown error");
                }
            },
            },
        ]
        );
    };

    return (
        <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.headerRow}>
            <View>
            <Text style={styles.h1}>Manage Places</Text>
            <Text style={styles.sub}>Approve requests and manage the places list</Text>
            </View>

            <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Back</Text>
            </Pressable>
        </View>

        <View style={styles.tabs}>
            <Pill
            label={`Requests (${requests.length})`}
            active={tab === "requests"}
            onPress={() => setTab("requests")}
            />
            <Pill
            label={`Places (${places.length})`}
            active={tab === "places"}
            onPress={() => setTab("places")}
            />
        </View>

        <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={tab === "requests" ? "Search requests…" : "Search places…"}
            placeholderTextColor="#9CA3AF"
            style={styles.search}
            autoCapitalize="none"
        />

        {tab === "requests" && (
            <>
            {loadingReq && (
                <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.muted}>Loading requests…</Text>
                </View>
            )}

            {!loadingReq && filteredRequests.length === 0 && (
                <Text style={styles.muted}>No pending requests.</Text>
            )}

            {filteredRequests.map((r) => (
                <View key={r.id} style={styles.card}>
                <Text style={styles.cardTitle}>{r.name}</Text>

                <Row label="Category" value={r.category} />
                <Row label="Campus" value={r.campus} />
                <Row label="Address" value={r.address} />

                {!!r.description && (
                    <Text style={styles.description}>{r.description}</Text>
                )}

                <View style={styles.actionsRow}>
                    <Pressable
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => approveRequest(r)}
                    >
                    <Text style={styles.btnText}>Approve</Text>
                    </Pressable>

                    <Pressable
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => rejectRequest(r)}
                    >
                    <Text style={styles.btnText}>Reject</Text>
                    </Pressable>
                </View>
                </View>
            ))}
            </>
        )}

        {tab === "places" && (
            <>
            {loadingPlaces && (
                <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.muted}>Loading places…</Text>
                </View>
            )}

            {!loadingPlaces && filteredPlaces.length === 0 && (
                <Text style={styles.muted}>No places found.</Text>
            )}

            {filteredPlaces.map((p) => (
                <View key={p.id} style={styles.card}>
                <Text style={styles.cardTitle}>{p.name}</Text>

                <Row label="Category" value={p.category} />
                <Row label="Campus" value={p.campus} />
                <Row label="Address" value={p.address} />

                {!!p.description && (
                    <Text style={styles.description}>{p.description}</Text>
                )}

                <View style={styles.actionsRow}>
                    {/* Optional: you can add an Edit screen later */}
                    <Pressable
                    style={[styles.btn, styles.secondaryBtn]}
                    onPress={() => Alert.alert("Edit", "Add edit screen later.")}
                    >
                    <Text style={styles.secondaryBtnText}>Edit</Text>
                    </Pressable>

                    <Pressable
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => deletePlace(p)}
                    >
                    <Text style={styles.btnText}>Delete</Text>
                    </Pressable>
                </View>
                </View>
            ))}
            </>
        )}

        <Text style={styles.note}>
            Note: If Firestore shows “query requires an index”, click the link in the error and create it.
        </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#F6F7FB" },
    container: { padding: 18, paddingTop: 56, paddingBottom: 28, gap: 12 },

    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    h1: { fontSize: 22, fontWeight: "900", color: "#111827" },
    sub: { marginTop: 6, color: "#6B7280", fontWeight: "700" },
    link: { color: "#2563EB", fontWeight: "900", paddingTop: 4 },

    tabs: { flexDirection: "row", gap: 10, marginTop: 6 },
    pill: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
    pillText: { fontWeight: "900", color: "#111827" },
    pillTextActive: { color: "#FFFFFF" },

    search: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
    muted: { color: "#6B7280", fontWeight: "700" },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 6,
    },
    cardTitle: { fontWeight: "900", color: "#111827", fontSize: 16 },

    meta: { color: "#374151", fontWeight: "700" },
    metaLabel: { color: "#6B7280", fontWeight: "800" },
    description: { marginTop: 4, color: "#111827", fontWeight: "600" },

    actionsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },

    approveBtn: { backgroundColor: "#111827" },
    rejectBtn: { backgroundColor: "#EF4444" },
    btnText: { color: "#FFFFFF", fontWeight: "900" },

    secondaryBtn: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    secondaryBtnText: { color: "#111827", fontWeight: "900" },

    note: { marginTop: 10, textAlign: "center", color: "#6B7280", fontWeight: "600" },
});
