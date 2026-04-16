import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from "react-native";

import { db } from "../../../../firebaseConfig";

const CAMPUS_OPTIONS = [
  { label: "St. James", value: "st_james" },
  { label: "Waterfront", value: "waterfront" },
  { label: "Casa Loma", value: "casaloma" },
];

function formatDateTime(date: Date | null) {
  if (!date) return "Select date and time";
  return date.toLocaleString();
}

export default function EditEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [campus, setCampus] = useState("st_james");
  const [organizer, setOrganizer] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [priceLabel, setPriceLabel] = useState("");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", String(id)));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setLocation(data.location || "");
          setCampus(data.campus || "st_james");
          setOrganizer(data.organizer || "");
          setTags(Array.isArray(data.tags) ? data.tags.join(", ") : "");
          setDescription(data.description || "");
          setImageUrl(data.imageUrl || "");
          setIsFree(data.isFree ?? true);
          setPriceLabel(data.priceLabel || "");

          if (data.date) setStartDate(data.date.toDate());
          if (data.endDate) setEndDate(data.endDate.toDate());
        } else {
          Alert.alert("Error", "Event not found");
          router.back();
        }
      } catch (err) {
        console.error("Load error", err);
        Alert.alert("Error", "Could not load event details.");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const tagsPreview = useMemo(
    () => tags.split(",").map((s) => s.trim()).filter(Boolean),
    [tags]
  );

  const openStartPicker = () => {
    const base = startDate ?? new Date();
    setTempStartDate(base);
    setPickerMode("date");
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    const base = endDate ?? startDate ?? new Date();
    setTempEndDate(base);
    setPickerMode("date");
    setShowEndPicker(true);
  };

  const submit = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert("Missing info", "Please fill Title and Location.");
      return;
    }
    if (!startDate) {
      Alert.alert("Missing info", "Please select an event start date and time.");
      return;
    }
    if (endDate && endDate.getTime() < startDate.getTime()) {
      Alert.alert("Invalid range", "End date must be after the start date.");
      return;
    }
    if (!isFree && !priceLabel.trim()) {
      Alert.alert("Missing info", "Please enter the price details for this event.");
      return;
    }

    const tagsArr = tags.split(",").map((s) => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      await updateDoc(doc(db, "events", String(id)), {
        title: title.trim(),
        location: location.trim(),
        campus,
        organizer: organizer.trim(),
        tags: tagsArr,
        description: description.trim(),
        date: Timestamp.fromDate(startDate),
        endDate: endDate ? Timestamp.fromDate(endDate) : null,
        imageUrl: imageUrl.trim(),
        isFree,
        priceLabel: isFree ? "" : priceLabel.trim(),
      });

      Alert.alert("Success", "Event updated successfully!");
      router.back();
    } catch (e: any) {
      console.log("Update error:", e);
      Alert.alert("Error", e?.message || "Could not update event.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      if (!selected) {
        setShowStartPicker(false);
        return;
      }
      if (pickerMode === "date") {
        const next = new Date(tempStartDate);
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setTempStartDate(next);
        setPickerMode("time");
        return;
      }
      const next = new Date(tempStartDate);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setTempStartDate(next);
      setStartDate(next);
      setShowStartPicker(false);
      if (endDate && endDate.getTime() < next.getTime()) {
        setEndDate(null);
      }
      return;
    }
    if (selected) setTempStartDate(selected);
  };

  const handleEndChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      if (!selected) {
        setShowEndPicker(false);
        return;
      }
      if (pickerMode === "date") {
        const next = new Date(tempEndDate);
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setTempEndDate(next);
        setPickerMode("time");
        return;
      }
      const next = new Date(tempEndDate);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setTempEndDate(next);
      setEndDate(next);
      setShowEndPicker(false);
      return;
    }
    if (selected) setTempEndDate(selected);
  };

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Edit Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Location *</Text>
        <TextInput value={location} onChangeText={setLocation} style={styles.input} />

        <Text style={styles.label}>Campus</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={campus} onValueChange={(v) => setCampus(String(v))} style={styles.picker}>
            {CAMPUS_OPTIONS.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Organizer</Text>
        <TextInput value={organizer} onChangeText={setOrganizer} style={styles.input} />

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput value={tags} onChangeText={setTags} style={styles.input} />
        {tagsPreview.length > 0 && <Text style={styles.helperText}>Preview: {tagsPreview.join(", ")}</Text>}

        <Text style={styles.label}>Event Start *</Text>
        <Pressable style={styles.selectorBtn} onPress={openStartPicker}>
          <Text style={styles.selectorText}>{startDate ? formatDateTime(startDate) : "Select date and time"}</Text>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
        </Pressable>

        <Text style={styles.label}>Event End</Text>
        <Pressable style={styles.selectorBtn} onPress={openEndPicker}>
          <Text style={styles.selectorText}>{endDate ? formatDateTime(endDate) : "Optional end date and time"}</Text>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
        </Pressable>

        <Text style={styles.label}>Image URL</Text>
        <TextInput value={imageUrl} onChangeText={setImageUrl} style={styles.input} autoCapitalize="none" />

        <Text style={styles.label}>Free Event</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{isFree ? "Yes, this event is free" : "No, this is a paid event"}</Text>
          <Switch value={isFree} onValueChange={setIsFree} />
        </View>

        {!isFree && (
          <>
            <Text style={styles.label}>Price Details *</Text>
            <TextInput value={priceLabel} onChangeText={setPriceLabel} style={styles.input} />
          </>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.textarea]} multiline />

        <Pressable style={styles.submitBtn} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Save Changes</Text>}
        </Pressable>
      </ScrollView>

      {showStartPicker && Platform.OS === "android" && (
        <DateTimePicker value={tempStartDate} mode={pickerMode} is24Hour={false} onChange={handleStartChange} />
      )}
      {showEndPicker && Platform.OS === "android" && (
        <DateTimePicker value={tempEndDate} mode={pickerMode} is24Hour={false} onChange={handleEndChange} />
      )}
      {showStartPicker && Platform.OS === "ios" && (
        <View style={styles.iosPickerSheet}>
          <View style={styles.iosPickerHeader}>
            <Pressable onPress={() => setShowStartPicker(false)}><Text style={styles.sheetBtn}>Cancel</Text></Pressable>
            <Text style={styles.sheetTitle}>Start Date</Text>
            <Pressable onPress={() => { setStartDate(tempStartDate); setShowStartPicker(false); if (endDate && endDate.getTime() < tempStartDate.getTime()) setEndDate(null); }}>
              <Text style={styles.sheetBtn}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker value={tempStartDate} mode="datetime" display="spinner" onChange={handleStartChange} />
        </View>
      )}
      {showEndPicker && Platform.OS === "ios" && (
        <View style={styles.iosPickerSheet}>
          <View style={styles.iosPickerHeader}>
            <Pressable onPress={() => setShowEndPicker(false)}><Text style={styles.sheetBtn}>Cancel</Text></Pressable>
            <Text style={styles.sheetTitle}>End Date</Text>
            <Pressable onPress={() => { setEndDate(tempEndDate); setShowEndPicker(false); }}>
              <Text style={styles.sheetBtn}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker value={tempEndDate} mode="datetime" display="spinner" onChange={handleEndChange} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  form: { padding: 16, gap: 10, paddingBottom: 40 },
  label: { fontWeight: "900", color: "#111827", marginTop: 6 },
  input: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, fontWeight: "700", color: "#111827", borderWidth: 1, borderColor: "#E5E7EB" },
  pickerWrap: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
  picker: { color: "#111827" },
  selectorBtn: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectorText: { color: "#111827", fontWeight: "700", flex: 1, marginRight: 12 },
  helperText: { color: "#6B7280", fontWeight: "600", marginTop: -2 },
  switchRow: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  switchText: { color: "#111827", fontWeight: "700", flex: 1 },
  textarea: { height: 130, textAlignVertical: "top" },
  submitBtn: { marginTop: 12, backgroundColor: "#0B0F1A", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  submitText: { color: "white", fontWeight: "900" },
  iosPickerSheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", paddingBottom: 20 },
  iosPickerHeader: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  sheetBtn: { color: "#1D4ED8", fontWeight: "800" },
  sheetTitle: { color: "#111827", fontWeight: "900" },
});