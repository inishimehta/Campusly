import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type ChipKey = "All" | "By Course" | "Online" | "In-Person" | "Open Spots";

type GroupItem = {
  id: string;
  title: string;
  course: string;
  desc: string;
  location: string;
  mode: "Online" | "In-Person";
  time: string;
  people: string;
  tags: string[];
};

const GROUPS: GroupItem[] = [
  {
    id: "g1",
    title: "COMP 3059 Final Prep",
    course: "COMP 3059",
    desc: "Last minute prep for the final exam. Covering all major topics.",
    location: "Library, Room 301",
    mode: "In-Person",
    time: "Today, 3:00 PM",
    people: "4/6",
    tags: ["Computer Science", "Open Spots"],
  },
  {
    id: "g2",
    title: "Marketing 101 Study Session",
    course: "MKTG 101",
    desc: "Weekly review of lecture materials and assignment help.",
    location: "Zoom",
    mode: "Online",
    time: "Tomorrow, 5:00 PM",
    people: "5/8",
    tags: ["Business", "Online"],
  },
  {
    id: "g3",
    title: "Calculus Homework Help",
    course: "MATH 202",
    desc: "Working through problem sets together.",
    location: "Student Centre",
    mode: "In-Person",
    time: "Mon, 2:00 PM",
    people: "3/5",
    tags: ["Math", "In-Person"],
  },
];

export default function StudyGroups() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<ChipKey>("All");

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return GROUPS.filter((g) => {
      const matchesText =
        !text ||
        g.title.toLowerCase().includes(text) ||
        g.course.toLowerCase().includes(text) ||
        g.location.toLowerCase().includes(text) ||
        g.tags.join(" ").toLowerCase().includes(text);

      const matchesChip =
        chip === "All" ||
        chip === "By Course" ||
        (chip === "Online" && g.mode === "Online") ||
        (chip === "In-Person" && g.mode === "In-Person") ||
        (chip === "Open Spots" && g.tags.includes("Open Spots"));

      return matchesText && (chip === "All" || matchesChip);
    });
  }, [q, chip]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Study Groups</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search study groups..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {(["All", "By Course", "Online", "In-Person", "Open Spots"] as ChipKey[]).map((c) => {
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
        {filtered.map((g) => (
          <View key={g.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{g.title}</Text>
                <Text style={styles.course}>{g.course}</Text>
              </View>

              <View style={styles.people}>
                <Ionicons name="people-outline" size={18} color="#6B7280" />
                <Text style={styles.peopleText}>{g.people}</Text>
              </View>
            </View>

            <Text style={styles.desc}>{g.desc}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{g.location}</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{g.mode}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{g.time}</Text>
            </View>

            <View style={styles.tagsRow}>
              {g.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => {}}>
              <Text style={styles.primaryBtnText}>Join Group</Text>
            </Pressable>
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
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "#FFFFFF" },
  chipActive: { backgroundColor: "#2F80FF" },
  chipText: { fontWeight: "800", color: "#111827" },
  chipTextActive: { color: "#FFFFFF" },

  list: { paddingHorizontal: 16, paddingTop: 6, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14 },

  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  course: { marginTop: 4, color: "#2563EB", fontWeight: "800" },

  people: { flexDirection: "row", alignItems: "center", gap: 6 },
  peopleText: { color: "#111827", fontWeight: "800" },

  desc: { marginTop: 10, color: "#374151", fontWeight: "500", lineHeight: 20 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" },
  metaText: { color: "#374151", fontWeight: "600" },

  pill: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { color: "#111827", fontWeight: "800" },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  tag: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { color: "#111827", fontWeight: "700" },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900" },
});
