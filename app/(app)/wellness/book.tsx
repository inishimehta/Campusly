import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarList, type DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import {
  addAdvisorBooking,
  getAdvisorSchedule,
  type AdvisorScheduleRecord,
  type Slot,
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
  const advisorName =
    typeof params.advisorName === "string" ? params.advisorName : "Advisor";
  const avatarUrl =
    typeof params.avatarUrl === "string" ? params.avatarUrl : undefined;

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

        const dates = Object.keys(finalSchedule.slotsByDate);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
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
  }, [advisorId, advisorName]);

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

  const slotsForDay = useMemo(() => {
    if (!schedule) return [];
    const slots = schedule.slotsByDate[selectedDate] ?? [];
    return [...slots].sort((a, b) => Number(b.available) - Number(a.available));
  }, [schedule, selectedDate]);

  const onPickDay = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
  };

  const canContinue = Boolean(selectedSlot && schedule);

  const openConfirmationEmail = async (
    date: string,
    time: string,
    mode: string,
    detail: string
  ) => {
    if (!schedule || !studentEmail) return;

    const subject = encodeURIComponent("Wellness Appointment Confirmation");
    const body = encodeURIComponent(
      `Your appointment has been booked.\n\nAdvisor: ${advisorName}\nDate: ${date}\nTime: ${time}\nSession Type: ${mode}\n${
        mode === "Online" ? "Meeting Link" : "Address"
      }: ${detail}\nLocation: ${schedule.location}`
    );

    const url = `mailto:${studentEmail}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Email app not available",
          "Could not open an email app on this device."
        );
      }
    } catch {
      Alert.alert("Email draft could not be opened.");
    }
  };

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
        <Text style={styles.title}>Select time</Text>
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
                const disabled = !s.available;

                return (
                  <Pressable
                    key={`${selectedDate}-${s.time}-${s.mode}`}
                    disabled={disabled}
                    onPress={() => setSelectedSlot(s)}
                    style={[
                      styles.slotCard,
                      disabled && styles.slotDisabled,
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
              await addAdvisorBooking({
                advisorId,
                advisorName,
                date: bookedDate,
                time: bookedSlot.time,
                location: schedule.location,
                mode: bookedSlot.mode,
                detail: bookedSlot.detail,
                studentEmail,
                studentUid,
                status: "Booked",
              });

              await openConfirmationEmail(
                bookedDate,
                bookedSlot.time,
                bookedSlot.mode,
                bookedSlot.detail
              );

              setSelectedSlot(null);
              setBookedInfo({
                date: bookedDate,
                time: bookedSlot.time,
                mode: bookedSlot.mode,
                detail: bookedSlot.detail,
              });
              setShowConfirm(true);
            } catch (error) {
              console.error("Booking failed:", error);
              Alert.alert("Booking failed", "Could not save this booking.");
            }
          }}
        >
          <Text style={styles.nextBtnText}>
            {canContinue ? "Confirm Booking" : "Select a time to continue"}
          </Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Appointment booked ✅</Text>
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
  page: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 48,
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontWeight: "700",
  },

  errorText: {
    color: "#111827",
    fontWeight: "800",
    marginBottom: 16,
  },

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
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  rightSpacer: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E5E7EB",
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  clinicTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  clinicSub: {
    marginTop: 2,
    color: "#6B7280",
    fontWeight: "700",
  },

  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  calendarTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  todayBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  todayBtnText: {
    fontWeight: "900",
    color: "#111827",
    fontSize: 12,
  },

  calendar: {
    borderRadius: 12,
  },

  slotsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  muted: {
    color: "#6B7280",
    fontWeight: "700",
  },

  slotsColumn: {
    gap: 10,
  },

  slotCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  slotCardActive: {
    backgroundColor: "#0B0B16",
    borderColor: "#0B0B16",
  },
  slotDisabled: {
    opacity: 0.5,
  },
  slotTime: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  slotTimeActive: {
    color: "#FFFFFF",
  },
  slotMeta: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },
  slotMetaActive: {
    color: "#E5E7EB",
  },
  slotDetail: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  onlineBadge: {
    backgroundColor: "#DBEAFE",
  },
  onlineBadgeText: {
    color: "#1D4ED8",
  },
  inPersonBadge: {
    backgroundColor: "#DCFCE7",
  },
  inPersonBadgeText: {
    color: "#166534",
  },
  badgeText: {
    fontWeight: "900",
    fontSize: 12,
  },

  nextBtn: {
    marginTop: 6,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  nextBtnDisabled: {
    opacity: 0.45,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

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
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  modalText: {
    color: "#374151",
    fontWeight: "700",
  },
  modalBtn: {
    marginTop: 8,
    backgroundColor: "#0B0B16",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  modalLink: {
    textAlign: "center",
    fontWeight: "900",
    color: "#2563EB",
  },
});