import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type PlaceItem = {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  desc: string;
};

const PLACES: PlaceItem[] = [
  {
    id: "p1",
    name: "Main Library",
    rating: 4.8,
    tags: ["Study", "Quiet", "Resources"],
    desc: "Spacious study areas, computer labs, and extensive book collection.",
  },
  {
    id: "p2",
    name: "Fitness Centre",
    rating: 4.6,
    tags: ["Fitness", "Wellness", "Recreation"],
    desc: "Modern gym with cardio equipment, weights, and fitness classes.",
  },
  {
    id: "p3",
    name: "Campus Café",
    rating: 4.3,
    tags: ["Food", "Coffee", "Study"],
    desc: "Cozy café with specialty coffee, pastries, and wifi.",
  },
];

export default function Places() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return PLACES.filter((p) => {
      if (!text) return true;
      return (
        p.name.toLowerCase().includes(text) ||
        p.desc.toLowerCase().includes(text) ||
        p.tags.join(" ").toLowerCase().includes(text)
      );
    });
  }, [q]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>places</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search places..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <Pressable style={styles.filterBtn} onPress={() => {}}>
          <Ionicons name="options-outline" size={20} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.dropdown}>
        <Text style={styles.dropdownText}>All Campuses</Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Image
            source={{ uri: "https://picsum.photos/seed/hero/900/500" }}
            style={styles.heroImg}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Student Centre</Text>
            <View style={styles.heroMetaRow}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.heroMeta}>4.5</Text>
              <Text style={styles.heroMetaDot}>•</Text>
              <Text style={styles.heroMeta}>Food, Social, Events</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Places</Text>

        {filtered.map((p) => (
          <View key={p.id} style={styles.card}>
            <Image
              source={{ uri: `https://picsum.photos/seed/${p.id}/300/300` }}
              style={styles.thumb}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={styles.ratingText}>{p.rating.toFixed(1)}</Text>
              </View>

              <View style={styles.tagsRow}>
                {p.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.desc}>{p.desc}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.mapBtn} onPress={() => {}}>
          <Ionicons name="map-outline" size={18} color="#111827" />
          <Text style={styles.mapBtnText}>View Interactive Map</Text>
        </Pressable>

        <View style={{ height: 18 }} />
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
  rightSpacer: { flex: 1 },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchWrap: {
    flex: 1,
    backgroundColor: "#EFEFF2",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#111827", fontWeight: "600" },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFEFF2",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdown: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
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

  heroCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  heroImg: { width: "100%", height: 170 },
  heroOverlay: { position: "absolute", left: 14, right: 14, bottom: 12 },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  heroMeta: { color: "#FFFFFF", fontWeight: "800" },
  heroMetaDot: { color: "#FFFFFF", fontWeight: "900" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginTop: 6,
  },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
  },
  thumb: {
    width: 86,
    height: 86,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },

  name: { fontSize: 18, fontWeight: "900", color: "#111827" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  ratingText: { fontWeight: "900", color: "#111827" },

  tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { fontWeight: "700", color: "#111827" },

  desc: { marginTop: 8, color: "#374151", fontWeight: "600", lineHeight: 20 },

  mapBtn: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  mapBtnText: { fontWeight: "900", color: "#111827" },
});
