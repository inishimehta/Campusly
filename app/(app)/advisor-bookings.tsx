import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export type SessionMode = "Online" | "In Person";

export type Slot = {
  time: string;
  available: boolean;
  mode: SessionMode;
  detail: string;
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

export type Advisor = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hours: string;
  avatarUrl: string;
  isActive?: boolean;
};

export async function getAdvisors(): Promise<Advisor[]> {
  const snap = await getDocs(collection(db, "advisors"));
  return snap.docs
    .map((d) => d.data() as Advisor)
    .filter((advisor) => advisor.isActive !== false);
}

export async function getAdvisorSchedule(
  advisorId: string
): Promise<AdvisorScheduleRecord | null> {
  const ref = doc(db, "advisorSchedules", advisorId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as AdvisorScheduleRecord;
}

export async function saveAdvisorSchedule(schedule: AdvisorScheduleRecord) {
  const ref = doc(db, "advisorSchedules", schedule.advisorId);
  const snap = await getDoc(ref);

  const payload = {
    advisorId: schedule.advisorId,
    advisorName: schedule.advisorName,
    location: schedule.location,
    slotsByDate: schedule.slotsByDate,
  };

  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, payload);
  }
}

export async function addAdvisorBooking(booking: AdvisorBookingItem) {
  const safeTime = booking.time.replace(/\s+/g, "").replace(/:/g, "");
  const bookingId = `${booking.advisorId}_${booking.date}_${safeTime}`;

  await setDoc(doc(db, "advisorBookings", bookingId), booking);
}

export async function getAllAdvisorBookings(): Promise<AdvisorBookingItem[]> {
  const snap = await getDocs(collection(db, "advisorBookings"));

  return snap.docs
    .map((d) => d.data() as AdvisorBookingItem)
    .sort((a, b) => {
      const aKey = `${a.date} ${a.time}`;
      const bKey = `${b.date} ${b.time}`;
      return bKey.localeCompare(aKey);
    });
}

export default function AdvisorBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdvisorBookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoading(true);
          const data = await getAllAdvisorBookings();
          if (active) setBookings(data);
        } catch (error) {
          console.error("Failed to load advisor bookings:", error);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();

      return () => {
        active = false;
      };
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

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>
              Loading bookings...
            </Text>
          </View>
        ) : bookings.length === 0 ? (
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
                {booking.mode === "Online" ? "Meeting Link" : "Address"}:{" "}
                {booking.detail}
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
    alignItems: "center",
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