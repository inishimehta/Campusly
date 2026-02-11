import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function Tile({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Campusly</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      <Text style={styles.welcome}>welcome, students!</Text>
      <Text style={styles.sub}>Have a great day on campus</Text>

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>Tip of the day</Text>
        <Text style={styles.tipText}>
          Take a 5-minute break every hour while studying to improve focus and retention!
        </Text>
      </View>

      <View style={styles.grid}>
        <Tile title="Places" onPress={() => router.push("/(app)/places")} />
        <Tile title="Events" onPress={() => router.push("/(app)/events")} />
        <Tile title="Study Groups" onPress={() => router.push("/(app)/study-groups")} />
        <Tile title="Wellness Services" onPress={() => router.push("/(app)/wellness")} />
      </View>

      <View style={styles.quickLinks}>
        <Text style={styles.quickTitle}>Quick Links</Text>
        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/(app)/places")}>
            <Text style={styles.quickBtnText}>Maps</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/(app)/events")}>
            <Text style={styles.quickBtnText}>Clubs</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/(app)/wellness")}>
            <Text style={styles.quickBtnText}>Services</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingTop: 56,
    backgroundColor: "#F6F7FB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 20, fontWeight: "800", color: "#111827" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6D5BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontWeight: "900" },

  welcome: { marginTop: 18, fontSize: 16, fontWeight: "800", color: "#111827" },
  sub: { marginTop: 6, color: "#6B7280", fontWeight: "500" },

  tip: {
    marginTop: 14,
    backgroundColor: "#FFF6DD",
    borderRadius: 16,
    padding: 14,
  },
  tipTitle: { fontWeight: "900", marginBottom: 6, color: "#111827" },
  tipText: { color: "#374151", fontWeight: "500" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "48%",
    height: 132,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 12,
    justifyContent: "flex-end",
  },
  tileTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },

  quickLinks: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
    color: "#111827",
  },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  quickBtnText: { fontWeight: "700", color: "#111827" },
});
