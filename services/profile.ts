import { http } from "./http";
import type { PublicProfile } from "../types/user";

export const getPublicProfile = async (userId: number) => {
    return http<PublicProfile>(`/users/${userId}/profile`);
};

export const uploadProfileImage = async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http<{ url: string }>(`/users/${userId}/profile-image`, {
        method: "POST",
        body: formData,
        headers: {},
    });
};
