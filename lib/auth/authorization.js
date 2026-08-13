
import { ROLES } from "@/constants/roles";

export const hasRole = (userRole, allowedRoles = []) => {
    return allowedRoles.includes(userRole);
};

export const requireRole = (session, allowedRoles = []) => {
    if (!session) {
        return {
            authorized: false,
            status: 401,
            message: "Authentication required",
        };
    }

    if (!hasRole(session.role, allowedRoles)) {
        return {
            authorized: false,
            status: 403,
            message: "You do not have permission to perform this action",
        };
    }

    return {
        authorized: true,
        status: 200,
        message: "Authorized",
    };
};

export const canManageUsers = (role) => {
    return role === ROLES.ADMIN;
};

export const canManageDestinations = (role) => {
    return hasRole(role, [ROLES.ADMIN, ROLES.EDITOR]);
};

export const canManageBlogs = (role) => {
    return hasRole(role, [ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR]);
};

export const canManageCategories = (role) => {
    return hasRole(role, [ROLES.ADMIN, ROLES.EDITOR]);
};

export const canManageTags = (role) => {
    return hasRole(role, [ROLES.ADMIN, ROLES.EDITOR]);
};

export const canManageMedia = (role) => {
    return hasRole(role, [ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR]);
};