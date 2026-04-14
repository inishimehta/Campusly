import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getAdvisors,
  getAdvisorSchedule,
  saveAdvisorSchedule,
  type Advisor,
  type AdvisorScheduleRecord,
  type Slot,
  type SessionMode,
} from "./advisor-bookings";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isWeekday(date: Date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function generateWorkingDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    if (isWeekday(current)) {
      dates.push(formatDateKey(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function formatDateLabel(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function formatWeekdayLabel(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-CA", {
    weekday: "short",
  });
}

const SAMPLE_DATES = generateWorkingDates("2026-04-01", "2026-05-15");

const TIME_OPTIONS = [
  "8:30am",
  "9:00am",
  "9:30am",
  "10:00am",
  "10:30am",
  "11:00am",
  "11:30am",
  "12:00pm",
  "12:30pm",
  "1:00pm",
  "1:30pm",
  "2:00pm",
  "2:30pm",
  "3:00pm",
  "3:30pm",
  "4:00pm",
  "4:30pm",
  "5:00pm",
];

function buildDefaultSchedule(advisorId: string, advisorName: string): AdvisorScheduleRecord {
  return {
    advisorId,
    advisorName,
    location: "Wellness Centre",
    slotsByDate: {},
  };
}

// ✅ ADDED: normalize anything that comes back from Firestore
function normalizeSchedule(
  raw: Partial<AdvisorScheduleRecord> | null | undefined,
  advisorId: string,
  advisorName: string
): AdvisorScheduleRecord {
  return {
    advisorId: raw?.advisorId || advisorId,
    advisorName: raw?.advisorName || advisorName,
    location: raw?.location || "Wellness Centre",
    slotsByDate: raw?.slotsByDate ?? {},
  };
}

export default function AdvisorSchedule() {
  const router = useRouter();

  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [schedule, setSchedule] = useState<AdvisorScheduleRecord | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(SAMPLE_DATES[0]);
  const [selectedTime, setSelectedTime] = useState<string>("10:00am");
  const [selectedMode, setSelectedMode] = useState<SessionMode>("In Person");

  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        const data = await getAdvisors();
        setAdvisors(data);

        if (data.length > 0) {
          setSelectedAdvisorId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load advisors:", error);
        Alert.alert("Error", "Could not load advisors.");
      } finally {
        setLoadingAdvisors(false);
      }
    };

    loadAdvisors();
  }, []);

  useEffect(() => {
    if (!selectedAdvisorId) return;

    const loadSchedule = async () => {
      setLoadingSchedule(true);

      try {
        const advisor = advisors.find((a) => a.id === selectedAdvisorId);
        if (!advisor) return;

        const existing = await getAdvisorSchedule(selectedAdvisorId);

        // ✅ EDITED: always normalize before using
        const nextSchedule = normalizeSchedule(
          existing ?? buildDefaultSchedule(advisor.id, advisor.name),
          advisor.id,
          advisor.name
        );

        setSchedule(nextSchedule);

        // ✅ EDITED: safe access
        const safeSlotsByDate = nextSchedule.slotsByDate ?? {};
        const dates = Object.keys(safeSlotsByDate);

        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        } else {
          setSelectedDate(SAMPLE_DATES[0]);
        }
      } catch (error) {
        console.error("Failed to load schedule:", error);
        Alert.alert("Error", "Could not load this advisor's schedule.");

        const advisor = advisors.find((a) => a.id === selectedAdvisorId);
        if (advisor) {
          setSchedule(buildDefaultSchedule(advisor.id, advisor.name));
        }
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadSchedule();
  }, [selectedAdvisorId, advisors]);

  const selectedAdvisor = useMemo(() => {
    return advisors.find((a) => a.id === selectedAdvisorId) ?? null;
  }, [advisors, selectedAdvisorId]);

  const slotsForSelectedDate = useMemo(() => {
    // ✅ EDITED: extra safety
    if (!schedule || !schedule.slotsByDate) return [];
    const slots = schedule.slotsByDate[selectedDate] ?? [];
    return [...slots].sort(
      (a, b) => TIME_OPTIONS.indexOf(a.time) - TIME_OPTIONS.indexOf(b.time)
    );
  }, [schedule, selectedDate]);

  const addSlot = () => {
    if (!schedule) return;

    // ✅ EDITED: safe slotsByDate fallback
    const currentSlotsByDate = schedule.slotsByDate ?? {};
    const daySlots = currentSlotsByDate[selectedDate] ?? [];

    const exists = daySlots.some(
      (slot) => slot.time === selectedTime && slot.mode === selectedMode
    );

    if (exists) {
      Alert.alert("Slot already exists", "This slot is already added for this day.");
      return;
    }

    const detail =
      selectedMode === "Online"
        ? `https://meet.google.com/${schedule.advisorId}/${selectedDate}/${selectedTime
            .replace(/[: ]/g, "")
            .toLowerCase()}`
        : schedule.location;

    const newSlot: Slot = {
      time: selectedTime,
      available: true,
      mode: selectedMode,
      detail,
    };

    const updatedSchedule: AdvisorScheduleRecord = {
      ...schedule,
      slotsByDate: {
        ...currentSlotsByDate,
        [selectedDate]: [...daySlots, newSlot].sort(
          (a, b) => TIME_OPTIONS.indexOf(a.time) - TIME_OPTIONS.indexOf(b.time)
        ),
      },
    };

    setSchedule(updatedSchedule);
  };

  const removeSlot = (time: string, mode: SessionMode) => {
    if (!schedule) return;

    // ✅ EDITED: safe slotsByDate fallback
    const currentSlotsByDate = schedule.slotsByDate ?? {};

    const updatedSchedule: AdvisorScheduleRecord = {
      ...schedule,
      slotsByDate: {
        ...currentSlotsByDate,
        [selectedDate]: (currentSlotsByDate[selectedDate] ?? []).filter(
          (slot) => !(slot.time === time && slot.mode === mode)
        ),
      },
    };

    setSchedule(updatedSchedule);
  };

  const handleSaveSchedule = async () => {
    if (!schedule) return;

    try {
      setSaving(true);
      await saveAdvisorSchedule({
        ...schedule,
        slotsByDate: schedule.slotsByDate ?? {},
      });
      Alert.alert("Saved", "Advisor schedule updated in Firebase.");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      Alert.alert("Error", "Could not save advisor schedule.");
    } finally {
      setSaving(false);
    }
  };

  const goToBookingPage = () => {
    if (!selectedAdvisor) return;

    router.push({
      pathname: "/(app)/wellness/book" as any,
      params: {
        advisorId: selectedAdvisor.id,
        advisorName: selectedAdvisor.name,
        avatarUrl: selectedAdvisor.avatarUrl,
      },
    });
  };

  if (loadingAdvisors) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading advisors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Advisor Schedule</Text>
        <Text style={styles.subheader}>Manage available appointment times</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Choose Advisor</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.advisorRow}
          >
            {advisors.map((advisor) => {
              const active = advisor.id === selectedAdvisorId;

              return (
                <TouchableOpacity
                  key={advisor.id}
                  onPress={() => setSelectedAdvisorId(advisor.id)}
                  style={[styles.advisorChip, active && styles.advisorChipActive]}
                >
                  {advisor.avatarUrl ? (
                    <Image source={{ uri: advisor.avatarUrl }} style={styles.advisorChipAvatar} />
                  ) : (
                    <View style={styles.advisorChipAvatarFallback} />
                  )}

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.advisorChipName,
                        active && styles.advisorChipNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {advisor.name}
                    </Text>
                    <Text
                      style={[
                        styles.advisorChipRole,
                        active && styles.advisorChipRoleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {advisor.role}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loadingSchedule || !schedule || !selectedAdvisor ? (
          <View style={[styles.card, styles.centeredCard]}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={styles.loadingText}>Loading schedule...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>Advisor</Text>
              <Text style={styles.advisorName}>{selectedAdvisor.name}</Text>
              <Text style={styles.locationText}>{schedule.location}</Text>
              <Text style={styles.helperText}>{selectedAdvisor.hours}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Select Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateRow}
              >
                {SAMPLE_DATES.map((date) => {
                  const isSelected = selectedDate === date;
                  const count = schedule.slotsByDate?.[date]?.length ?? 0;

                  return (
                    <TouchableOpacity
                      key={date}
                      style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text
                        style={[
                          styles.dateWeekday,
                          isSelected && styles.dateWeekdaySelected,
                        ]}
                      >
                        {formatWeekdayLabel(date)}
                      </Text>
                      <Text
                        style={[
                          styles.dateMainText,
                          isSelected && styles.dateMainTextSelected,
                        ]}
                      >
                        {formatDateLabel(date)}
                      </Text>
                      <Text
                        style={[
                          styles.dateCountText,
                          isSelected && styles.dateCountTextSelected,
                        ]}
                      >
                        {count} slots
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Session Type</Text>
              <View style={styles.modeRow}>
                {(["In Person", "Online"] as SessionMode[]).map((mode) => {
                  const active = selectedMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.modeChip, active && styles.modeChipActive]}
                      onPress={() => setSelectedMode(mode)}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          active && styles.modeChipTextActive,
                        ]}
                      >
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>Select Time</Text>
              <View style={styles.timeWrap}>
                {TIME_OPTIONS.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          isSelected && styles.timeChipTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.addButton} onPress={addSlot}>
                <Text style={styles.addButtonText}>+ Add Selected Slot</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Available Slots</Text>

              {slotsForSelectedDate.length === 0 ? (
                <Text style={styles.emptyText}>No slots added for this date yet.</Text>
              ) : (
                slotsForSelectedDate.map((slot) => (
                  <View key={`${slot.time}-${slot.mode}`} style={styles.slotRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.slotTime}>{slot.time}</Text>
                      <Text style={styles.slotStatus}>{slot.mode}</Text>
                      <Text style={styles.slotDetail} numberOfLines={1}>
                        {slot.detail}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeSlot(slot.time, slot.mode)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSaveSchedule}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Schedule"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookingButton} onPress={goToBookingPage}>
              <Text style={styles.bookingButtonText}>Open Booking Page</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  centeredCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  subheader: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 10,
  },
  advisorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  locationText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  advisorRow: {
    gap: 12,
    paddingRight: 12,
  },
  advisorChip: {
    width: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  advisorChipActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  advisorChipAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  advisorChipAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D1D5DB",
  },
  advisorChipName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  advisorChipNameActive: {
    color: "#312E81",
  },
  advisorChipRole: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  advisorChipRoleActive: {
    color: "#4338CA",
  },

  dateRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 12,
  },
  dateChip: {
    width: 92,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateChipSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  dateWeekday: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  dateWeekdaySelected: {
    color: "#C7D2FE",
  },
  dateMainText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  dateMainTextSelected: {
    color: "#FFFFFF",
  },
  dateCountText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  dateCountTextSelected: {
    color: "#E0E7FF",
  },

  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modeChipActive: {
    backgroundColor: "#111827",
  },
  modeChipText: {
    color: "#374151",
    fontWeight: "700",
  },
  modeChipTextActive: {
    color: "#FFFFFF",
  },

  timeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  timeChip: {
    minWidth: 84,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  timeChipSelected: {
    backgroundColor: "#0EA5E9",
  },
  timeChipText: {
    color: "#374151",
    fontWeight: "700",
  },
  timeChipTextSelected: {
    color: "#FFFFFF",
  },

  addButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    fontStyle: "italic",
  },
  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  slotTime: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  slotStatus: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "700",
    marginBottom: 4,
  },
  slotDetail: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  removeButtonText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  bookingButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 0,
  },
  bookingButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});