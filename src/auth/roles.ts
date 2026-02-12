export type Role = "student" | "staff" | "advisor" | "admin";

export function isGeorgeBrownEmail(email: string) {
    return /^[^@\s]+@georgebrown\.ca$/i.test(email.trim());
}
