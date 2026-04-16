import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Href, useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { db } from "../../../firebaseConfig";
import { getAdvisors, type Advisor } from "../advisor-bookings";

type TabKey = "Advisors" | "Wellness Tools";

const AFFIRMATIONS = [
  "I am capable of handling whatever comes my way today.",
  "My potential to succeed is infinite.",
  "I choose to be proud of myself and the work I do.",
  "I deserve to be healthy, happy, and successful.",
  "My peace of mind is my top priority.",
  "I am learning, growing, and getting better every day.",
  "I am in charge of how I feel, and today I choose happiness.",
  "Challenges are opportunities for me to grow.",
  "I release the need to be perfect. I am enough.",
  "I have the power to create change in my life.",
  "I trust my inner wisdom and intuition.",
  "I am surrounded by people who support and believe in me.",
  "Every day is a fresh start and a new beginning.",
  "I forgive myself for past mistakes and focus on the future.",
  "My body is healthy, my mind is brilliant, my soul is tranquil.",
  "I am confident in my abilities and skills.",
  "I choose to focus on what I can control.",
  "I let go of worries that drain my energy.",
  "I am grateful for the good things in my life.",
  "I am strong, resilient, and brave.",
  "My thoughts are filled with positivity and optimism.",
  "I give myself permission to take breaks and rest.",
  "I radiate confidence, self-respect, and inner harmony.",
  "I am proud of how far I have come.",
  "I attract positive energy and good opportunities.",
  "I am deserving of love, compassion, and empathy.",
  "I embrace the journey, even when it is difficult.",
  "I have everything I need to achieve my goals.",
  "I choose to respond to stress with calm and clarity.",
  "I am proud to be exactly who I am.",
];

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
  const s = start.toDate().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!end) return s;
  const e = end.toDate().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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

// --- WELLNESS TOOLS COMPONENT ---
function WellnessTools() {
  const router = useRouter(); 
  const scrollRef = useRef<ScrollView>(null);
  const [yOffsets, setYOffsets] = useState<Record<string, number>>({});

  // Affirmations
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);

  // Timer and Tips
  const [selectedMinutes, setSelectedMinutes] = useState<number>(5);
  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60);
  const [running, setRunning] = useState(false);
  const [tips, setTips] = useState<Tip[]>(() => shuffleArray(DEFAULT_TIPS));

  // Sleep Calculator
  const [wakeDate, setWakeDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Brain Dump
  const [dumpText, setDumpText] = useState("");

  // Firebase Events
  const [wellnessEvents, setWellnessEvents] = useState<any[]>([]);

  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    
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

  const scrollToSection = (key: string) => {
    if (scrollRef.current && yOffsets[key] !== undefined) {
      scrollRef.current.scrollTo({ y: yOffsets[key], animated: true });
    }
  };

  const handleTimeChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selected) setWakeDate(selected);
  };

  const calcBedtimes = () => {
    const times = [9, 7.5, 6].map((hours) => {
      const d = new Date(wakeDate.getTime() - hours * 60 * 60 * 1000);
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    });
    return times;
  };

  const bedtimes = calcBedtimes();

  return (
    <View style={{ flex: 1 }}>
      {/* QUICK MENU */}
      <View style={styles.menuWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
          <Pressable style={styles.menuChip} onPress={() => scrollToSection("affirmations")}>
            <Text style={styles.menuChipText}>✨ Affirmations</Text>
          </Pressable>
          <Pressable style={styles.menuChip} onPress={() => scrollToSection("timer")}>
            <Text style={styles.menuChipText}>⏱️ Timer</Text>
          </Pressable>
          <Pressable style={styles.menuChip} onPress={() => scrollToSection("tips")}>
            <Text style={styles.menuChipText}>💡 Tips</Text>
          </Pressable>
          <Pressable style={styles.menuChip} onPress={() => scrollToSection("sleep")}>
            <Text style={styles.menuChipText}>🌙 Sleep Calc</Text>
          </Pressable>
          <Pressable style={styles.menuChip} onPress={() => scrollToSection("dump")}>
            <Text style={styles.menuChipText}>🧠 Brain Dump</Text>
          </Pressable>
          <Pressable style={styles.menuChip} onPress={() => scrollToSection("events")}>
            <Text style={styles.menuChipText}>📅 Events</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.toolsScroll} showsVerticalScrollIndicator={false}>
        
        {/* AFFIRMATIONS */}
        <View 
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            setYOffsets((p) => ({ ...p, affirmations: y }));
          }} 
          style={styles.affCard}
        >
          <Text style={styles.affLabel}>Affirmation of the Day</Text>
          <Text style={styles.affText}>"{affirmation}"</Text>
          <Pressable style={styles.affBtn} onPress={() => setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])}>
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.affBtnText}>New Affirmation</Text>
          </Pressable>
        </View>

        {/* TIMER */}
        <View 
          style={{ gap: 16 }}
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            setYOffsets((p) => ({ ...p, timer: y }));
          }}
        >
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
        </View>

        {/* TIPS */}
        <View 
          style={{ gap: 16 }}
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            setYOffsets((p) => ({ ...p, tips: y }));
          }}
        >
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
        </View>

        {/* SLEEP CALCULATOR */}
        <View 
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            setYOffsets((p) => ({ ...p, sleep: y }));
          }} 
          style={styles.sleepCard}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeader}>Sleep Calculator</Text>
            <Ionicons name="moon" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.desc}>Wake up feeling refreshed by sleeping in 90-minute cycles. What time do you need to wake up?</Text>
          
          <Pressable style={styles.timePickerBtn} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.timePickerText}>{wakeDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
          </Pressable>

          <View style={styles.bedtimeRow}>
            <View style={styles.bedtimeBox}><Text style={styles.bedtimeSub}>9 Hours</Text><Text style={styles.bedtimeTime}>{bedtimes[0]}</Text></View>
            <View style={styles.bedtimeBox}><Text style={styles.bedtimeSub}>7.5 Hours</Text><Text style={styles.bedtimeTime}>{bedtimes[1]}</Text></View>
            <View style={styles.bedtimeBox}><Text style={styles.bedtimeSub}>6 Hours</Text><Text style={styles.bedtimeTime}>{bedtimes[2]}</Text></View>
          </View>

          {showTimePicker && Platform.OS === "android" && (
            <DateTimePicker value={wakeDate} mode="time" display="default" onChange={handleTimeChange} />
          )}
          {showTimePicker && Platform.OS === "ios" && (
            <DateTimePicker value={wakeDate} mode="time" display="spinner" onChange={handleTimeChange} style={{ height: 120, alignSelf: "center", marginTop: 10 }} />
          )}
        </View>

        {/* BRAIN DUMP */}
        <View 
          style={{ gap: 12 }}
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            setYOffsets((p) => ({ ...p, dump: y }));
          }}
        >
          <Text style={styles.sectionHeader}>Brain Dump</Text>
          <Text style={styles.desc}>Got too much on your mind? Type it out, then clear it away. (This is private and not saved anywhere).</Text>
          <TextInput
            style={styles.dumpInput}
            multiline
            placeholder="I'm feeling stressed about..."
            placeholderTextColor="#9CA3AF"
            value={dumpText}
            onChangeText={setDumpText}
          />
          <Pressable style={[styles.dumpBtn, !dumpText && { opacity: 0.5 }]} onPress={() => setDumpText("")} disabled={!dumpText}>
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.dumpBtnText}>Clear & Let Go</Text>
          </Pressable>
        </View>

        {/* VERTICAL EVENTS WITH PHOTOS */}
        <View 
          style={{ gap: 12 }}
          onLayout={(e) => {
            const y = e.nativeEvent.layout.y;
            setYOffsets((p) => ({ ...p, events: y }));
          }}
        >
          <Text style={styles.sectionHeader}>Suggested Wellness Events</Text>
          
          <View style={{ gap: 16 }}>
            {wellnessEvents.length > 0 ? (
              wellnessEvents.map((e) => (
                <Pressable 
                  key={e.id} 
                  style={styles.eventVerticalPhotoCard}
                  onPress={() => router.push(`/events/${e.id}` as Href)}
                >
                  <Image 
                    source={{ uri: e.imageUrl || `https://picsum.photos/seed/${e.id}/800/400` }} 
                    style={styles.eventVerticalImg} 
                  />
                  <View style={styles.eventVerticalInfo}>
                    <Text style={styles.eventVerticalTitle}>{e.title || "Untitled Event"}</Text>
                    <View style={styles.eventVerticalMetaRow}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.eventVerticalMetaText}>
                        {fmtDate(e.date)} • {fmtTimeRange(e.date, e.endDate)}
                      </Text>
                    </View>
                    <View style={styles.eventVerticalMetaRow}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.eventVerticalMetaText}>{e.location || "Location not set"}</Text>
                    </View>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Wellness() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Wellness Tools");
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
      <View style={{ gap: 14 }}>
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
      </View>
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

      {tab === "Wellness Tools" ? (
        <WellnessTools />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {content}
          <View style={{ height: 18 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  rightSpacer: { flex: 1 },

  segmentWrap: { marginHorizontal: 16, flexDirection: "row", backgroundColor: "#EFEFF2", borderRadius: 14, padding: 4, gap: 6, marginBottom: 10 },
  segment: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  segmentActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontWeight: "900", color: "#6B7280" },
  segmentTextActive: { color: "#111827" },

  menuWrap: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingVertical: 10 },
  menuScroll: { paddingHorizontal: 16, gap: 8 },
  menuChip: { backgroundColor: "#F3F4F6", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  menuChipText: { fontWeight: "800", color: "#374151", fontSize: 13 },

  toolsScroll: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },
  sectionHeader: { fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 6 },
  desc: { color: "#6B7280", fontWeight: "600", lineHeight: 18 },

  affCard: { backgroundColor: "#111827", borderRadius: 18, padding: 20, alignItems: "center" },
  affLabel: { color: "#9CA3AF", fontWeight: "800", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  affText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", textAlign: "center", lineHeight: 30, marginBottom: 20 },
  affBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, gap: 6 },
  affBtnText: { color: "#FFFFFF", fontWeight: "800" },

  timerCard: { backgroundColor: "#EEF2FF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#D7E0FF" },
  timerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  timerIconCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" },
  timerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  timerSub: { marginTop: 2, color: "#6B7280", fontWeight: "700" },
  timerValue: { marginTop: 14, fontSize: 48, fontWeight: "900", color: "#111827", textAlign: "center" },
  timerHint: { marginTop: 8, textAlign: "center", color: "#6B7280", fontWeight: "700" },
  timerBtns: { marginTop: 14, flexDirection: "row", gap: 12 },
  timerStartBtn: { flex: 1, backgroundColor: "#0B0B16", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  timerStartText: { color: "#FFFFFF", fontWeight: "900" },
  timerResetBtn: { flex: 1, backgroundColor: "#FFFFFF", paddingVertical: 14, borderRadius: 999, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  timerResetText: { color: "#111827", fontWeight: "900" },

  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  meditCard: { width: "48%", backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#F3F4F6", gap: 8 },
  meditCardActive: { borderColor: "#A78BFA" },
  meditIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F3E8FF", alignItems: "center", justifyContent: "center" },
  meditTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  meditDesc: { color: "#6B7280", fontWeight: "700", lineHeight: 18 },
  meditMin: { marginTop: 8, color: "#7C3AED", fontWeight: "900" },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shuffleBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F3F4F6", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  shuffleText: { fontWeight: "900", color: "#111827" },

  tipRow: { gap: 12, paddingRight: 16 },
  tipCard: { width: 170, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 8 },
  tipEmoji: { fontSize: 22 },
  tipTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  tipDesc: { color: "#6B7280", fontWeight: "700", lineHeight: 18 },

  sleepCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  timePickerBtn: { backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 12 },
  timePickerText: { fontSize: 18, fontWeight: "900", color: "#111827" },
  bedtimeRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  bedtimeBox: { flex: 1, backgroundColor: "#EFF6FF", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  bedtimeSub: { fontSize: 12, fontWeight: "800", color: "#3B82F6", marginBottom: 4 },
  bedtimeTime: { fontSize: 16, fontWeight: "900", color: "#1E3A8A" },

  dumpInput: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 14, minHeight: 120, textAlignVertical: "top", fontSize: 16, color: "#111827", fontWeight: "600", marginTop: 8 },
  dumpBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EF4444", paddingVertical: 14, borderRadius: 14, gap: 8 },
  dumpBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },

  eventVerticalPhotoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" },
  eventVerticalImg: { width: "100%", height: 160, backgroundColor: "#D1D5DB" },
  eventVerticalInfo: { padding: 16 },
  eventVerticalTitle: { fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 8 },
  eventVerticalMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  eventVerticalMetaText: { fontSize: 14, color: "#4B5563", fontWeight: "700" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#D1D5DB" },
  avatarImg: { width: 52, height: 52, borderRadius: 26 },
  name: { fontSize: 18, fontWeight: "900", color: "#111827" },
  role: { marginTop: 2, color: "#6B7280", fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  link: { color: "#2563EB", fontWeight: "800" },
  text: { color: "#111827", fontWeight: "700" },
  primaryBtn: { marginTop: 6, backgroundColor: "#0B0B16", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900" },
});