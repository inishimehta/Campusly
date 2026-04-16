import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { auth, db } from "../../../firebaseConfig";

type EventDoc = {
  title: string;
  tags?: any; // ✅ string/array/bad array
  attending?: number;
  imageUrl?: string;

  date: Timestamp;
  endDate?: Timestamp;

  location: string;
  locationAddress?: string;

  priceLabel?: string;
  organizer?: string;
  description?: string;
  isFree?: boolean;
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTimeRange(start?: Timestamp, end?: Timestamp) {
  if (!start) return "";
  const s = start.toDate().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!end) return s;
  const e = end.toDate().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${s} - ${e}`;
}

// ✅ same tag normalizer as index
function normalizeTags(raw: any): string[] {
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        const parsed = normalizeTags(item);
        if (parsed.length > 1) out.push(...parsed);
        else out.push(item);
      } else if (item != null) {
        out.push(String(item));
      }
    }
    return out.map((x) => String(x).trim()).filter(Boolean);
  }

  if (typeof raw === "string") {
    let s = raw.trim();

    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).trim();
    }

    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}

      const inner = s.slice(1, -1);
      return inner
        .split(",")
        .map((x) =>
          x
            .replace(/^\s*['"]/, "")
            .replace(/['"]\s*$/, "")
            .trim()
        )
        .filter(Boolean);
    }

    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return s ? [s] : [];
  }

  return [];
}

export default function EventDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");

  // Fetch user role
  useEffect(() => {
    const loadRole = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setUserRole(snap.data()?.role?.toLowerCase() || "student");
        }
      } catch (err) {}
    };
    loadRole();
  }, []);

  // Fetch Event Data
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "events", String(id));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setEvent(snap.data() as EventDoc);
        else setEvent(null);
        setLoading(false);
      },
      (err) => {
        console.log("event details error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [id]);

  const onShare = async () => {
    try {
      if (!event) return;
      await Share.share({
        message: `${event.title}\n${formatDate(event.date)} • ${formatTimeRange(
          event.date,
          event.endDate
        )}\n${event.location}`,
      });
    } catch {
      Alert.alert("Could not share");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: "800" }}>Event not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 10 }}>
          <Text style={{ color: "#2563EB", fontWeight: "800" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const heroUri = event.imageUrl || `https://picsum.photos/seed/${String(id)}/900/600`;
  const tags = normalizeTags(event.tags);

  return (
    <View style={styles.page}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: heroUri }} style={styles.hero} />
        <View style={styles.heroTopBtns}>
          <Pressable onPress={() => router.back()} style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Show Edit Button only for Staff and Admin */}
            {(userRole === "admin" || userRole === "staff") && (
              <Pressable onPress={() => router.push(`/events/${id}/edit` as any)} style={styles.circleBtn}>
                <Ionicons name="pencil" size={20} color="#111827" />
              </Pressable>
            )}
            <Pressable onPress={onShare} style={styles.circleBtn}>
              <Ionicons name="share-outline" size={20} color="#111827" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        {/* ✅ tags fixed */}
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>
                {formatDate(event.date)}
                {"\n"}
                {formatTimeRange(event.date, event.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
              {!!event.locationAddress && <Text style={styles.infoSub}>{event.locationAddress}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>{event.isFree ? "Free" : event.priceLabel || "Paid"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.infoLabel}>Attendees</Text>
              <Text style={styles.infoValue}>{event.attending ?? 0} people attending</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.desc}>
          {event.description || "No description at this moment about this event."}
        </Text>

        <View style={{ height: 14 }} />
        <Text style={styles.organizedLabel}>Organized by</Text>
        <Text style={styles.organizedValue}>{event.organizer || "Student Association"}</Text>

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.rsvpBtn} onPress={() => router.push(`/events/${String(id)}/rsvp` as any)}>
          <Text style={styles.rsvpText}>RSVP to Event</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB" },

  heroWrap: { height: 260, backgroundColor: "#E5E7EB" },
  hero: { width: "100%", height: "100%" },
  heroTopBtns: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "900", color: "#111827", marginBottom: 10 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: "#1D4ED8", fontWeight: "800" },

  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 12 },
  infoRow: { flexDirection: "row", paddingVertical: 10, alignItems: "flex-start" },
  infoLabel: { color: "#6B7280", fontWeight: "800", marginBottom: 2 },
  infoValue: { color: "#111827", fontWeight: "800" },
  infoSub: { color: "#6B7280", fontWeight: "600", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#E5E7EB" },

  sectionTitle: { fontSize: 18, fontWeight: "900", marginTop: 18, marginBottom: 8, color: "#111827" },
  desc: { color: "#374151", fontWeight: "600", lineHeight: 20 },

  organizedLabel: { color: "#6B7280", fontWeight: "800" },
  organizedValue: { color: "#111827", fontWeight: "900", marginTop: 4 },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: "rgba(246,247,251,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  rsvpBtn: { backgroundColor: "#0B0F1A", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  rsvpText: { color: "#FFFFFF", fontWeight: "900" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});