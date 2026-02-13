import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  limit,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

export type StudyGroup = {
  id: string;
  title: string;
  course: string;
  desc: string;
  location: string;
  mode: "Online" | "In-Person";
  time: string;
  peopleNow: number;
  peopleMax: number;
  tags: string[];
  createdAt: number; // Date.now()
  createdBy: string | null;
};

export type GroupMember = {
  uid: string;
  email: string | null;
  joinedAt: Timestamp | null;
};

export type ChatMessage = {
  id: string;
  text: string;
  senderUid: string;
  senderEmail: string | null;
  createdAt: Timestamp | null;
};

const groupsCol = collection(db, "studyGroups");

function membersCol(groupId: string) {
  return collection(db, "studyGroups", groupId, "members");
}

function messagesCol(groupId: string) {
  return collection(db, "studyGroups", groupId, "messages");
}

async function getMyEmail(): Promise<string | null> {
  const u = auth.currentUser;
  if (!u) return null;

  // Prefer users/{uid}.email if present, fallback to auth email.
  try {
    const snap = await getDoc(doc(db, "users", u.uid));
    const data = snap.exists() ? (snap.data() as any) : null;
    return (data?.email as string | undefined) ?? u.email ?? null;
  } catch {
    return u.email ?? null;
  }
}

export function listenStudyGroups(
  cb: (groups: StudyGroup[]) => void,
  onErr?: (e: any) => void
): Unsubscribe {
  const q = query(groupsCol, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const rows: StudyGroup[] = snap.docs.map((d) => {
        const data = d.data() as Omit<StudyGroup, "id">;
        return { id: d.id, ...data };
      });
      cb(rows);
    },
    (e) => onErr?.(e)
  );
}

export async function addStudyGroup(
  input: Omit<StudyGroup, "id" | "createdAt" | "createdBy" | "peopleNow">
): Promise<string> {
  const u = auth.currentUser;
  if (!u) throw new Error("You must be signed in to create a group.");

  const email = await getMyEmail();

  // Create group with peopleNow=1 because creator is auto-joined
  const groupRef = await addDoc(groupsCol, {
    ...input,
    peopleNow: 1,
    createdAt: Date.now(),
    createdBy: u.uid,
  });

  // Add creator to members
  await setDoc(doc(db, "studyGroups", groupRef.id, "members", u.uid), {
    email: email ?? null,
    joinedAt: serverTimestamp(),
  });

  return groupRef.id;
}

export async function getStudyGroup(id: string): Promise<StudyGroup | null> {
  const snap = await getDoc(doc(db, "studyGroups", id));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<StudyGroup, "id">;
  return { id: snap.id, ...data };
}

/**
 * Membership (self) — fixes "joined disappears after coming back"
 * Requires rules: allow get on /members/{uid} for the signed-in user.
 */
export function listenMyMembership(
  groupId: string,
  uid: string,
  cb: (isMember: boolean) => void,
  onErr?: (e: any) => void
): Unsubscribe {
  const ref = doc(db, "studyGroups", groupId, "members", uid);
  return onSnapshot(
    ref,
    (snap) => cb(snap.exists()),
    (e) => onErr?.(e)
  );
}

/**
 * Members list (realtime) — will permission-deny unless the caller is a member.
 */
export function listenGroupMembers(
  groupId: string,
  cb: (members: GroupMember[]) => void,
  onErr?: (e: any) => void
): Unsubscribe {
  const q = query(membersCol(groupId), orderBy("joinedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const rows: GroupMember[] = snap.docs.map((d) => {
        const data = d.data() as Omit<GroupMember, "uid">;
        return { uid: d.id, ...data };
      });
      cb(rows);
    },
    (e) => onErr?.(e)
  );
}

export async function isMember(groupId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "studyGroups", groupId, "members", uid));
  return snap.exists();
}

/**
 * Chat messages (realtime) — will permission-deny unless the caller is a member.
 * You can pass an error callback to avoid "Uncaught error in snapshot listener". [web:227]
 */
export function listenGroupMessages(
  groupId: string,
  cb: (messages: ChatMessage[]) => void,
  onErr?: (e: any) => void
): Unsubscribe {
  const q = query(messagesCol(groupId), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(
    q,
    (snap) => {
      const rows: ChatMessage[] = snap.docs.map((d) => {
        const data = d.data() as Omit<ChatMessage, "id">;
        return { id: d.id, ...data };
      });
      cb(rows);
    },
    (e) => onErr?.(e)
  );
}

export async function sendGroupMessage(groupId: string, textRaw: string) {
  const u = auth.currentUser;
  if (!u) throw new Error("You must be signed in to send messages.");

  const text = textRaw.trim();
  if (!text) return;

  const email = await getMyEmail();

  await addDoc(messagesCol(groupId), {
    text,
    senderUid: u.uid,
    senderEmail: email,
    createdAt: serverTimestamp(),
  });
}

/**
 * Join/Leave — creates/deletes members/{uid} and adjusts peopleNow safely
 * Uses a transaction so capacity is enforced correctly under concurrency.
 */
export async function joinStudyGroup(groupId: string) {
  const u = auth.currentUser;
  if (!u) throw new Error("You must be signed in to join.");

  const email = await getMyEmail();
  const groupRef = doc(db, "studyGroups", groupId);
  const memberRef = doc(db, "studyGroups", groupId, "members", u.uid);

  await runTransaction(db, async (tx) => {
    const [groupSnap, memberSnap] = await Promise.all([tx.get(groupRef), tx.get(memberRef)]);

    if (!groupSnap.exists()) throw new Error("Group not found.");

    const g = groupSnap.data() as any;
    const peopleNow = Number(g.peopleNow ?? 0);
    const peopleMax = Number(g.peopleMax ?? 0);

    // Already a member: no-op (prevents double join)
    if (memberSnap.exists()) return;

    if (peopleMax > 0 && peopleNow >= peopleMax) {
      throw new Error("Group is full.");
    }

    tx.set(memberRef, {
      email: email ?? null,
      joinedAt: serverTimestamp(),
    });

    tx.update(groupRef, { peopleNow: peopleNow + 1 });
  });
}

export async function leaveStudyGroup(groupId: string) {
  const u = auth.currentUser;
  if (!u) throw new Error("You must be signed in to leave.");

  const groupRef = doc(db, "studyGroups", groupId);
  const memberRef = doc(db, "studyGroups", groupId, "members", u.uid);

  await runTransaction(db, async (tx) => {
    const [groupSnap, memberSnap] = await Promise.all([tx.get(groupRef), tx.get(memberRef)]);

    if (!groupSnap.exists()) throw new Error("Group not found.");

    // Not a member: no-op
    if (!memberSnap.exists()) return;

    const g = groupSnap.data() as any;
    const peopleNow = Math.max(0, Number(g.peopleNow ?? 0));

    tx.delete(memberRef);
    tx.update(groupRef, { peopleNow: Math.max(0, peopleNow - 1) });
  });
}
