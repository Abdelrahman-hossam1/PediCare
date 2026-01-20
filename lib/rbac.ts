export type Role = "ADMIN" | "DOCTOR" | "RECEPTIONIST";

/**
 * Centralized RBAC rules
 */
export const RBAC = {
    canRead: (role: Role | string | null): boolean => {
        if (!role) return false;
        // All roles can read
        return ["ADMIN", "DOCTOR", "RECEPTIONIST"].includes(role);
    },

    canWrite: (role: Role | string | null): boolean => {
        if (!role) return false;
        // Only ADMIN and DOCTOR can write (POST, PATCH, DELETE)
        return ["ADMIN", "DOCTOR"].includes(role);
    },
};

export function canRead(role: Role | string | null): boolean {
    return RBAC.canRead(role);
}

export function canWrite(role: Role | string | null): boolean {
    return RBAC.canWrite(role);
}
