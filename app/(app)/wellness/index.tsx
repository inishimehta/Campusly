import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type TabKey = "Advisors" | "Wellness Tools";

type Advisor = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hours: string;
  avatarUrl: string;
};

const ADVISORS: Advisor[] = [
  {
    id: "a1",
    name: "Dr. Angelina Chen",
    role: "Mental Health Counselor",
    email: "angelina.chen@georgebrown.ca",
    phone: "(416) 415-5000 ext. 2345",
    hours: "Mon–Fri, 9am–5pm",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  },
  {
    id: "a2",
    name: "Michael Torres",
    role: "Academic Advisor",
    email: "michael.torres@georgebrown.ca",
    phone: "(416) 415-5000 ext. 2346",
    hours: "Tue–Thu, 10am–6pm",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    id: "a3",
    name: "Dr. Priya Patel",
    role: "Wellness Specialist",
    email: "priya.patel@georgebrown.ca",
    phone: "(416) 415-5000 ext. 2347",
    hours: "Mon–Wed, 8am–4pm",
    avatarUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop",
  },
];

// -------- Wellness Tools data + helpers --------
type MeditationTool = {
  id: string;
  title: string;
  desc: string;
  minutes: number;
  icon: keyof typeof Ionicons.glyphMap;
};

type Tip = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
};

type WellnessEvent = {
  id: string;
  title: string;
  when: string;
  where: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeBg: string;
  badgeFg: string;
};

const MEDITATION_TOOLS: MeditationTool[] = [
  { id: "breathing", title: "Breathing", desc: "5-minute guided breathing exercise", minutes: 5, icon: "leaf-outline" },
  { id: "grounding", title: "Grounding", desc: "5-4-3-2-1 sensory technique", minutes: 3, icon: "hand-left-outline" },
  { id: "mindfulness", title: "Mindfulness", desc: "Present moment awareness", minutes: 10, icon: "timer-outline" },
  { id: "quickreset", title: "Quick Reset", desc: "Instant stress relief", minutes: 2, icon: "flash-outline" },
];

const DEFAULT_TIPS: Tip[] = [
  { id: "t1", emoji: "💧", title: "Stay Hydrated", desc: "Drink 8 glasses of water daily" },
  { id: "t2", emoji: "👀", title: "Take Breaks", desc: "Rest your eyes every 20 minutes" },
  { id: "t3", emoji: "🚶", title: "Move Your Body", desc: "Stretch or walk once an hour" },
  { id: "t4", emoji: "😴", title: "Sleep Routine", desc: "Try consistent sleep and wake times" },
];

const WELLNESS_EVENTS: WellnessEvent[] = [
  {
    id: "e1",
    title: "Yoga & Mindfulness",
    when: "Nov 25, 2025 • 5:00 PM",
    where: "Wellness Centre",
    icon: "calendar-outline",
    badgeBg: "#DCFCE7",
    badgeFg: "#166534",
  },
  {
    id: "e2",
    title: "Stress Management Workshop",
    when: "Dec 3, 2025 • 2:00 PM",
    where: "Room B204",
    icon: "school-outline",
    badgeBg: "#E0E7FF",
    badgeFg: "#3730A3",
  },
];

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function shuffleArray<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function WellnessTools() {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(5);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [running, setRunning] = useState(false);

  const [tips, setTips] = useState<Tip[]>(() => shuffleArray(DEFAULT_TIPS));

  useEffect(() => {
    if (!running) return;

    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const selectTool = (tool: MeditationTool) => {
    setSelectedMinutes(tool.minutes);
    setSecondsLeft(tool.minutes * 60);
    setRunning(false);
  };

  const onStart = () => {
    if (secondsLeft <= 0) setSecondsLeft(selectedMinutes * 60);
    setRunning(true);
  };

  const onReset = () => {
    setRunning(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const onShuffleTips = () => setTips((prev) => shuffleArray(prev));

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.timerCard}>
        <View style={styles.timerTop}>
          <View style={styles.timerIconCircle}>
            <Ionicons name="time-outline" size={22} color="#2563EB" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.timerTitle}>Timer Tool</Text>
            <Text style={styles.timerSub}>Breathing • {selectedMinutes} min</Text>
          </View>
        </View>

        <Text style={styles.timerValue}>{formatMMSS(secondsLeft)}</Text>
        <Text style={styles.timerHint}>Focus on your breath while the timer runs.</Text>

        <View style={styles.timerBtns}>
          <Pressable style={styles.timerStartBtn} onPress={onStart}>
            <Text style={styles.timerStartText}>{running ? "Running…" : "Start"}</Text>
          </Pressable>

          <Pressable style={styles.timerResetBtn} onPress={onReset}>
            <Text style={styles.timerResetText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Meditation Suggestions</Text>

      <View style={styles.grid2}>
        {MEDITATION_TOOLS.map((tool) => (
          <Pressable
            key={tool.id}
            onPress={() => selectTool(tool)}
            style={[styles.meditCard, selectedMinutes === tool.minutes && styles.meditCardActive]}
          >
            <View style={styles.meditIconWrap}>
              <Ionicons name={tool.icon} size={22} color="#7C3AED" />
            </View>

            <Text style={styles.meditTitle}>{tool.title}</Text>
            <Text style={styles.meditDesc}>{tool.desc}</Text>
            <Text style={styles.meditMin}>{tool.minutes} min</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.sectionHeader}>Wellness Tips</Text>
        <Pressable onPress={onShuffleTips} style={styles.shuffleBtn}>
          <Ionicons name="shuffle-outline" size={18} color="#111827" />
          <Text style={styles.shuffleText}>Shuffle</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipRow}>
        {tips.map((t) => (
          <View key={t.id} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{t.emoji}</Text>
            <Text style={styles.tipTitle}>{t.title}</Text>
            <Text style={styles.tipDesc}>{t.desc}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionHeader}>Suggested Wellness Events</Text>

      <View style={{ gap: 12 }}>
        {WELLNESS_EVENTS.map((e) => (
          <View key={e.id} style={styles.eventCard}>
            <View style={[styles.eventBadge, { backgroundColor: e.badgeBg }]}>
              <Ionicons name={e.icon} size={20} color={e.badgeFg} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{e.title}</Text>
              <Text style={styles.eventMeta}>{e.when}</Text>
              <Text style={styles.eventMeta}>{e.where}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// -------- Screen --------
export default function Wellness() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Advisors");

  const content = useMemo(() => {
    if (tab === "Wellness Tools") {
      return <WellnessTools />;
    }

    return (
      <>
        <Text style={styles.desc}>
          Connect with our team of wellness professionals for support and guidance.
        </Text>

        {ADVISORS.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardTop}>
              {/* ✅ Avatar Image */}
              {a.avatarUrl ? (
                <Image source={{ uri: a.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatar} />
              )}

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

            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                router.push({
                  pathname: "/(app)/wellness/book" as any,
                  params: {
                    advisorId: a.id,
                    advisorName: a.name,
                    avatarUrl: a.avatarUrl,
                  },
                });
              }}
            >
              <Text style={styles.primaryBtnText}>Book Appointment</Text>
            </Pressable>
          </View>
        ))}
      </>
    );
  }, [tab, router]);

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
  avatarImg: { width: 52, height: 52, borderRadius: 26 },

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

  // ---- Wellness Tools ----
  sectionHeader: { fontSize: 22, fontWeight: "900", color: "#111827", marginTop: 2 },

  timerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D7E0FF",
  },
  timerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  timerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  timerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  timerSub: { marginTop: 2, color: "#6B7280", fontWeight: "700" },

  timerValue: { marginTop: 14, fontSize: 48, fontWeight: "900", color: "#111827", textAlign: "center" },
  timerHint: { marginTop: 8, textAlign: "center", color: "#6B7280", fontWeight: "700" },

  timerBtns: { marginTop: 14, flexDirection: "row", gap: 12 },
  timerStartBtn: {
    flex: 1,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  timerStartText: { color: "#FFFFFF", fontWeight: "900" },

  timerResetBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timerResetText: { color: "#111827", fontWeight: "900" },

  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  meditCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 8,
  },
  meditCardActive: { borderColor: "#A78BFA" },
  meditIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  meditTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  meditDesc: { color: "#6B7280", fontWeight: "700", lineHeight: 18 },
  meditMin: { marginTop: 8, color: "#7C3AED", fontWeight: "900" },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  shuffleText: { fontWeight: "900", color: "#111827" },

  tipRow: { gap: 12, paddingRight: 16 },
  tipCard: {
    width: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  tipEmoji: { fontSize: 22 },
  tipTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  tipDesc: { color: "#6B7280", fontWeight: "700", lineHeight: 18 },

  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  eventBadge: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  eventTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  eventMeta: { marginTop: 2, color: "#6B7280", fontWeight: "700" },
});
