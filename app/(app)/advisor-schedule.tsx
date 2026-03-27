import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

type Slot = {
  time: string;
  available: boolean;
};

type AdvisorScheduleType = {
  location: string;
  slotsByDate: Record<string, Slot[]>;
};

const SAMPLE_DATES = [
  "2026-03-26",
  "2026-03-27",
  "2026-03-28",
  "2026-03-29",
];

const TIME_OPTIONS = [
  "9:00am",
  "9:30am",
  "10:00am",
  "10:30am",
  "11:00am",
  "11:30am",
  "12:00pm",
  "1:00pm",
  "1:30pm",
  "2:00pm",
  "2:30pm",
  "3:00pm",
  "3:30pm",
  "4:00pm",
];

export default function AdvisorSchedule() {
  const router = useRouter();

  const advisorId = "a1";
  const advisorName = "Dr. Angelina Chen";
  const avatarUrl =
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop";

  const [selectedDate, setSelectedDate] = useState<string>(SAMPLE_DATES[0]);
  const [selectedTime, setSelectedTime] = useState<string>("10:00am");

  const [schedule, setSchedule] = useState<AdvisorScheduleType>({
    location: "Wellness Centre • Casa Loma",
    slotsByDate: {
      "2026-03-26": [
        { time: "10:00am", available: true },
        { time: "11:00am", available: true },
        { time: "2:00pm", available: true },
      ],
      "2026-03-27": [
        { time: "9:30am", available: true },
        { time: "1:00pm", available: true },
      ],
      "2026-03-28": [],
      "2026-03-29": [],
    },
  });

  const slotsForSelectedDate = useMemo(() => {
    return schedule.slotsByDate[selectedDate] ?? [];
  }, [schedule, selectedDate]);

  const addSlot = () => {
    const daySlots = schedule.slotsByDate[selectedDate] ?? [];
    const exists = daySlots.some((slot) => slot.time === selectedTime);

    if (exists) {
      Alert.alert("Slot already exists", "This time has already been added.");
      return;
    }

    const updatedSchedule: AdvisorScheduleType = {
      ...schedule,
      slotsByDate: {
        ...schedule.slotsByDate,
        [selectedDate]: [...daySlots, { time: selectedTime, available: true }].sort(
          (a, b) => TIME_OPTIONS.indexOf(a.time) - TIME_OPTIONS.indexOf(b.time)
        ),
      },
    };

    setSchedule(updatedSchedule);
  };

  const removeSlot = (time: string) => {
    const updatedSchedule: AdvisorScheduleType = {
      ...schedule,
      slotsByDate: {
        ...schedule.slotsByDate,
        [selectedDate]: (schedule.slotsByDate[selectedDate] ?? []).filter(
          (slot) => slot.time !== time
        ),
      },
    };

    setSchedule(updatedSchedule);
  };

  const goToBookingPage = () => {
    router.push({
      pathname: "/wellness/book",
      params: {
        advisorId,
        advisorName,
        avatarUrl,
        schedule: JSON.stringify(schedule),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Advisor Schedule</Text>
        <Text style={styles.subheader}>Manage available appointment times</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Advisor</Text>
          <Text style={styles.advisorName}>{advisorName}</Text>
          <Text style={styles.locationText}>{schedule.location}</Text>
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
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      isSelected && styles.dateChipTextSelected,
                    ]}
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Select Time</Text>
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
              <View key={slot.time} style={styles.slotRow}>
                <View>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  <Text style={styles.slotStatus}>Available</Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSlot(slot.time)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.bookingButton} onPress={goToBookingPage}>
          <Text style={styles.bookingButtonText}>Open Booking Page</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FB",
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
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },
  dateChipSelected: {
    backgroundColor: "#4F46E5",
  },
  dateChipText: {
    color: "#3730A3",
    fontWeight: "600",
  },
  dateChipTextSelected: {
    color: "#FFFFFF",
  },
  timeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  timeChipSelected: {
    backgroundColor: "#0EA5E9",
  },
  timeChipText: {
    color: "#374151",
    fontWeight: "600",
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
    fontWeight: "600",
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
  bookingButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  bookingButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});