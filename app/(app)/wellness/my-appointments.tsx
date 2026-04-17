import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  getMyAdvisorBookings,
  updateAdvisorBookingStatus,
  type AdvisorBookingItem,
  type BookingStatus,
} from "../advisor-bookings";

type FilterTab = "Upcoming" | "Past" | "Cancelled" | "All";

function toDateValue(dateStr: string) {
  const safe = new Date(`${dateStr}T00:00:00`);
  return safe.getTime();
}

function getTodayValue() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today.getTime();
}

export default function MyAppointmentsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdvisorBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<FilterTab>("Upcoming");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoading(true);
          const data = await getMyAdvisorBookings();
          if (active) setBookings(data);
        } catch (error) {
          console.error("Failed to load student appointments:", error);
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

  const patchBookingInState = (
    booking: AdvisorBookingItem,
    nextStatus: BookingStatus
  ) => {
    setBookings((prev) =>
      prev.map((item) =>
        item.advisorId === booking.advisorId &&
        item.date === booking.date &&
        item.time === booking.time &&
        item.studentUid === booking.studentUid
          ? { ...item, status: nextStatus }
          : item
      )
    );
  };

  const handleCancelBooking = async (booking: AdvisorBookingItem) => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${booking.advisorName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await updateAdvisorBookingStatus(booking, "Cancelled");
              patchBookingInState(booking, "Cancelled");
              Alert.alert("Success", "Appointment cancelled successfully.");
            } catch (error) {
              console.error("Failed to cancel appointment:", error);
              Alert.alert("Error", "Could not cancel this appointment.");
            }
          },
        },
      ]
    );
  };

  const handleReschedule = (booking: AdvisorBookingItem) => {
    router.push({
      pathname: "/(app)/wellness/book",
      params: {
        advisorId: booking.advisorId,
        advisorName: booking.advisorName,
        isReschedule: "true",
        oldDate: booking.date,
        oldTime: booking.time,
        oldMode: booking.mode,
        oldDetail: booking.detail,
        oldLocation: booking.location,
      },
    });
  };

  const handleJoinMeeting = async (booking: AdvisorBookingItem) => {
    if (booking.mode !== "Online") {
      Alert.alert("In-Person Session", "This appointment is in person.");
      return;
    }

    const meetingLink = booking.detail?.trim();

    if (!meetingLink || !meetingLink.startsWith("http")) {
      Alert.alert(
        "Missing Link",
        "No valid meeting link was provided for this appointment."
      );
      return;
    }

    try {
      await Linking.openURL(meetingLink);
    } catch (error) {
      console.error("Failed to open meeting link:", error);
      Alert.alert("Error", "Could not open the meeting link.");
    }
  };

  const filteredBookings = useMemo(() => {
    const todayValue = getTodayValue();

    const sorted = [...bookings].sort((a, b) => {
      const aDate = toDateValue(a.date);
      const bDate = toDateValue(b.date);

      if (selectedTab === "Upcoming") {
        return aDate - bDate;
      }

      if (selectedTab === "Past") {
        return bDate - aDate;
      }

      return bDate - aDate;
    });

    return sorted.filter((booking) => {
      const status = booking.status || "Booked";
      const bookingDateValue = toDateValue(booking.date);
      const isCancelled = status === "Cancelled";
      const isPast = bookingDateValue < todayValue;
      const isUpcoming = bookingDateValue >= todayValue;

      switch (selectedTab) {
        case "Upcoming":
          return !isCancelled && isUpcoming;
        case "Past":
          return !isCancelled && isPast;
        case "Cancelled":
          return isCancelled;
        case "All":
        default:
          return true;
      }
    });
  }, [bookings, selectedTab]);

  const renderBadge = (status: BookingStatus) => {
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.header}>My Appointments</Text>
          <Text style={styles.subheader}>
            View and manage your advisor appointments
          </Text>
        </View>

        <View style={styles.statusRow}>
          {(["Upcoming", "Past", "Cancelled", "All"] as FilterTab[]).map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.statusChip,
                  selectedTab === tab && styles.activeStatusChip,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    selectedTab === tab && styles.activeStatusChipText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>
              Loading appointments...
            </Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No appointments found</Text>
            <Text style={styles.emptyText}>
              {selectedTab === "Upcoming"
                ? "You have no upcoming appointments."
                : selectedTab === "Past"
                ? "You have no past appointments."
                : selectedTab === "Cancelled"
                ? "You have no cancelled appointments."
                : "No appointments to show."}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking, index) => {
            const bookingStatus = booking.status || "Booked";
            const hasValidMeetingLink =
              booking.mode === "Online" &&
              typeof booking.detail === "string" &&
              booking.detail.trim().startsWith("http");

            return (
              <View
                key={`${booking.advisorId}-${booking.date}-${booking.time}-${index}`}
                style={styles.card}
              >
                <View style={styles.cardAccent} />

                <View style={styles.cardTopRow}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.advisorName}>{booking.advisorName}</Text>
                    <Text style={styles.sessionTypeText}>
                      {booking.mode} Session
                    </Text>
                  </View>

                  {renderBadge(bookingStatus)}
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

                {bookingStatus === "Booked" && selectedTab !== "Past" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancelBooking(booking)}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.cancelButtonText,
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rescheduleButton]}
                      onPress={() => handleReschedule(booking)}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.rescheduleButtonText,
                        ]}
                      >
                        Reschedule
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        hasValidMeetingLink
                          ? styles.joinButton
                          : styles.disabledButton,
                      ]}
                      onPress={() => handleJoinMeeting(booking)}
                      disabled={!hasValidMeetingLink}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          hasValidMeetingLink
                            ? styles.joinButtonText
                            : styles.disabledButtonText,
                        ]}
                      >
                        Join
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {bookingStatus === "Cancelled" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.rescheduleButtonWide,
                      ]}
                      onPress={() => handleReschedule(booking)}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.rescheduleButtonText,
                        ]}
                      >
                        Book Again
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
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", marginBottom: 14 },
  backButtonText: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
  },
  header: { fontSize: 24, fontWeight: "900", color: "#FFFFFF" },
  subheader: {
    fontSize: 14,
    color: "#D1D5DB",
    marginTop: 6,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  statusChip: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  activeStatusChip: {
    backgroundColor: "#111827",
  },
  statusChipText: {
    color: "#374151",
    fontWeight: "800",
  },
  activeStatusChipText: {
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 6,
    height: "100%",
    backgroundColor: "#2563EB",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  advisorName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  sessionTypeText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },
  infoBlock: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
  },
  bookedBadge: {
    backgroundColor: "#DBEAFE",
  },
  bookedBadgeText: {
    color: "#1D4ED8",
  },
  completedBadge: {
    backgroundColor: "#DCFCE7",
  },
  completedBadgeText: {
    color: "#15803D",
  },
  cancelledBadge: {
    backgroundColor: "#FEE2E2",
  },
  cancelledBadgeText: {
    color: "#B91C1C",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 95,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontWeight: "800",
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
  },
  cancelButtonText: {
    color: "#B91C1C",
  },
  rescheduleButton: {
    backgroundColor: "#E0E7FF",
  },
  rescheduleButtonText: {
    color: "#4338CA",
  },
  rescheduleButtonWide: {
    backgroundColor: "#E0E7FF",
    flex: 0,
    minWidth: 140,
  },
  joinButton: {
    backgroundColor: "#DCFCE7",
  },
  joinButtonText: {
    color: "#15803D",
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});