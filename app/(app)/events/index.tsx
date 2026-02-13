import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

type ChipKey = "All" | "Today" | "This Week" | "Free Events";
type CampusKey = "all" | "st_james" | "waterfront" | "casaloma";

type EventItem = {
  id: string;
  title?: string;
  date?: Timestamp;
  endDate?: Timestamp;
  location?: string;
  attending?: number;

  tags?: any; // can be array or weird string formats
  campus?: CampusKey | string;
  isFree?: boolean;
  imageUrl?: string;
};

const CAMPUS_LABEL: Record<CampusKey, string> = {
  all: "All Campuses",
  st_james: "St James",
  waterfront: "Waterfront",
  casaloma: "Casa Loma",
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function withinNext7Days(d: Date) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}

function fmtDate(ts?: Timestamp) {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fmtTimeRange(start?: Timestamp, end?: Timestamp) {
  if (!start) return "";
  const s = start.toDate().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!end) return s;
  const e = end.toDate().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${s} - ${e}`;
}

/**
 * ✅ Handles your Firestore case:
 * tags: (array) [ "['Clubs','Info','Free']" ]
 * plus:
 * - real arrays ["Clubs","Free"]
 * - JSON strings '["Clubs","Free"]'
 * - single-quote strings "['Clubs','Free']"
 * - comma strings "Clubs, Free"
 */
function normalizeTags(raw: any): string[] {
  // array may be normal OR ["['a','b']"]
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        const parsed = normalizeTags(item);
        // if parsed produced multiple tags, flatten them
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

    // unwrap quotes
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).trim();
    }

    // array-like string
    if (s.startsWith("[") && s.endsWith("]")) {
      // try JSON
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}

      // fallback split for ['a','b']
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

    // comma string
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);

    return s ? [s] : [];
  }

  return [];
}

export default function Events() {
  const router = useRouter();

  const [qText, setQText] = useState("");
  const [chip, setChip] = useState<ChipKey>("All");
  const [campus, setCampus] = useState<CampusKey>("all");
  const [campusModal, setCampusModal] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const qRef = query(collection(db, "events"), orderBy("date", "asc"));

    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            ...data,
            tags: normalizeTags(data.tags), // ✅ normalize ONCE here
          } as EventItem;
        });
        setEvents(list);
      },
      (err) => console.log("events snapshot error:", err)
    );

    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const text = qText.trim().toLowerCase();
    const now = new Date();

    return events.filter((e) => {
      const title = (e.title || "").toLowerCase();
      const location = (e.location || "").toLowerCase();

      const tagsArr: string[] = Array.isArray(e.tags) ? e.tags : normalizeTags(e.tags);
      const tagsText = tagsArr.join(" ").toLowerCase();

      if (campus !== "all" && e.campus !== campus) return false;

      const matchesText =
        !text || title.includes(text) || location.includes(text) || tagsText.includes(text);

      const d = e.date?.toDate?.();
      let matchesChip = true;

      if (chip === "Free Events") matchesChip = !!e.isFree || tagsArr.includes("Free");
      if (chip === "Today") matchesChip = !!d && isSameDay(d, now);
      if (chip === "This Week") matchesChip = !!d && withinNext7Days(d);

      return matchesText && matchesChip;
    });
  }, [events, qText, chip, campus]);

  const campusTagLabel = campus === "all" ? "" : CAMPUS_LABEL[campus];

  return (
    <View style={styles.page}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Events</Text>
        <View style={styles.rightSpacer} />
      </View>

      {/* ONE ScrollView */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Search + campus filter icon */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={qText}
              onChangeText={setQText}
              placeholder="Search events..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>

          {/* ✅ Campus filter button */}
          <Pressable style={styles.filterBtn} onPress={() => setCampusModal(true)}>
            <Ionicons name="options-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        {/* Selected campus tag */}
        {campusTagLabel ? (
          <View style={styles.selectedRow}>
            <View style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>{campusTagLabel}</Text>
              <Pressable onPress={() => setCampus("all")} style={{ marginLeft: 8 }}>
                <Ionicons name="close" size={16} color="#1D4ED8" />
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {(["All", "Today", "This Week", "Free Events"] as ChipKey[]).map((c) => {
            const active = c === chip;
            return (
              <Pressable
                key={c}
                onPress={() => setChip(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Cards */}
        {filtered.map((e) => {
          const tagsArr = (Array.isArray(e.tags) ? e.tags : normalizeTags(e.tags)).slice(0, 6);

          return (
            <Pressable
              key={e.id}
              style={styles.card}
              onPress={() => router.push(`/events/${e.id}` as Href)}
            >
              <Image
                source={{ uri: e.imageUrl || `https://picsum.photos/seed/${e.id}/800/500` }}
                style={styles.hero}
              />

              <Text style={styles.cardTitle}>{e.title || "Untitled Event"}</Text>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{fmtDate(e.date)}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{fmtTimeRange(e.date, e.endDate)}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{e.location || "Location not set"}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{e.attending ?? 0} attending</Text>
              </View>

              {tagsArr.length > 0 && (
                <View style={styles.tagsRow}>
                  {tagsArr.map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating + button */}
      <Pressable style={styles.fab} onPress={() => router.push("/events/request" as any)}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {/* Campus modal */}
      <Modal
        visible={campusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCampusModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCampusModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Filter by campus</Text>

            {(Object.keys(CAMPUS_LABEL) as CampusKey[]).map((key) => {
              const active = key === campus;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    setCampus(key);
                    setCampusModal(false);
                  }}
                  style={[styles.modalOption, active && styles.modalOptionActive]}
                >
                  <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                    {CAMPUS_LABEL[key]}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={18} color="#2F80FF" /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },

  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  rightSpacer: { flex: 1 },

  content: { paddingBottom: 20 },

  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 10 },
  searchWrap: {
    flex: 1,
    backgroundColor: "#EFEFF2",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, color: "#111827", fontWeight: "700", marginLeft: 8 },

  filterBtn: {
    marginLeft: 10,
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedRow: { paddingHorizontal: 16, paddingBottom: 6 },
  selectedChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  selectedChipText: { color: "#1D4ED8", fontWeight: "900" },

  chipsScroll: { paddingLeft: 16, paddingRight: 6, marginBottom: 6 },
  chipsRow: { flexDirection: "row", alignItems: "center", paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },
  chipActive: { backgroundColor: "#2F80FF" },
  chipText: { fontWeight: "900", color: "#111827" },
  chipTextActive: { color: "#FFFFFF" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  hero: { width: "100%", height: 180, borderRadius: 16, marginBottom: 10, backgroundColor: "#E5E7EB" },

  cardTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, flexWrap: "wrap" },
  metaText: { color: "#374151", fontWeight: "700", marginLeft: 8 },
  metaDot: { color: "#9CA3AF", fontWeight: "900", marginHorizontal: 8 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: "#1D4ED8", fontWeight: "900" },

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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14 },
  modalTitle: { fontWeight: "900", fontSize: 16, color: "#111827", marginBottom: 8 },

  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "#F6F7FB",
  },
  modalOptionActive: { backgroundColor: "#EEF2FF" },
  modalOptionText: { fontWeight: "800", color: "#111827" },
  modalOptionTextActive: { color: "#1D4ED8" },
});
