import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, increment, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { auth, db } from "../../../../firebaseConfig";

export default function RSVPForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to RSVP.");
      return;
    }
    
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const eventRef = doc(db, "events", String(id));
      const rsvpRef = doc(eventRef, "rsvps", userId);

      // 1. Save the RSVP in the subcollection
      await setDoc(rsvpRef, {
        userId: userId,
        name: name.trim(),
        notes: notes.trim(),
        email: auth.currentUser.email,
        timestamp: new Date()
      });

      // 2. Increment the attending count on the main event document
      await updateDoc(eventRef, {
        attending: increment(1)
      });

      Alert.alert("RSVP Confirmed!", "You are on the list.");
      router.back();
    } catch (error: any) {
      console.error("RSVP Error:", error);
      Alert.alert("Error", "You have already RSVPed to the event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>RSVP</Text>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={styles.label}>Your Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Any message for the organizer?"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          multiline
        />

        <Pressable style={styles.btn} onPress={submit} disabled={loading}>
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Confirm RSVP</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  label: { fontWeight: "900", color: "#111827" },
  input: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, fontWeight: "700", color: "#111827" },
  btn: { marginTop: 8, backgroundColor: "#0B0F1A", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900" },
});