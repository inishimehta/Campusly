import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

export type SessionMode = "Online" | "In Person";

export type Slot = {
  time: string;
  available: boolean;
  mode: SessionMode;
  detail: string; // meeting link or address
};

export type AdvisorScheduleRecord = {
  advisorId: string;
  advisorName: string;
  location: string;
  slotsByDate: Record<string, Slot[]>;
};

export type AdvisorBookingItem = {
  advisorId: string;
  advisorName: string;
  date: string;
  time: string;
  location: string;
  mode: SessionMode;
  detail: string;
  studentEmail?: string;
  status: string;
};

let scheduleStore: Record<string, AdvisorScheduleRecord> = {
  a1: {
    advisorId: "a1",
    advisorName: "Dr. Angelina Chen",
    location: "Wellness Centre • Casa Loma",
    slotsByDate: {
      "2026-03-26": [
        {
          time: "10:00am",
          available: true,
          mode: "In Person",
          detail: "George Brown College, Casa Loma Campus",
        },
        {
          time: "11:00am",
          available: true,
          mode: "Online",
          detail: "https://meet.google.com/example-angelina-1",
        },
        {
          time: "2:00pm",
          available: true,
          mode: "In Person",
          detail: "George Brown College, Casa Loma Campus",
        },
      ],
      "2026-03-27": [
        {
          time: "9:30am",
          available: true,
          mode: "Online",
          detail: "https://meet.google.com/example-angelina-2",
        },
        {
          time: "1:00pm",
          available: true,
          mode: "In Person",
          detail: "George Brown College, Casa Loma Campus",
        },
      ],
    },
  },
  a2: {
    advisorId: "a2",
    advisorName: "Michael Torres",
    location: "Student Services • Waterfront",
    slotsByDate: {
      "2026-03-26": [
        {
          time: "11:00am",
          available: true,
          mode: "In Person",
          detail: "George Brown College, Waterfront Campus",
        },
        {
          time: "12:30pm",
          available: true,
          mode: "Online",
          detail: "https://meet.google.com/example-michael-1",
        },
      ],
    },
  },
  a3: {
    advisorId: "a3",
    advisorName: "Dr. Priya Patel",
    location: "Wellness Centre • St. James",
    slotsByDate: {
      "2026-03-26": [
        {
          time: "10:00am",
          available: true,
          mode: "Online",
          detail: "https://meet.google.com/example-priya-1",
        },
        {
          time: "12:00pm",
          available: true,
          mode: "In Person",
          detail: "George Brown College, St. James Campus",
        },
      ],
    },
  },
};

let bookingStore: AdvisorBookingItem[] = [];

export function getAdvisorSchedule(advisorId: string): AdvisorScheduleRecord | null {
  return scheduleStore[advisorId] ?? null;
}

export function saveAdvisorSchedule(schedule: AdvisorScheduleRecord) {
  scheduleStore = {
    ...scheduleStore,
    [schedule.advisorId]: schedule,
  };
}

export function addAdvisorBooking(booking: AdvisorBookingItem) {
  bookingStore = [booking, ...bookingStore];
}

export function getAllAdvisorBookings() {
  return [...bookingStore];
}

export default function AdvisorBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdvisorBookingItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      setBookings(getAllAdvisorBookings());
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Advisor Bookings</Text>
        <Text style={styles.subheader}>Booked wellness appointments</Text>

        {bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bookings yet.</Text>
          </View>
        ) : (
          bookings.map((booking, index) => (
            <View key={`${booking.date}-${booking.time}-${index}`} style={styles.card}>
              <Text style={styles.advisorName}>{booking.advisorName}</Text>
              <Text style={styles.detail}>Date: {booking.date}</Text>
              <Text style={styles.detail}>Time: {booking.time}</Text>
              <Text style={styles.detail}>Session: {booking.mode}</Text>
              <Text style={styles.detail}>
                {booking.mode === "Online" ? "Meeting Link" : "Address"}: {booking.detail}
              </Text>
              <Text style={styles.detail}>Location: {booking.location}</Text>
              <Text style={styles.detail}>
                Student Email: {booking.studentEmail || "Not provided"}
              </Text>
              <Text style={styles.status}>Status: {booking.status}</Text>
            </View>
          ))
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  advisorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
});