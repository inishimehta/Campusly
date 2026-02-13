import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { addStudyGroup, listenStudyGroups, type StudyGroup } from "../../../lib/studyGroupsApi";
import { styles } from "../../../styles/studyGroups.styles";

type ChipKey = "All" | "By Course" | "Online" | "In-Person" | "Open Spots";

export default function StudyGroups() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [chip, setChip] = useState<ChipKey>("All");
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState<"Online" | "In-Person">("Online");
  const [time, setTime] = useState("");
  const [peopleMax, setPeopleMax] = useState("6");
  const [tagsText, setTagsText] = useState("Open Spots,Today");

  useEffect(() => {
    const unsub = listenStudyGroups(setGroups);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return groups.filter((g) => {
      const matchesText =
        !text ||
        g.title.toLowerCase().includes(text) ||
        g.course.toLowerCase().includes(text) ||
        g.location.toLowerCase().includes(text) ||
        g.tags.join(" ").toLowerCase().includes(text);

      const openSpots = g.peopleNow < g.peopleMax;

      const matchesChip =
        chip === "All" ||
        chip === "By Course" ||
        (chip === "Online" && g.mode === "Online") ||
        (chip === "In-Person" && g.mode === "In-Person") ||
        (chip === "Open Spots" && openSpots);

      return matchesText && (chip === "All" || matchesChip);
    });
  }, [q, chip, groups]);

  const resetCreateForm = () => {
    setTitle("");
    setCourse("");
    setDesc("");
    setLocation("");
    setTime("");
    setPeopleMax("6");
    setTagsText("Open Spots,Today");
    setMode("Online");
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Study Groups</Text>

        <Pressable onPress={() => setCreateOpen(true)} style={styles.iconBtn}>
          <Ionicons name="add" size={22} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search study groups..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={{ maxHeight: 46 }}
      >
        {(["All", "By Course", "Online", "In-Person", "Open Spots"] as ChipKey[]).map((c) => {
          const active = c === chip;
          return (
            <Pressable
              key={c}
              onPress={() => setChip(c)}
              style={[styles.chip, active && styles.chipActive, { alignSelf: "flex-start" }]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map((g) => (
          <Pressable
            key={g.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/study-groups/[id]",
                params: { id: g.id },
              })
            }
          >
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{g.title}</Text>
                <Text style={styles.course}>{g.course}</Text>
              </View>

              <View style={styles.people}>
                <Ionicons name="people-outline" size={18} color="#6B7280" />
                <Text style={styles.peopleText}>
                  {g.peopleNow}/{g.peopleMax}
                </Text>
              </View>
            </View>

            <Text style={styles.desc}>{g.desc}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{g.location}</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{g.mode}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{g.time}</Text>
            </View>

            <View style={styles.tagsRow}>
              {g.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>View details</Text>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 18 }} />
      </ScrollView>

      {/* Create Group Modal */}
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={(e) => {
            if (e.target === e.currentTarget) {
              setCreateOpen(false);
              resetCreateForm();
            }
          }}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create study group</Text>

            <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.modalInput} />
            <TextInput
              value={course}
              onChangeText={setCourse}
              placeholder="Course (e.g., COMP 3059)"
              style={styles.modalInput}
            />
            <TextInput value={desc} onChangeText={setDesc} placeholder="Description" style={styles.modalInput} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Location (Zoom / Library…)"
              style={styles.modalInput}
            />
            <TextInput value={time} onChangeText={setTime} placeholder="Time (e.g., Today, 6:00 PM)" style={styles.modalInput} />
            <TextInput
              value={peopleMax}
              onChangeText={setPeopleMax}
              placeholder="Max people (e.g., 6)"
              keyboardType="number-pad"
              style={styles.modalInput}
            />
            <TextInput value={tagsText} onChangeText={setTagsText} placeholder="Tags (comma separated)" style={styles.modalInput} />

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setMode("Online")}
                style={[styles.modeBtn, mode === "Online" && styles.modeBtnActive]}
              >
                <Text style={[styles.modeText, mode === "Online" && styles.modeTextActive]}>Online</Text>
              </Pressable>

              <Pressable
                onPress={() => setMode("In-Person")}
                style={[styles.modeBtn, mode === "In-Person" && styles.modeBtnActive]}
              >
                <Text style={[styles.modeText, mode === "In-Person" && styles.modeTextActive]}>In-Person</Text>
              </Pressable>
            </View>

            {/* CHANGED: removed peopleNow + navigate to the created group */}
            <Pressable
              style={styles.modalPrimary}
              onPress={async () => {
                const max = Math.max(1, Number(peopleMax) || 1);
                const tags = tagsText
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);

                const newId = await addStudyGroup({
                  title: title.trim() || "New Study Group",
                  course: course.trim() || "TBD 0000",
                  desc: desc.trim() || "Created by students.",
                  location: location.trim() || "TBD",
                  mode,
                  time: time.trim() || "TBD",
                  peopleMax: max,
                  tags: tags.length ? tags : ["Open Spots"],
                });

                setCreateOpen(false);
                resetCreateForm();

                router.push(`/study-groups/${newId}`);
              }}
            >
              <Text style={styles.modalPrimaryText}>Create</Text>
            </Pressable>

            <Pressable
              style={styles.modalCancel}
              onPress={() => {
                setCreateOpen(false);
                resetCreateForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
