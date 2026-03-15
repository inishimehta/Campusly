import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

export default function RequestEvent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [campus, setCampus] = useState("st_james");
  const [tags, setTags] = useState("Clubs, Free");
  const [description, setDescription] = useState("");

  const submit = async () => {
    console.log("Submit button pressed");

    if (!auth.currentUser?.uid) {
      Alert.alert("Login required", "Please log in before submitting an event request.");
      return;
    }

    if (!title.trim() || !location.trim()) {
      Alert.alert("Missing info", "Please fill Title and Location.");
      return;
    }

    try {
      const tagsArr = tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await addDoc(collection(db, "event_requests"), {
        title: title.trim(),
        location: location.trim(),
        campus: campus.trim(),
        tags: tagsArr,
        description: description.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        requestedBy: auth.currentUser.uid,
        requestedByEmail: auth.currentUser.email ?? null,
      });

      Alert.alert("Submitted", "Your event request has been submitted.");
      router.back();
    } catch (e: any) {
      console.log("Submit error:", e);
      Alert.alert("Error", e?.message || "Could not submit request.");
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Request an Event</Text>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Event title"
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          placeholder="Where is it?"
        />

        <Text style={styles.label}>Campus</Text>
        <TextInput
          value={campus}
          onChangeText={setCampus}
          style={styles.input}
          placeholder="st_james / waterfront / casaloma"
        />

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          value={tags}
          onChangeText={setTags}
          style={styles.input}
          placeholder="Clubs, Academic, Free"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 130, textAlignVertical: "top" }]}
          placeholder="Details about the event..."
          multiline
        />

        <Pressable style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </Pressable>

        <Text style={styles.hint}>
          Requests go to admins for approval.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
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
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },

  form: { padding: 16, gap: 10 },
  label: { fontWeight: "900", color: "#111827", marginTop: 6 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "700",
    color: "#111827",
  },

  submitBtn: {
    marginTop: 12,
    backgroundColor: "#0B0F1A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "900" },

  hint: { color: "#6B7280", fontWeight: "600", marginTop: 8 },
});