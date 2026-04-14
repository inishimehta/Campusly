import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { getAdvisors, type Advisor } from "../advisor-bookings";

// --- Added Firebase Imports for Events ---
import { collection, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

type TabKey = "Advisors" | "Wellness Tools";

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

// --- Added Firebase Formatting Helpers for Events ---
function fmtDate(ts?: Timestamp) {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTimeRange(start?: Timestamp, end?: Timestamp) {
  if (!start) return "";
  const s = start
    .toDate()
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!end) return s;
  const e = end
    .toDate()
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${s} - ${e}`;
}

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
      return inner.split(",").map((x) => x.replace(/^\s*['"]/, "").replace(/['"]\s*$/, "").trim()).filter(Boolean);
    }
    if (s.includes(",")) {
      return s.split(",").map((x) => x.trim()).filter(Boolean);
    }
    return s ? [s] : [];
  }
  return [];
}


function WellnessTools() {
  const router = useRouter(); // Allow clicking events to route
  const [selectedMinutes, setSelectedMinutes] = useState<number>(5);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [running, setRunning] = useState(false);
  const [tips, setTips] = useState<Tip[]>(() => shuffleArray(DEFAULT_TIPS));

  // --- Added State for Firebase Events ---
  const [wellnessEvents, setWellnessEvents] = useState<any[]>([]);

  // --- Added Firebase Fetching Logic ---
  useEffect(() => {
    const qRef = query(
      collection(db, "events"),
      where("tags", "array-contains", "Wellness"),
      orderBy("date", "asc")
    );

    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            ...data,
            tags: normalizeTags(data.tags),
          };
        });
        setWellnessEvents(list);
      },
      (err) => console.log("wellness events snapshot error:", err)
    );

    return unsub;
  }, []);

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
        {wellnessEvents.length > 0 ? (
          wellnessEvents.map((e) => (
            <Pressable 
              key={e.id} 
              style={styles.eventCard}
              onPress={() => router.push(`/events/${e.id}` as Href)}
            >
              <View style={[styles.eventBadge, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="calendar-outline" size={20} color="#166534" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{e.title || "Untitled Event"}</Text>
                <Text style={styles.eventMeta}>
                  {fmtDate(e.date)} {e.date ? "•" : ""} {fmtTimeRange(e.date, e.endDate)}
                </Text>
                <Text style={styles.eventMeta}>{e.location || "Location not set"}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={{ color: "#6B7280", fontWeight: "600", paddingVertical: 8 }}>
            No upcoming wellness events found.
          </Text>
        )}
      </View>
    </View>
  );
}

export default function Wellness() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Advisors");
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        const data = await getAdvisors();
        setAdvisors(data);
      } catch (error) {
        console.error("Failed to load advisors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdvisors();
  }, []);

  const content = useMemo(() => {
    if (tab === "Wellness Tools") {
      return <WellnessTools />;
    }

    if (loading) {
      return (
        <View style={{ paddingTop: 24, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={{ marginTop: 12, color: "#6B7280", fontWeight: "700" }}>
            Loading advisors...
          </Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.desc}>
          Connect with our team of wellness professionals for support and guidance.
        </Text>

        {advisors.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardTop}>
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
  }, [tab, router, advisors, loading]);

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