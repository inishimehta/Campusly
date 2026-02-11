import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type TabKey = "Advisors" | "Wellness Tools";

type Advisor = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hours: string;
};

const ADVISORS: Advisor[] = [
  {
    id: "a1",
    name: "Dr. Sarah Chen",
    role: "Mental Health Counselor",
    email: "sarah.chen@georgebrown.ca",
    phone: "(416) 415-5000 ext. 2345",
    hours: "Mon–Fri, 9am–5pm",
  },
  {
    id: "a2",
    name: "Michael Torres",
    role: "Academic Advisor",
    email: "michael.torres@georgebrown.ca",
    phone: "(416) 415-5000 ext. 2346",
    hours: "Tue–Thu, 10am–6pm",
  },
  {
    id: "a3",
    name: "Dr. Priya Patel",
    role: "Wellness Specialist",
    email: "priya.patel@georgebrown.ca",
    phone: "(416) 415-5000 ext. 2347",
    hours: "Mon–Wed, 8am–4pm",
  },
];

export default function Wellness() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Advisors");

  const content = useMemo(() => {
    if (tab === "Wellness Tools") {
      return (
        <View style={styles.toolsWrap}>
          <Text style={styles.toolsTitle}>Wellness tools</Text>
          <Text style={styles.toolsText}>
            We’ll add breathing, meditation, and self-check tools here.
          
            We’ll add breathing, meditation, and self-check tools here.
          </Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.desc}>
          Connect with our team of wellness professionals for support and guidance.
        </Text>

        {ADVISORS.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{a.name}</Text>
                <Text style={styles.role}>{a.role}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text style={styles.link}>{a.email}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text style={styles.text}>{a.phone}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.text}>{a.hours}</Text>
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => {}}>
              <Text style={styles.primaryBtnText}>Book Appointment</Text>
            </Pressable>
          </View>
        ))}
      </>
    );
  }, [tab]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Wellness Services</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.segmentWrap}>
        {(["Advisors", "Wellness Tools"] as TabKey[]).map((k) => {
          const active = k === tab;
          return (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{k}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {content}
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

  segmentWrap: {
    marginHorizontal: 16,
    flexDirection: "row",
    backgroundColor: "#EFEFF2",
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  segment: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  segmentActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontWeight: "900", color: "#6B7280" },
  segmentTextActive: { color: "#111827" },

  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },
  desc: { color: "#374151", fontWeight: "600", lineHeight: 20 },

  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#D1D5DB" },

  name: { fontSize: 18, fontWeight: "900", color: "#111827" },
  role: { marginTop: 2, color: "#6B7280", fontWeight: "700" },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  link: { color: "#2563EB", fontWeight: "800" },
  text: { color: "#111827", fontWeight: "700" },

  primaryBtn: {
    marginTop: 6,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900" },

  toolsWrap: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 8 },
  toolsTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  toolsText: { color: "#374151", fontWeight: "600", lineHeight: 20 },
});
