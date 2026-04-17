import { useFocusEffect, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query, setDoc, updateDoc, where
} from "firebase/firestore";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../../firebaseConfig";

export type SessionMode = "Online" | "In Person";
export type BookingStatus = "Booked" | "Completed" | "Cancelled";

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
  studentUid: string;
  status: BookingStatus;
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

function getAdvisorBookingDocId(booking: AdvisorBookingItem) {
  const safeTime = (booking.time || "").replace(/\s+/g, "").replace(/:/g, "");
  const safeUid = (booking.studentUid || "").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${booking.advisorId}_${booking.date}_${safeTime}_${safeUid}`;
}

export async function addAdvisorBooking(booking: AdvisorBookingItem) {
  const bookingId = getAdvisorBookingDocId(booking);
  await setDoc(doc(db, "advisorBookings", bookingId), booking);
}

export async function updateAdvisorBookingStatus(
  booking: AdvisorBookingItem,
  status: BookingStatus
) {
  const bookingId = getAdvisorBookingDocId(booking);
  await updateDoc(doc(db, "advisorBookings", bookingId), { status });
}

// ✅ FIXED: Strips 'undefined' values so Firebase doesn't crash
export async function markSlotUnavailable(
  advisorId: string,
  date: string,
  time: string,
  mode: SessionMode
) {
  const ref = doc(db, "advisorSchedules", advisorId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const schedule = snap.data() as AdvisorScheduleRecord;
  const slots = schedule.slotsByDate?.[date] ?? [];

  const updatedSlots = slots.map((slot) => ({
    time: slot.time || "",
    mode: slot.mode || "Online",
    detail: slot.detail || "",
    available: slot.time === time && slot.mode === mode ? false : !!slot.available,
  }));

  await updateDoc(ref, {
    [`slotsByDate.${date}`]: updatedSlots,
  });
}

// ✅ FIXED: Strips 'undefined' values so Firebase doesn't crash
export async function markSlotAvailable(
  advisorId: string,
  date: string,
  time: string,
  mode: SessionMode
) {
  const ref = doc(db, "advisorSchedules", advisorId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const schedule = snap.data() as AdvisorScheduleRecord;
  const slots = schedule.slotsByDate?.[date] ?? [];

  const updatedSlots = slots.map((slot) => ({
    time: slot.time || "",
    mode: slot.mode || "Online",
    detail: slot.detail || "",
    available: slot.time === time && slot.mode === mode ? true : !!slot.available,
  }));

  await updateDoc(ref, {
    [`slotsByDate.${date}`]: updatedSlots,
  });
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

export async function getMyAdvisorBookings(): Promise<AdvisorBookingItem[]> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "advisorBookings"),
    where("studentUid", "==", user.uid)
  );

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as AdvisorBookingItem)
    .sort((a, b) => {
      const aKey = `${a.date} ${a.time}`;
      const bKey = `${b.date} ${b.time}`;
      return bKey.localeCompare(aKey);
    });
}

const STATUS_OPTIONS: Array<"All" | BookingStatus> = [
  "All",
  "Booked",
  "Completed",
  "Cancelled",
];

export default function AdvisorBookingsScreen() {
  const router = useRouter();

  const [bookings, setBookings] = useState<AdvisorBookingItem[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | BookingStatus>("All");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoading(true);

          const [bookingData, advisorData] = await Promise.all([
            getAllAdvisorBookings(),
            getAdvisors(),
          ]);

          if (active) {
            setBookings(bookingData);
            setAdvisors(advisorData);

            if (advisorData.length > 0) {
              setSelectedAdvisorId((prev) => prev || advisorData[0].id);
            }
          }
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

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const advisorMatch = selectedAdvisorId
        ? booking.advisorId === selectedAdvisorId
        : true;

      const normalizedStatus = booking.status || "Booked";
      const statusMatch =
        selectedStatus === "All" || normalizedStatus === selectedStatus;

      return advisorMatch && statusMatch;
    });
  }, [bookings, selectedAdvisorId, selectedStatus]);

  const handleCancelBooking = async (booking: AdvisorBookingItem) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking with ${booking.advisorName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await updateAdvisorBookingStatus(booking, "Cancelled");

              setBookings((prev) =>
                prev.map((item) =>
                  getAdvisorBookingDocId(item) === getAdvisorBookingDocId(booking)
                    ? { ...item, status: "Cancelled" }
                    : item
                )
              );
            } catch (error) {
              console.error("Failed to cancel booking:", error);
              Alert.alert("Error", "Could not cancel booking. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleRescheduleBooking = (booking: AdvisorBookingItem) => {
    router.push({
      pathname: "/(app)/advisor-schedule",
      params: {
        advisorId: booking.advisorId,
        advisorName: booking.advisorName,
      },
    });
  };

  const handleJoinMeeting = async (booking: AdvisorBookingItem) => {
    if (booking.mode !== "Online") {
      Alert.alert("In Person Session", "This booking does not have an online meeting link.");
      return;
    }

    const meetingLink = booking.detail?.trim();

    if (!meetingLink) {
      Alert.alert("Missing Link", "No meeting link was found for this booking.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(meetingLink);

      if (supported) {
        await Linking.openURL(meetingLink);
      } else {
        Alert.alert("Invalid Link", "This meeting link could not be opened.");
      }
    } catch (error) {
      console.error("Failed to open meeting link:", error);
      Alert.alert("Error", "Could not open the meeting link.");
    }
  };

  const renderStatusBadge = (status: BookingStatus) => {
    const badgeStyle =
      status === "Booked"
        ? styles.bookedBadge
        : status === "Completed"
        ? styles.completedBadge
        : styles.cancelledBadge;

    const textStyle =
      status === "Booked"
        ? styles.bookedBadgeText
        : status === "Completed"
        ? styles.completedBadgeText
        : styles.cancelledBadgeText;

    return (
      <View style={[styles.badge, badgeStyle]}>
        <Text style={[styles.badgeText, textStyle]}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.header}>Advisor Bookings</Text>
          <Text style={styles.subheader}>
            View and manage your advisor appointments
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Choose advisor</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {advisors.map((advisor) => (
            <TouchableOpacity
              key={advisor.id}
              style={[
                styles.chip,
                selectedAdvisorId === advisor.id && styles.activeChip,
              ]}
              onPress={() => setSelectedAdvisorId(advisor.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedAdvisorId === advisor.id && styles.activeChipText,
                ]}
                numberOfLines={1}
              >
                {advisor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Booking status</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusRow}
        >
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusChip,
                selectedStatus === status && styles.activeStatusChip,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  selectedStatus === status && styles.activeStatusChipText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>
              Loading bookings...
            </Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptyText}>
              Try a different status or book a new appointment.
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking, index) => {
            const bookingStatus = booking.status || "Booked";

            return (
              <View
                key={`${booking.advisorId}-${booking.date}-${booking.time}-${index}`}
                style={styles.card}
              >
                <View style={styles.cardAccent} />

                <View style={styles.cardTopRow}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.advisorName}>{booking.advisorName}</Text>
                    <Text style={styles.sessionTypeText}>{booking.mode} Session</Text>
                  </View>

                  {renderStatusBadge(bookingStatus)}
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{booking.date}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>{booking.time}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{booking.location}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>
                    {booking.mode === "Online" ? "Meeting Link" : "Address"}
                  </Text>
                  <Text style={styles.infoValue}>{booking.detail}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Student Email</Text>
                  <Text style={styles.infoValue}>
                    {booking.studentEmail || "Not provided"}
                  </Text>
                </View>

                {bookingStatus === "Booked" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancelBooking(booking)}
                    >
                      <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rescheduleButton]}
                      onPress={() => handleRescheduleBooking(booking)}
                    >
                      <Text
                        style={[styles.actionButtonText, styles.rescheduleButtonText]}
                      >
                        Reschedule
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        booking.mode === "Online"
                          ? styles.joinButton
                          : styles.disabledButton,
                      ]}
                      onPress={() => handleJoinMeeting(booking)}
                      disabled={booking.mode !== "Online"}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          booking.mode === "Online"
                            ? styles.joinButtonText
                            : styles.disabledButtonText,
                        ]}
                      >
                        Join Meeting
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {bookingStatus === "Cancelled" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rescheduleButtonWide]}
                      onPress={() => handleRescheduleBooking(booking)}
                    >
                      <Text
                        style={[styles.actionButtonText, styles.rescheduleButtonText]}
                      >
                        Reschedule
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 44,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subheader: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    marginTop: 2,
  },
  chipRow: {
    paddingBottom: 12,
    gap: 10,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  activeChip: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  statusRow: {
    paddingBottom: 12,
    gap: 10,
    marginBottom: 6,
  },
  statusChip: {
    backgroundColor: "#EEF2F7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  activeStatusChip: {
    backgroundColor: "#DCE6F8",
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  activeStatusChipText: {
    color: "#1D4ED8",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    marginTop: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginTop: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#DCE6F8",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 10,
    marginTop: 4,
  },
  cardTitleWrap: {
    flex: 1,
  },
  advisorName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  sessionTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  badge: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  bookedBadge: {
    backgroundColor: "#DCFCE7",
  },
  bookedBadgeText: {
    color: "#166534",
  },
  completedBadge: {
    backgroundColor: "#E5E7EB",
  },
  completedBadgeText: {
    color: "#374151",
  },
  cancelledBadge: {
    backgroundColor: "#FEE2E2",
  },
  cancelledBadgeText: {
    color: "#991B1B",
  },
  infoBlock: {
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
  },
  cancelButtonText: {
    color: "#B91C1C",
  },
  rescheduleButton: {
    backgroundColor: "#E5E7EB",
  },
  rescheduleButtonWide: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  rescheduleButtonText: {
    color: "#1F2937",
  },
  joinButton: {
    backgroundColor: "#111827",
  },
  joinButtonText: {
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});