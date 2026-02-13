import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../../../../firebaseConfig";
import {
  listenGroupMessages,
  sendGroupMessage,
  type ChatMessage,
} from "../../../../lib/studyGroupsApi";
import { styles } from "../../../../styles/studyGroups.styles";

function formatSender(emailOrNull: string | null) {
  if (!emailOrNull) return "Unknown";
  return emailOrNull.split("@")[0] ?? emailOrNull;
}

function formatTime(ts: any) {
  if (!ts || typeof ts.toDate !== "function") return "";
  const d = ts.toDate() as Date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function StudyGroupChat() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = typeof id === "string" ? id : "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const myUid = auth.currentUser?.uid ?? null;

  useEffect(() => {
    if (!groupId) return;
    const unsub = listenGroupMessages(groupId, setMessages);
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages.length]);

  const canSend = useMemo(() => text.trim().length > 0 && !busy, [text, busy]);

  return (
    <KeyboardAvoidingView
      style={styles.chatWrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, paddingBottom: 6 }}>
        <ScrollView
          ref={(r) => (scrollRef.current = r)}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.chatEmptyWrap}>
              <Text style={styles.chatEmptyText}>No messages yet — say hi.</Text>
            </View>
          ) : null}

          {messages.map((m) => {
            const mine = myUid != null && m.senderUid === myUid;
            const timeText = formatTime(m.createdAt);

            return (
              <View
                key={m.id}
                style={[styles.chatMsgRow, mine ? styles.chatMsgMine : styles.chatMsgTheirs]}
              >
                <Text
                  style={[
                    styles.chatSender,
                    mine ? styles.chatSenderMine : styles.chatSenderTheirs,
                  ]}
                  numberOfLines={1}
                >
                  {mine ? "You" : formatSender(m.senderEmail)}
                </Text>

                <View
                  style={[
                    styles.chatBubble,
                    mine ? styles.chatBubbleMine : styles.chatBubbleTheirs,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatText,
                      mine ? styles.chatTextMine : styles.chatTextTheirs,
                    ]}
                  >
                    {m.text}
                  </Text>

                  {/* Time under message */}
                  {timeText ? (
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        fontWeight: "700",
                        opacity: 0.75,
                        color: mine ? "#E5E7EB" : "#6B7280",
                        textAlign: mine ? "right" : "left",
                      }}
                    >
                      {timeText}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}

          <View style={{ height: 8 }} />
        </ScrollView>

        <View style={styles.chatInputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor="#6B7280"
            style={styles.chatInput}
            multiline
          />

          <Pressable
            disabled={!canSend}
            onPress={async () => {
              if (!groupId) return;
              setBusy(true);
              try {
                await sendGroupMessage(groupId, text);
                setText("");
              } finally {
                setBusy(false);
              }
            }}
            style={[styles.chatSendBtn, !canSend && styles.chatSendBtnDisabled]}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
