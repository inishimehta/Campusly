import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarList, type DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

type Slot = { time: string; available: boolean };

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Dummy schedules per advisor
const DUMMY_SCHEDULES: Record<
  string,
  {
    location: string;
    slotsByDate: Record<string, Slot[]>;
  }
> = {
  a1: {
    location: "Wellness Centre • Casa Loma",
    slotsByDate: {
      "2026-02-13": [
        { time: "9:00am", available: true },
        { time: "10:00am", available: true },
        { time: "11:00am", available: false },
        { time: "1:00pm", available: true },
        { time: "3:00pm", available: true },
      ],
      "2026-02-14": [
        { time: "10:00am", available: true },
        { time: "11:30am", available: true },
        { time: "2:00pm", available: false },
        { time: "4:00pm", available: true },
      ],
      "2026-02-17": [
        { time: "9:30am", available: true },
        { time: "12:00pm", available: true },
        { time: "2:30pm", available: true },
      ],
    },
  },
  a2: {
    location: "Student Services • Waterfront",
    slotsByDate: {
      "2026-02-13": [
        { time: "11:00am", available: true },
        { time: "12:30pm", available: true },
        { time: "4:00pm", available: true },
      ],
      "2026-02-18": [
        { time: "10:00am", available: true },
        { time: "1:00pm", available: false },
        { time: "3:30pm", available: true },
      ],
    },
  },
  a3: {
    location: "Wellness Centre • St. James",
    slotsByDate: {
      "2026-02-16": [
        { time: "10:00am", available: true },
        { time: "11:00am", available: true },
        { time: "12:00pm", available: true },
        { time: "2:00pm", available: false },
      ],
      "2026-02-20": [
        { time: "9:00am", available: true },
        { time: "1:00pm", available: true },
        { time: "3:00pm", available: true },
      ],
    },
  },
};

export default function BookAppointment() {
  const router = useRouter();
  const calRef = useRef<any>(null);

  const params = useLocalSearchParams();
  const advisorId = typeof params.advisorId === "string" ? params.advisorId : undefined;
  const advisorName = typeof params.advisorName === "string" ? params.advisorName : undefined;
  const avatarUrl = typeof params.avatarUrl === "string" ? params.avatarUrl : undefined;

  const initialSchedule =
    advisorId && DUMMY_SCHEDULES[advisorId]
      ? DUMMY_SCHEDULES[advisorId]
      : { location: "Wellness Centre", slotsByDate: {} as Record<string, Slot[]> };

  const [schedule, setSchedule] = useState(initialSchedule);

  const today = todayISO();
  const availableDates = useMemo(() => Object.keys(schedule.slotsByDate), [schedule.slotsByDate]);

  // pick first available date if exists, otherwise today
  const firstAvailable = availableDates[0] ?? today;

  const [selectedDate, setSelectedDate] = useState<string>(firstAvailable);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [bookedInfo, setBookedInfo] = useState<{ date: string; time: string } | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    for (const date of availableDates) {
      const hasAvailable = (schedule.slotsByDate[date] ?? []).some((s: Slot) => s.available);
      if (hasAvailable) marks[date] = { marked: true, dotColor: "#10B981" };
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: "#111827",
    };

    return marks;
  }, [availableDates, schedule.slotsByDate, selectedDate]);

  const slotsForDay = useMemo(() => {
    const slots = schedule.slotsByDate[selectedDate] ?? [];
    return [...slots].sort((a, b) => Number(b.available) - Number(a.available));
  }, [schedule.slotsByDate, selectedDate]);

  const onPickDay = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
  };

  const canContinue = Boolean(selectedSlot);

  return (
    <View style={styles.page}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Select time</Text>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Advisor card */}
        <View style={styles.headerCard}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar} />
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.clinicTitle}>{advisorName ?? "Advisor"}</Text>
            <Text style={styles.clinicSub}>{schedule.location}</Text>
          </View>
        </View>

        {/* Calendar card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarTopRow}>
            <Text style={styles.sectionTitle}>Choose a date</Text>

            <Pressable
              onPress={() => {
                setSelectedDate(today);
                setSelectedSlot(null);
                calRef.current?.scrollToDay?.(new Date(), 0, true);
              }}
              style={styles.todayBtn}
            >
              <Text style={styles.todayBtnText}>Back to Today</Text>
            </Pressable>
          </View>

          <CalendarList
            ref={calRef}
            current={selectedDate}
            horizontal
            pagingEnabled
            pastScrollRange={2}
            futureScrollRange={4}
            onDayPress={onPickDay}
            markedDates={markedDates}
            hideExtraDays
            theme={{
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#6B7280",
              dayTextColor: "#111827",
              monthTextColor: "#111827",
              textMonthFontWeight: "800",
              textDayFontWeight: "700",
              textDayHeaderFontWeight: "800",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#111827",
              arrowColor: "#111827",
            }}
            style={styles.calendar}
          />
        </View>

        {/* Slots */}
        <View style={styles.slotsCard}>
          <Text style={styles.sectionTitle}>Available times</Text>

          {slotsForDay.length === 0 ? (
            <Text style={styles.muted}>No slots for this day.</Text>
          ) : (
            <View style={styles.slotsWrap}>
              {slotsForDay.map((s: Slot) => {
                const active = selectedSlot === s.time;
                const disabled = !s.available;

                return (
                  <Pressable
                    key={s.time}
                    disabled={disabled}
                    onPress={() => setSelectedSlot(s.time)}
                    style={[
                      styles.slot,
                      s.available ? styles.slotAvailable : styles.slotUnavailable,
                      active && styles.slotActive,
                      disabled && styles.slotDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        s.available ? styles.slotTextAvailable : styles.slotTextUnavailable,
                        active && styles.slotTextActive,
                      ]}
                    >
                      {s.time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Next button */}
        <Pressable
          disabled={!canContinue}
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={() => {
            if (!selectedSlot) return;

            const bookedDate = selectedDate;
            const bookedTime = selectedSlot;

            // remove selected slot from that day
            setSchedule((prev) => {
              const daySlots = prev.slotsByDate[bookedDate] ?? [];
              const updatedDaySlots = daySlots.filter((s) => s.time !== bookedTime);

              return {
                ...prev,
                slotsByDate: {
                  ...prev.slotsByDate,
                  [bookedDate]: updatedDaySlots,
                },
              };
            });

            setSelectedSlot(null);
            setBookedInfo({ date: bookedDate, time: bookedTime });
            setShowConfirm(true);
          }}
        >
          <Text style={styles.nextBtnText}>{canContinue ? "Next" : "Select a time to continue"}</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Appointment booked ✅</Text>

            <Text style={styles.modalText}>{advisorName ?? "Advisor"}</Text>

            <Text style={styles.modalText}>
              {bookedInfo ? `${bookedInfo.date} at ${bookedInfo.time}` : ""}
            </Text>

            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setShowConfirm(false);
                router.back();
              }}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </Pressable>

            <Pressable onPress={() => setShowConfirm(false)} style={{ marginTop: 10 }}>
              <Text style={styles.modalLink}>Book another time</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  rightSpacer: { flex: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#E5E7EB" },
  avatarImg: { width: 46, height: 46, borderRadius: 23 },
  clinicTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  clinicSub: { marginTop: 2, color: "#6B7280", fontWeight: "700" },

  calendarCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  calendarTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  todayBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#F3F4F6" },
  todayBtnText: { fontWeight: "900", color: "#111827", fontSize: 12 },

  calendar: { borderRadius: 12 },

  slotsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  muted: { color: "#6B7280", fontWeight: "700" },

  slotsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  slot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },

  slotText: { fontWeight: "900" },

  slotAvailable: { backgroundColor: "#D1FAE5", borderColor: "#10B981" },
  slotTextAvailable: { color: "#065F46" },

  slotUnavailable: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  slotTextUnavailable: { color: "#9CA3AF" },

  slotDisabled: { opacity: 0.7 },

  slotActive: { backgroundColor: "#0B0B16", borderColor: "#0B0B16" },
  slotTextActive: { color: "#FFFFFF" },

  nextBtn: {
    marginTop: 6,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { color: "#FFFFFF", fontWeight: "900" },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalText: { color: "#374151", fontWeight: "700" },
  modalBtn: {
    marginTop: 8,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  modalBtnText: { color: "#FFFFFF", fontWeight: "900" },
  modalLink: { textAlign: "center", fontWeight: "900", color: "#2563EB" },
});
