import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

type CampusKey = "all" | "stjames" | "waterfront" | "casaloma";

type PlaceItem = {
  id: string;
  name: string;
  campus: string; 
  rating: number;
  reviewsCount: number;
  tags: string[];
  desc: string;

  imageUrl?: string;
  address?: string;
  phone?: string;
  hours?: string;
};

const CAMPUS_LABEL: Record<CampusKey, string> = {
  all: "All Campuses",
  stjames: "St. James",
  waterfront: "Waterfront",
  casaloma: "Casa Loma",
};


const FALLBACK_IMG = {
  stjames:
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80",
  waterfront:
    "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1400&q=80",
  casaloma:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
} as const;


function normalizeCampus(raw: any): CampusKey {
  const s = String(raw ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, ""); // remove dots, etc.

  if (s.includes("waterfront")) return "waterfront";
  if (s.includes("casaloma") || (s.includes("casa") && s.includes("loma")))
    return "casaloma";
  if (s.includes("stjames") || (s.includes("st") && s.includes("james")))
    return "stjames";

  return "all";
}

function imgFor(place?: Partial<PlaceItem>) {
  const uri = (place?.imageUrl ?? "").trim();
  if (uri.length) return uri;

  const c = normalizeCampus(place?.campus);
  if (c === "waterfront") return FALLBACK_IMG.waterfront;
  if (c === "casaloma") return FALLBACK_IMG.casaloma;
  return FALLBACK_IMG.stjames;
}


function normalizeTags(raw: any): string[] {
  const splitComma = (s: string) =>
    s
      .replace(/^\[|\]$/g, "")
      .replace(/"/g, "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  if (Array.isArray(raw)) {
    const arr = raw.map(String).filter(Boolean);

    if (arr.length === 1 && arr[0].includes(",")) return splitComma(arr[0]);

    const flattened: string[] = [];
    for (const item of arr) {
      if (item.includes(",")) flattened.push(...splitComma(item));
      else flattened.push(item.trim());
    }
    return flattened.filter(Boolean);
  }

  if (typeof raw === "string") {
    const s = raw.trim();

    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return normalizeTags(parsed);
      } catch {}
    }

    if (s.includes(",")) return splitComma(s);
    return s ? [s] : [];
  }

  return [];
}

function Pill({
  text,
  bg = "#EEF2FF",
  color = "#1D4ED8",
}: {
  text: string;
  bg?: string;
  color?: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

export default function PlacesIndex() {
  const router = useRouter();

  const [qText, setQText] = useState("");
  const [campus, setCampus] = useState<CampusKey>("all");
  const [campusModal, setCampusModal] = useState(false);

  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string>("");


  useEffect(() => {
    setLoading(true);
    setErrMsg("");

    const base = collection(db, "places");
    const qRef = query(base);

    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const rows: PlaceItem[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            name: String(data.name ?? "Untitled"),
            campus: String(data.campus ?? ""),
            rating: Number(data.rating ?? 0),
            reviewsCount: Number(data.reviewsCount ?? 0),
            tags: normalizeTags(data.tags),
            desc: String(data.desc ?? ""),
            imageUrl: String(data.imageUrl ?? ""),
            address: String(data.address ?? ""),
            phone: String(data.phone ?? ""),
            hours: String(data.hours ?? ""),
          };
        });

        
        rows.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        setPlaces(rows);
        setLoading(false);
      },
      (err) => {
        console.log("places onSnapshot error:", err);
        setPlaces([]);
        setLoading(false);
        setErrMsg(
          err?.message?.includes("permission")
            ? "Permission denied. Check Firestore rules for /places."
            : "Could not load places."
        );
      }
    );

    return () => unsub();
  }, []);

  const campusFiltered = useMemo(() => {
    if (campus === "all") return places;
    return places.filter((p) => normalizeCampus(p.campus) === campus);
  }, [places, campus]);

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return campusFiltered;

    return campusFiltered.filter((p) => {
      return (
        p.name.toLowerCase().includes(t) ||
        p.desc.toLowerCase().includes(t) ||
        (p.tags ?? []).join(" ").toLowerCase().includes(t)
      );
    });
  }, [campusFiltered, qText]);

  const featured = filtered[0];

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.topBar}>
  <View style={styles.leftHeader}>
    <Pressable onPress={() => router.back()} style={styles.iconBtn}>
      <Ionicons name="arrow-back" size={22} color="#111827" />
    </Pressable>

    <Text style={styles.title}>places</Text>
  </View>

  <Pressable
    onPress={() => router.push("/(app)/places/my-place-requests")}
    style={styles.requestsBtn}
  >
    <Text style={styles.requestsText}>My place requests</Text>
  </Pressable>
</View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={qText}
          onChangeText={setQText}
          placeholder="Search places..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />

        {/* filter icon opens campus modal */}
        <Pressable style={styles.slidersBtn} onPress={() => setCampusModal(true)}>
          <Ionicons name="options-outline" size={18} color="#111827" />
        </Pressable>
      </View>

      {/* Campus Dropdown */}
      <Pressable style={styles.dropdown} onPress={() => setCampusModal(true)}>
        <Text style={styles.dropdownText}>{CAMPUS_LABEL[campus]}</Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Featured */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading places…</Text>
          </View>
        ) : errMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{errMsg}</Text>
          </View>
        ) : featured ? (
          <Pressable
            style={styles.featureCard}
            onPress={() =>
              router.push({
                pathname: "/places/[id]",
                params: { id: featured.id },
              })
            }
          >
            <Image source={{ uri: imgFor(featured) }} style={styles.featureImg} />
            <View style={styles.featureShade} />
            <View style={styles.featureInner}>
              <Pill text="Featured" bg="rgba(59,130,246,0.95)" color="#fff" />
              <Text style={styles.featureTitle}>{featured.name}</Text>

              <View style={styles.featureMeta}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.featureMetaText}>
                  {Number(featured.rating ?? 0).toFixed(1)}
                </Text>
                <Text style={styles.featureDot}>•</Text>
                <Text style={styles.featureMetaText} numberOfLines={1}>
                  {(featured.tags ?? []).slice(0, 3).join(", ")}
                </Text>
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>No places yet</Text>
            <Text style={styles.errorText}>
              Add documents to Firestore collection: places
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>All Places</Text>

        {filtered.map((p) => (
          <Pressable
            key={p.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/places/[id]",
                params: { id: p.id },
              })
            }
          >
            <Image source={{ uri: imgFor(p) }} style={styles.thumb} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.ratingText}>
                  {Number(p.rating ?? 0).toFixed(1)}
                </Text>
              </View>

              <View style={styles.tagsRow}>
                {(p.tags ?? []).slice(0, 3).map((t) => (
                  <Pill key={t} text={t} />
                ))}
              </View>

              <Text style={styles.desc} numberOfLines={2}>
                {p.desc}
              </Text>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating + => open add form */}
      <Pressable style={styles.fab} onPress={() => router.push("/places/new")}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {/* Campus modal */}
      <Modal
        visible={campusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCampusModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCampusModal(false)}>
          <View style={styles.modalSheet}>
            {(Object.keys(CAMPUS_LABEL) as CampusKey[]).map((key) => (
              <Pressable
                key={key}
                style={styles.modalRow}
                onPress={() => {
                  setCampus(key);
                  setCampusModal(false);
                }}
              >
                <Text style={styles.modalText}>{CAMPUS_LABEL[key]}</Text>
                {campus === key && (
                  <Ionicons name="checkmark" size={18} color="#111827" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
    justifyContent: "space-between"
  },
  leftHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
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
  slidersBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdown: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownText: { fontWeight: "800", color: "#111827" },

  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },
  requestsBtn: {
  paddingHorizontal: 8,
  paddingVertical: 6,
},

requestsText: {
  fontWeight: "800",
  color: "#2563EB",
},

  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadingText: { fontWeight: "800", color: "#111827" },

  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  errorTitle: { fontWeight: "900", color: "#111827", fontSize: 16 },
  errorText: { marginTop: 6, fontWeight: "700", color: "#6B7280", lineHeight: 18 },

  featureCard: { borderRadius: 18, overflow: "hidden", backgroundColor: "#E5E7EB" },
  featureImg: { width: "100%", height: 170, backgroundColor: "#E5E7EB" },
  featureShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  featureInner: { position: "absolute", left: 14, right: 14, bottom: 12, gap: 6 },
  featureTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  featureMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  featureMetaText: { color: "#FFFFFF", fontWeight: "800", flexShrink: 1 },
  featureDot: { color: "#FFFFFF", fontWeight: "900" },

  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827", marginTop: 8 },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
  },
  thumb: { width: 74, height: 74, borderRadius: 16, backgroundColor: "#E5E7EB" },
  name: { fontSize: 16, fontWeight: "900", color: "#111827" },

  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  ratingText: { fontWeight: "900", color: "#111827" },

  tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  desc: { marginTop: 8, color: "#6B7280", fontWeight: "700", lineHeight: 18 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontWeight: "800", fontSize: 12 },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalText: { fontWeight: "900", color: "#111827", fontSize: 15 },
});
