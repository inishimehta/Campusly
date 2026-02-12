import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { Role } from "./roles";

export async function ensureUserProfile(roleIfMissing: Role = "student") {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
        email: user.email,
        role: roleIfMissing,
        isActive: true,
        createdAt: serverTimestamp(),
        });
    }
}

export async function getMyRole(): Promise<Role> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const snap = await getDoc(doc(db, "users", user.uid));
    const role = snap.exists() ? (snap.data().role as Role | undefined) : undefined;

    return role ?? "student";
}

export async function setMyLastLogin() {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { lastLoginAt: serverTimestamp() });
}
