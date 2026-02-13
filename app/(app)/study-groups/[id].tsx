import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { auth } from "../../../firebaseConfig";
import {
  getStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  listenGroupMembers,
  listenMyMembership,
  type GroupMember,
  type StudyGroup,
} from "../../../lib/studyGroupsApi";
import { styles } from "../../../styles/studyGroups.styles";

export default function StudyGroupDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = typeof id === "string" ? id : "";

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [busy, setBusy] = useState(false);

  const [amMember, setAmMember] = useState(false);

  const myUid = auth.currentUser?.uid ?? null;

  async function load() {
    if (!groupId) return;
    setGroup(await getStudyGroup(groupId));
  }

  useEffect(() => {
    load();
  }, [groupId]);

  // 1) Membership state (works after leaving and coming back)
  useEffect(() => {
    if (!groupId || !myUid) {
      setAmMember(false);
      return;
    }

    const unsub = listenMyMembership(groupId, myUid, setAmMember, (e) => {
      console.log("listenMyMembership error", e?.code, e?.message);
      setAmMember(false);
    });

    return () => unsub();
  }, [groupId, myUid]);

  // 2) Members list (only allowed when you're a member)
  useEffect(() => {
    if (!groupId) return;
    if (!amMember) {
      setMembers([]);
      return;
    }

    const unsub = listenGroupMembers(groupId, setMembers, (e) => {
      console.log("listenGroupMembers error", e?.code, e?.message);
    });

    return () => unsub();
  }, [groupId, amMember]);

  if (!group) {
    return (
      <View style={styles.detailsPage}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.title}>Study Group</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const isFull = group.peopleNow >= group.peopleMax;

  return (
    <View style={styles.detailsPage}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Study Group</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.h1}>{group.title}</Text>
        <Text style={styles.course}>{group.course}</Text>

        <Text style={styles.desc}>{group.desc}</Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.rowText}>{group.location}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.rowText}>{group.time}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="people-outline" size={18} color="#6B7280" />
          <Text style={styles.rowText}>
            {group.peopleNow}/{group.peopleMax}
          </Text>
        </View>

        {/* Members */}
        <View style={{ marginTop: 14 }}>
          <Text style={{ fontWeight: "900", color: "#111827", marginBottom: 8 }}>Members</Text>

          {!amMember ? (
            <Text style={{ color: "#6B7280", fontWeight: "600" }}>
              Join this group to see the members.
            </Text>
          ) : members.length === 0 ? (
            <Text style={{ color: "#6B7280", fontWeight: "600" }}>No one has joined yet.</Text>
          ) : (
            members.slice(0, 6).map((m) => (
              <Text key={m.uid} style={{ color: "#111827", fontWeight: "700", marginBottom: 6 }}>
                • {m.email ?? "Unknown"}
              </Text>
            ))
          )}

          {amMember && members.length > 6 ? (
            <Text style={{ color: "#6B7280", fontWeight: "600" }}>+ {members.length - 6} more</Text>
          ) : null}
        </View>

        {/* Chat */}
        <Pressable
          style={[styles.secondaryBtn, { marginTop: 14 }]}
          onPress={() => {
            if (!amMember) {
              Alert.alert("Join to chat", "You need to join this study group before you can access the chat.");
              return;
            }
            router.push(`/study-groups/${group.id}/chat`);
          }}
        >
          <Text style={styles.secondaryBtnText}>Open chat</Text>
        </Pressable>

        {/* Join / Leave */}
        {!amMember ? (
          <Pressable
            style={[styles.primaryBtn, (isFull || busy) && { opacity: 0.6 }]}
            disabled={isFull || busy}
            onPress={async () => {
              setBusy(true);
              try {
                await joinStudyGroup(group.id);
                await load();
              } catch (e: any) {
                Alert.alert("Error", e?.message ?? "Could not join the group.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Text style={styles.primaryBtnText}>
              {isFull ? "Group full" : busy ? "Joining..." : "Join group"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.primaryBtn, busy && { opacity: 0.6 }]}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await leaveStudyGroup(group.id);
                await load();
              } catch (e: any) {
                Alert.alert("Error", e?.message ?? "Could not leave the group.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Text style={styles.primaryBtnText}>{busy ? "Leaving..." : "Leave group"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
