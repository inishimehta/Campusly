import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
import { db } from "../../../firebaseConfig";

type CampusKey = "stjames" | "waterfront" | "casaloma";

export default function NewPlace() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [campus, setCampus] = useState<CampusKey>("stjames");
  const [rating, setRating] = useState("4.5");
  const [reviewsCount, setReviewsCount] = useState("100");
  const [tags, setTags] = useState("Study, Quiet, Resources");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");

  const canSave = useMemo(() => name.trim().length >= 2 && desc.trim().length >= 10, [name, desc]);

  async function onSave() {
    if (!canSave) {
      Alert.alert("Fill required fields", "Name and About are required.");
      return;
    }

    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const ratingNum = Number(rating);
    const reviewsNum = Number(reviewsCount);

    try {
      await addDoc(collection(db, "places"), {
        name: name.trim(),
        campus, // IMPORTANT: must be stjames / waterfront / casaloma
        rating: Number.isFinite(ratingNum) ? ratingNum : 0,
        reviewsCount: Number.isFinite(reviewsNum) ? reviewsNum : 0,
        tags: tagArr,
        desc: desc.trim(),
        imageUrl: imageUrl.trim(),
        address: address.trim(),
        phone: phone.trim(),
        hours: hours.trim(),
        createdAt: serverTimestamp(),
      });

      Alert.alert("Saved", "Place added successfully!");
      router.back();
    } catch (e: any) {
      console.log("add place error", e);
      Alert.alert("Error", e?.message || "Could not add place.");
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Add Place</Text>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && { opacity: 0.5 }]}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Field label="Name *" value={name} onChangeText={setName} placeholder="Main Library" />
        <CampusPicker campus={campus} setCampus={setCampus} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Rating"
              value={rating}
              onChangeText={setRating}
              placeholder="4.7"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field
              label="Reviews"
              value={reviewsCount}
              onChangeText={setReviewsCount}
              placeholder="240"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Field
          label="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          placeholder="Food, Social, Events"
        />

        <Field
          label="About *"
          value={desc}
          onChangeText={setDesc}
          placeholder="Describe the place..."
          multiline
          minHeight={110}
        />

        <Field label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="230 King St E..." />
        <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="(416) 415-2000" />
        <Field label="Hours" value={hours} onChangeText={setHours} placeholder="Mon-Fri: 9am-5pm" />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function Field(props: any) {
  const { label, minHeight, ...rest } = props;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, minHeight ? { height: minHeight, textAlignVertical: "top" } : null]}
      />
    </View>
  );
}

function CampusPicker({
  campus,
  setCampus,
}: {
  campus: "stjames" | "waterfront" | "casaloma";
  setCampus: (c: any) => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>Campus</Text>
      <View style={styles.pills}>
        {[
          { key: "stjames", label: "St. James" },
          { key: "waterfront", label: "Waterfront" },
          { key: "casaloma", label: "Casa Loma" },
        ].map((c) => {
          const active = campus === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCampus(c.key)}
              style={[styles.campusPill, active && styles.campusPillActive]}
            >
              <Text style={[styles.campusText, active && styles.campusTextActive]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827", flex: 1 },
  saveBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveText: { color: "#fff", fontWeight: "900" },

  scroll: { paddingHorizontal: 16, paddingTop: 10 },

  label: { fontWeight: "900", color: "#111827", marginBottom: 6 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "700",
    color: "#111827",
  },

  row: { flexDirection: "row" },

  pills: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  campusPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  campusPillActive: { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
  campusText: { fontWeight: "900", color: "#111827" },
  campusTextActive: { color: "#1D4ED8" },
});
