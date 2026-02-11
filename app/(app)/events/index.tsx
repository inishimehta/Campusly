import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type ChipKey = "All" | "Today" | "This Week" | "Free Events";
type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attending: number;
  tags: string[];
};

const EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Campus Music Festival",
    date: "Nov 25, 2025",
    time: "6:00 PM - 10:00 PM",
    location: "Student Centre Plaza",
    attending: 142,
    tags: ["Clubs", "Free"],
  },
  {
    id: "e2",
    title: "Career Development Workshop",
    date: "Nov 24, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Room 402",
    attending: 45,
    tags: ["Academic", "Free"],
  },
];

export default function Events() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<ChipKey>("All");

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return EVENTS.filter((e) => {
      const matchesText =
        !text ||
        e.title.toLowerCase().includes(text) ||
        e.location.toLowerCase().includes(text) ||
        e.tags.join(" ").toLowerCase().includes(text);

      const matchesChip =
        chip === "All" || (chip === "Free Events" ? e.tags.includes("Free") : true);

      return matchesText && matchesChip;
    });
  }, [q, chip]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Events</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search events..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
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

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map((e) => (
          <View key={e.id} style={styles.card}>
            <Image
              source={{ uri: "https://picsum.photos/seed/" + e.id + "/800/500" }}
              style={styles.hero}
            />

            <Text style={styles.cardTitle}>{e.title}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{e.date}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{e.time}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{e.location}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{e.attending} attending</Text>
            </View>

            <View style={styles.tagsRow}>
              {e.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 18 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  rightSpacer: { flex: 1 },

  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#EFEFF2",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#111827", fontWeight: "600" },

  chipsRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  chipActive: { backgroundColor: "#2F80FF" },
  chipText: { fontWeight: "800", color: "#111827" },
  chipTextActive: { color: "#FFFFFF" },

  list: { paddingHorizontal: 16, paddingTop: 6, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 12 },
  hero: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "#E5E7EB",
 
  },
  chipActive: { backgroundColor: "#2F80FF" },
  chipText: { fontWeight: "800", color: "#111827" },
  chipTextActive: { color: "#FFFFFF" },

  list: { paddingHorizontal: 16, paddingTop: 6, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 12 },
  hero: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  metaText: { color: "#374151", fontWeight: "600" },
  metaDot: { color: "#9CA3AF", fontWeight: "900" },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  tag: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { color: "#1D4ED8", fontWeight: "800" },
});
