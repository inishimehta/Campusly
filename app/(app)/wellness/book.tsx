import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Image,
  Modal, Pressable,
  ScrollView, StyleSheet, Text, View
} from "react-native";
import { CalendarList, type DateData } from "react-native-calendars";
import {
  addAdvisorBooking,
  getAdvisorSchedule, markSlotAvailable, markSlotUnavailable, updateAdvisorBookingStatus, type AdvisorBookingItem,
  type AdvisorScheduleRecord,
  type Slot
} from "../advisor-bookings";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookAppointment() {
  const router = useRouter();
  const calRef = useRef<any>(null);

  const params = useLocalSearchParams();
  const advisorId = typeof params.advisorId === "string" ? params.advisorId : "a1";
  const advisorName = typeof params.advisorName === "string" ? params.advisorName : "Advisor";
  const avatarUrl = typeof params.avatarUrl === "string" ? params.avatarUrl : undefined;

  const isReschedule = params.isReschedule === "true";
  const oldDate = typeof params.oldDate === "string" ? params.oldDate : "";
  const oldTime = typeof params.oldTime === "string" ? params.oldTime : "";
  const oldMode =
    params.oldMode === "Online" || params.oldMode === "In Person"
      ? params.oldMode
      : undefined;
  const oldDetail = typeof params.oldDetail === "string" ? params.oldDetail : "";
  const oldLocation =
    typeof params.oldLocation === "string" ? params.oldLocation : "Wellness Centre";

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const studentEmail = currentUser?.email || "";
  const studentUid = currentUser?.uid || "";

  const [schedule, setSchedule] = useState<AdvisorScheduleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookedInfo, setBookedInfo] = useState<{
    date: string;
    time: string;
    mode: string;
    detail: string;
  } | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await getAdvisorSchedule(advisorId);
        const fallback: AdvisorScheduleRecord = {
          advisorId,
          advisorName,
          location: "Wellness Centre",
          slotsByDate: {},
        };
        const finalSchedule = data ?? fallback;
        setSchedule(finalSchedule);

        if (isReschedule && oldDate) {
          setSelectedDate(oldDate);
        } else {
          const dates = Object.keys(finalSchedule.slotsByDate);
          if (dates.length > 0) setSelectedDate(dates[0]);
        }
      } catch (error) {
        console.error("Failed to load advisor schedule:", error);
        setSchedule({
          advisorId,
          advisorName,
          location: "Wellness Centre",
          slotsByDate: {},
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [advisorId, advisorName, isReschedule, oldDate]);

  const availableDates = useMemo(() => {
    if (!schedule) return [];
    return Object.keys(schedule.slotsByDate);
  }, [schedule]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (!schedule) return marks;

    for (const date of availableDates) {
      const hasAvailable = (schedule.slotsByDate[date] ?? []).some(
        (s: Slot) => s.available
      );
      if (hasAvailable) {
        marks[date] = { marked: true, dotColor: "#10B981" };
      }
    }

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] ?? {}),
        selected: true,
        selectedColor: "#111827",
      };
    }

    return marks;
  }, [availableDates, schedule, selectedDate]);

  // ✅ ONLY shows slots that are available (booked ones naturally disappear)
  const slotsForDay = useMemo(() => {
    if (!schedule) return [];
    const slots = schedule.slotsByDate[selectedDate] ?? [];
    return slots.filter((s) => s.available);
  }, [schedule, selectedDate]);

  const onPickDay = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
  };

  const canContinue = Boolean(selectedSlot && schedule);

  if (loading) {
    return (
      <View style={[styles.page, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  if (!schedule) {
    return (
      <View style={[styles.page, styles.centered]}>
        <Text style={styles.errorText}>Could not load advisor schedule.</Text>
        <Pressable style={styles.modalBtn} onPress={() => router.back()}>
          <Text style={styles.modalBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>
          {isReschedule ? "Reschedule appointment" : "Select time"}
        </Text>
        <View style={styles.rightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerCard}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.clinicTitle}>{advisorName}</Text>
            <Text style={styles.clinicSub}>{schedule.location}</Text>
          </View>
        </View>

        {isReschedule && oldDate && oldTime ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Current appointment</Text>
            <Text style={styles.noticeText}>
              {oldDate} at {oldTime}
            </Text>
            {!!oldMode && <Text style={styles.noticeText}>{oldMode}</Text>}
          </View>
        ) : null}

        <View style={styles.calendarCard}>
          <View style={styles.calendarTopRow}>
            <Text style={styles.sectionTitle}>Choose a date</Text>
            <Pressable
              onPress={() => {
                const today = todayISO();
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

        <View style={styles.slotsCard}>
          <Text style={styles.sectionTitle}>Available times</Text>

          {slotsForDay.length === 0 ? (
            <Text style={styles.muted}>No slots for this day.</Text>
          ) : (
            <View style={styles.slotsColumn}>
              {slotsForDay.map((s: Slot) => {
                const active = selectedSlot?.time === s.time;

                return (
                  <Pressable
                    key={`${selectedDate}-${s.time}-${s.mode}`}
                    onPress={() => setSelectedSlot(s)}
                    style={[
                      styles.slotCard,
                      active && styles.slotCardActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slotTime, active && styles.slotTimeActive]}>
                        {s.time}
                      </Text>
                      <Text style={[styles.slotMeta, active && styles.slotMetaActive]}>
                        {s.mode}
                      </Text>
                      <Text style={[styles.slotDetail, active && styles.slotMetaActive]}>
                        {s.detail}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        s.mode === "Online" ? styles.onlineBadge : styles.inPersonBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          s.mode === "Online"
                            ? styles.onlineBadgeText
                            : styles.inPersonBadgeText,
                        ]}
                      >
                        {s.mode}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Pressable
          disabled={!canContinue}
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={async () => {
            if (!selectedSlot || !schedule) return;

            if (!currentUser || !studentUid) {
              Alert.alert("Sign in required", "Please sign in before booking.");
              return;
            }

            const bookedDate = selectedDate;
            const bookedSlot = selectedSlot;

            try {
              // Immediately update UI to make the slot disappear on screen
              setSchedule((prev) => {
                if (!prev) return prev;
                const updatedSlots = (prev.slotsByDate[bookedDate] || []).map(s => 
                  s.time === bookedSlot.time && s.mode === bookedSlot.mode
                    ? { ...s, available: false }
                    : s
                );
                
                let freedSlots = prev.slotsByDate;
                if (isReschedule && oldDate && oldTime && oldMode) {
                  const slotsOnOldDate = prev.slotsByDate[oldDate] || [];
                  freedSlots = {
                    ...prev.slotsByDate,
                    [oldDate]: slotsOnOldDate.map(s => 
                      s.time === oldTime && s.mode === oldMode
                        ? { ...s, available: true }
                        : s
                    )
                  };
                }

                return { ...prev, slotsByDate: { ...freedSlots, [bookedDate]: updatedSlots } };
              });

              // ✅ SAFE PAYLOAD: No 'undefined' values allowed for Firebase
              const safeBooking: AdvisorBookingItem = {
                advisorId: advisorId || "a1",
                advisorName: advisorName || "Advisor",
                date: bookedDate,
                time: bookedSlot.time || "12:00 PM",
                location: schedule.location || "Wellness Centre",
                mode: bookedSlot.mode || "Online",
                detail: bookedSlot.detail || "",
                studentEmail: studentEmail || "",
                studentUid: studentUid || "",
                status: "Booked",
              };

              // Save it to Firebase
              await addAdvisorBooking(safeBooking);
              await markSlotUnavailable(
                safeBooking.advisorId,
                safeBooking.date,
                safeBooking.time,
                safeBooking.mode
              );

              // Handle reschedule 
              if (isReschedule && oldDate && oldTime && oldMode) {
                const oldBooking: AdvisorBookingItem = {
                  advisorId: advisorId || "a1",
                  advisorName: advisorName || "Advisor",
                  date: oldDate,
                  time: oldTime,
                  location: oldLocation || "Wellness Centre",
                  mode: oldMode,
                  detail: oldDetail || "",
                  studentEmail: studentEmail || "",
                  studentUid: studentUid || "",
                  status: "Booked",
                };

                await updateAdvisorBookingStatus(oldBooking, "Cancelled");
                await markSlotAvailable(advisorId, oldDate, oldTime, oldMode);
              }

              setSelectedSlot(null);
              setBookedInfo({
                date: safeBooking.date,
                time: safeBooking.time,
                mode: safeBooking.mode,
                detail: safeBooking.detail,
              });
              setShowConfirm(true);
            } catch (error) {
              console.error("Firebase Error:", error);
              Alert.alert("Booking failed", "Could not save your appointment.");
            }
          }}
        >
          <Text style={styles.nextBtnText}>
            {canContinue
              ? isReschedule
                ? "Save New Time"
                : "Confirm Booking"
              : "Select a time to continue"}
          </Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isReschedule
                ? "Appointment updated successfully ✅"
                : "Appointment saved successfully ✅"}
            </Text>
            <Text style={styles.modalText}>{advisorName}</Text>
            <Text style={styles.modalText}>
              {bookedInfo ? `${bookedInfo.date} at ${bookedInfo.time}` : ""}
            </Text>
            <Text style={styles.modalText}>{bookedInfo?.mode}</Text>
            <Text style={styles.modalText}>{bookedInfo?.detail}</Text>

            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setShowConfirm(false);
                router.push("/(app)/wellness/my-appointments");
              }}
            >
              <Text style={styles.modalBtnText}>View My Appointments</Text>
            </Pressable>

            <Pressable
              style={[styles.modalBtn, styles.secondaryModalBtn]}
              onPress={() => {
                setShowConfirm(false);
              }}
            >
              <Text style={[styles.modalBtnText, styles.secondaryModalBtnText]}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
  centered: { justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  loadingText: { marginTop: 12, color: "#6B7280", fontWeight: "700" },
  errorText: { color: "#111827", fontWeight: "800", marginBottom: 16 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  rightSpacer: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  headerCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#E5E7EB" },
  avatarImg: { width: 46, height: 46, borderRadius: 23 },
  clinicTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  clinicSub: { marginTop: 2, color: "#6B7280", fontWeight: "700" },
  noticeCard: { backgroundColor: "#EEF2FF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#D7E0FF" },
  noticeTitle: { fontSize: 13, fontWeight: "900", color: "#4338CA", marginBottom: 4, textTransform: "uppercase" },
  noticeText: { color: "#111827", fontWeight: "700" },
  calendarCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  calendarTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  todayBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#F3F4F6" },
  todayBtnText: { fontWeight: "900", color: "#111827", fontSize: 12 },
  calendar: { borderRadius: 12 },
  slotsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  slotsColumn: { gap: 10 },
  slotCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  slotCardActive: { backgroundColor: "#111827", borderColor: "#111827" },
  slotTime: { fontSize: 16, fontWeight: "900", color: "#111827" },
  slotTimeActive: { color: "#FFFFFF" },
  slotMeta: { marginTop: 4, fontSize: 13, fontWeight: "700", color: "#4B5563" },
  slotMetaActive: { color: "#E5E7EB" },
  slotDetail: { marginTop: 4, fontSize: 12, color: "#6B7280", fontWeight: "600" },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  onlineBadge: { backgroundColor: "#DBEAFE" },
  inPersonBadge: { backgroundColor: "#DCFCE7" },
  onlineBadgeText: { color: "#1D4ED8" },
  inPersonBadgeText: { color: "#15803D" },
  muted: { color: "#6B7280", fontWeight: "600" },
  nextBtn: { backgroundColor: "#111827", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 15 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.35)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 10, textAlign: "center" },
  modalText: { color: "#4B5563", fontSize: 15, fontWeight: "700", marginTop: 4, textAlign: "center" },
  modalBtn: { marginTop: 18, backgroundColor: "#111827", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, minWidth: 220, alignItems: "center" },
  modalBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  secondaryModalBtn: { backgroundColor: "#E5E7EB", marginTop: 10 },
  secondaryModalBtnText: { color: "#111827" },
});