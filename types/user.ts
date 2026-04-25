import type { Address } from "./common";
import type { Skill } from "./job";

export type ClientRegisterRequest = {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    currency: string;
    currentAddress: Address;
    savedAddresses?: Address[];
};

export type WorkerSignupRequest = {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    currency: string;
    currentAddress: Address;
    skillIds?: string[];
};

export type Client = {
    id: number;
    name?: string;
    email?: string;
    phoneNumber?: string;
    currency?: string;
    currentAddress?: Address;
    savedAddresses?: Address[];
    profileImageUrl?: string;
    createdAt?: string;
};

export type Worker = {
    id: number;
    name?: string;
    email?: string;
    phoneNumber?: string;
    currency?: string;
    currentAddress?: Address;
    skills?: Skill[];
    profileImageUrl?: string;
    onDuty?: boolean;
    averageRating?: number;
    totalReviews?: number;
    experience?: string;
    createdAt?: string;
};

export type PublicProfile = {
    id: number;
    name?: string;
    email?: string;
    role?: string;
    profileImageUrl?: string;
    averageRating?: number;
    totalReviews?: number;
    skills?: Skill[];
};
