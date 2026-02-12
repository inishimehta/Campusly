import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export type RoleRequestStatus = "pending" | "approved" | "rejected";

export type LatestRoleRequest = {
    id: string;
    status: RoleRequestStatus;
    requestedRole?: "staff" | "advisor";
    reviewedAt?: any;
    };

    export async function getLatestRoleRequestForMe(): Promise<LatestRoleRequest | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const q = query(
        collection(db, "roleRequests"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    const d = snap.docs[0];
    const data = d.data() as any;

    return {
        id: d.id,
        status: data.status,
        requestedRole: data.requestedRole,
        reviewedAt: data.reviewedAt,
    };
}
