import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function RSVPForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    // ✅ UI only — no Firestore, no auth changes
    Alert.alert("RSVP Submitted", "This is a demo screen only (no database write).");
    router.back();
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
        <Text style={styles.subtitle}>Event ID: {String(id)}</Text>

        <Text style={styles.label}>Your name</Text>
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

        <Pressable style={styles.btn} onPress={submit}>
          <Text style={styles.btnText}>Confirm RSVP</Text>
        </Pressable>

        <Text style={styles.hint}>
          This screen is UI-only right now. Later we can connect it to Firestore without changing your auth flow.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },

  subtitle: { color: "#6B7280", fontWeight: "700" },

  label: { fontWeight: "900", color: "#111827" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "700",
    color: "#111827",
  },

  btn: {
    marginTop: 8,
    backgroundColor: "#0B0F1A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "900" },

  hint: { color: "#6B7280", fontWeight: "600", marginTop: 6, lineHeight: 18 },
});
