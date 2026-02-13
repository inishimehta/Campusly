import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48 },

  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800", color: "#111827" },

  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#EFEFF2",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#111827", fontWeight: "600" },

  chipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
    alignItems: "center",
    // Added: makes the row height stable and avoids weird stretching in some layouts
    minHeight: 46,
  },
  
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    // Added: ensure chip sizes to its content and never stretches
    alignSelf: "flex-start",
  },

  chipActive: { backgroundColor: "#2F80FF" },
  
  chipText: {
    fontWeight: "800",
    color: "#111827",
    fontSize: 13,

    // Added: prevents text from pushing height / wrapping
    includeFontPadding: false,
  },
  
  chipTextActive: { color: "#FFFFFF" },

  list: { paddingHorizontal: 16, paddingTop: 6, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14 },

  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  course: { marginTop: 4, color: "#2563EB", fontWeight: "800" },

  people: { flexDirection: "row", alignItems: "center", gap: 6 },
  peopleText: { color: "#111827", fontWeight: "800" },

  desc: { marginTop: 10, color: "#374151", fontWeight: "500", lineHeight: 20 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" },
  metaText: { color: "#374151", fontWeight: "600" },

  pill: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { color: "#111827", fontWeight: "800" },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  tag: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { color: "#111827", fontWeight: "700" },

  primaryBtn: { marginTop: 12, backgroundColor: "#0B0B16", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900" },

  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalInput: { backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },

  modeRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  modeBtn: { flex: 1, backgroundColor: "#EEF2FF", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  modeBtnActive: { backgroundColor: "#1D4ED8" },
  modeText: { fontWeight: "900", color: "#1D4ED8" },
  modeTextActive: { color: "#FFFFFF" },

  modalPrimary: { backgroundColor: "#0B0B16", borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  modalPrimaryText: { color: "#FFFFFF", fontWeight: "900" },
  modalCancel: { paddingVertical: 12, alignItems: "center" },
  modalCancelText: { color: "#6B7280", fontWeight: "800" },

  // Details screen
  loading: { marginTop: 20, color: "#6B7280", fontWeight: "700" },
  detailsPage: { flex: 1, backgroundColor: "#F6F7FB", paddingTop: 48, paddingHorizontal: 16 },
  detailsCard: { marginTop: 10, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14 },
  h1: { fontSize: 20, fontWeight: "900", color: "#111827" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  rowText: { color: "#111827", fontWeight: "700" },
  secondaryBtn: { marginTop: 10, backgroundColor: "#EEF2FF", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  secondaryBtnText: { color: "#1D4ED8", fontWeight: "900" },

  // ---------- Chat styles ----------
  chatWrap: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 48,
    paddingHorizontal: 12,
  },

  chatEmptyWrap: { paddingTop: 24, alignItems: "center" },
  chatEmptyText: { color: "#6B7280", fontWeight: "700" },

  chatScrollContent: { paddingVertical: 8 },

  chatMsgRow: { marginTop: 10, maxWidth: "86%" },
  chatMsgMine: { alignSelf: "flex-end" },
  chatMsgTheirs: { alignSelf: "flex-start" },

  chatSender: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 6,
  },
  chatSenderMine: { textAlign: "right", marginRight: 4 },
  chatSenderTheirs: { textAlign: "left", marginLeft: 4 },

  chatBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chatBubbleMine: { backgroundColor: "#1D4ED8" },
  chatBubbleTheirs: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  chatText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  chatTextMine: { color: "#FFFFFF" },
  chatTextTheirs: { color: "#111827" },

  chatTime: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    opacity: 0.75,
  },
  chatTimeMine: { color: "#E5E7EB", textAlign: "right" },
  chatTimeTheirs: { color: "#6B7280", textAlign: "left" },

  chatInputBar: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  chatInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: "#111827",
    fontWeight: "600",
  },

  chatSendBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1D4ED8",
  },
  chatSendBtnDisabled: { backgroundColor: "#9CA3AF" },

});
