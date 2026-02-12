import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

type PlaceItem = {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
  desc: string;
  campus: "stjames" | "waterfront" | "casaloma";

  imageUrl?: string;
  address?: string;
  phone?: string;
  hours?: string;
};

const FALLBACK_IMG: Record<PlaceItem["campus"], string> = {
  stjames:
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80",
  waterfront:
    "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1400&q=80",
  casaloma:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
};

function imgFor(place?: Partial<PlaceItem>) {
  const campus = (place?.campus ?? "stjames") as PlaceItem["campus"];
  const uri = (place?.imageUrl ?? "").trim();
  return uri.length ? uri : FALLBACK_IMG[campus];
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

function Tag({ text }: { text: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

export default function PlaceDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const placeId = useMemo(() => String(id ?? ""), [id]);

  const [place, setPlace] = useState<PlaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const favKey = useMemo(() => `fav:${placeId}`, [placeId]);
  const [liked, setLiked] = useState(false);

  // Load favorite from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(favKey);
        setLiked(v === "1");
      } catch {
        setLiked(false);
      }
    })();
  }, [favKey]);

  // Firestore subscription
  useEffect(() => {
    if (!placeId) return;

    setLoading(true);
    setErrMsg("");

    const ref = doc(db, "places", placeId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setPlace(null);
          setLoading(false);
          setErrMsg("Place not found.");
          return;
        }

        const data: any = snap.data();
        const item: PlaceItem = {
          id: snap.id,
          name: String(data.name ?? "Untitled"),
          campus: (data.campus ?? "stjames") as any,
          rating: Number(data.rating ?? 0),
          reviewsCount: Number(data.reviewsCount ?? 0),
          tags: normalizeTags(data.tags),
          desc: String(data.desc ?? ""),
          imageUrl: String(data.imageUrl ?? ""),
          address: String(data.address ?? ""),
          phone: String(data.phone ?? ""),
          hours: String(data.hours ?? ""),
        };

        setPlace(item);
        setLoading(false);
      },
      (err) => {
        console.log("place details error:", err);
        setLoading(false);
        setErrMsg(
          err?.message?.includes("permission")
            ? "Permission denied. Check Firestore rules for /places."
            : "Could not load this place."
        );
      }
    );

    return () => unsub();
  }, [placeId]);

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, fontWeight: "800", color: "#111827" }}>
          Loading…
        </Text>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={[styles.page, { paddingTop: 60, paddingHorizontal: 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.roundBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
        <Text style={{ marginTop: 16, fontWeight: "900", fontSize: 18 }}>
          {errMsg || "Not found"}
        </Text>
      </View>
    );
  }
  const p = place; 


 
  const addressQuery = encodeURIComponent(place.address || place.name);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

  async function onShare() {
    try {
      await Share.share({
        message: `${p.name}\n${p.address || ""}\n${mapsUrl}`,
      });
    } catch (e) {
      console.log("share error", e);
    }
  }

  function onDirections() {
    Linking.openURL(mapsUrl);
  }

  function onViewOnMap() {
    Linking.openURL(mapsUrl);
  }

  
  function onRate() {
    const q = encodeURIComponent(`${p.name} ${p.address || ""}`);
    Linking.openURL(`https://www.google.com/search?q=${q}+reviews`);
  }

  function onCall() {
    const phoneDigits = (p.phone || "").replace(/[^\d+]/g, "");
    if (!phoneDigits) {
      Alert.alert("Phone not available");
      return;
    }
    Linking.openURL(`tel:${phoneDigits}`);
  }

  return (
    <View style={styles.page}>
      {/* Image header */}
      <View style={styles.headerImgWrap}>
        <Image source={{ uri: imgFor(place) }} style={styles.headerImg} />

        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.back()} style={styles.roundBtn}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Pressable
            onPress={async () => {
              const next = !liked;
              setLiked(next);
              try {
                await AsyncStorage.setItem(favKey, next ? "1" : "0");
              } catch {}
            }}
            style={styles.roundBtn}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={20}
              color={liked ? "#EF4444" : "#111827"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{place.name}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FBBF24" />
          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>({place.reviewsCount} reviews)</Text>
        </View>

        <View style={styles.tagsRow}>
          {place.tags.slice(0, 6).map((t) => (
            <Tag key={t} text={t} />
          ))}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{place.address || "—"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Pressable onPress={onCall}>
                <Text style={styles.infoLink}>{place.phone || "—"}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Hours</Text>
              <Text style={styles.infoValue}>{place.hours || "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.about}>{place.desc || "—"}</Text>

        {/* Buttons */}
        <View style={styles.primaryRow}>
          <Pressable style={styles.primaryBtn} onPress={onDirections}>
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Directions</Text>
          </Pressable>

          <Pressable style={styles.iconOnlyBtn} onPress={onShare}>
            <Ionicons name="share-outline" size={18} color="#111827" />
          </Pressable>
        </View>

        <Pressable style={styles.secondaryBtn} onPress={onRate}>
          <Text style={styles.secondaryBtnText}>Rate This Place</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={onViewOnMap}>
          <Ionicons name="location-outline" size={18} color="#111827" />
          <Text style={styles.secondaryBtnText}>View on Map</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB" },

  headerImgWrap: { height: 260, backgroundColor: "#E5E7EB" },
  headerImg: { width: "100%", height: "100%", backgroundColor: "#E5E7EB" },

  headerTopRow: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },

  title: { fontSize: 22, fontWeight: "900", color: "#111827" },

  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  ratingText: { fontWeight: "900", color: "#111827" },
  reviewsText: { fontWeight: "700", color: "#6B7280" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { fontWeight: "800", color: "#1D4ED8", fontSize: 12 },

  infoCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoLabel: { fontWeight: "800", color: "#6B7280", fontSize: 12 },
  infoValue: { fontWeight: "800", color: "#111827", marginTop: 2, lineHeight: 18 },
  infoLink: { fontWeight: "900", color: "#2563EB", marginTop: 2 },

  sectionTitle: { marginTop: 18, fontSize: 18, fontWeight: "900", color: "#111827" },
  about: { marginTop: 8, color: "#6B7280", fontWeight: "700", lineHeight: 20 },

  primaryRow: { flexDirection: "row", gap: 10, marginTop: 18, alignItems: "center" },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#0B1020",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  iconOnlyBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryBtnText: { fontWeight: "900", color: "#111827" },
});
