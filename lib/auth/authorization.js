
import { ROLES } from "@/constants/roles";

export const hasRole = (userRole, allowedRoles = []) => {
    return allowedRoles.includes(userRole);
};

export const isAdmin = (userRole) => {
    return userRole === ROLES.ADMIN;
};

export const isEditor = (userRole) => {
    return userRole === ROLES.EDITOR;
};

export const isAuthor = (userRole) => {
    return userRole === ROLES.AUTHOR;
};

export const canManageUsers = (userRole) => {
    return isAdmin(userRole);
};

export const canManageDestinations = (userRole) => {
    return hasRole(userRole, [ROLES.ADMIN, ROLES.EDITOR]);
};

export const canManageBlogs = (userRole) => {
    return hasRole(userRole, [ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR]);
};

export const canManageCategories = (userRole) => {
    return hasRole(userRole, [ROLES.ADMIN, ROLES.EDITOR]);
};

export const canManageTags = (userRole) => {
    return hasRole(userRole, [ROLES.ADMIN, ROLES.EDITOR]);
};

export const canManageMedia = (userRole) => {
    return hasRole(userRole, [ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR]);
};