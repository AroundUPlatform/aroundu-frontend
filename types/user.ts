import type { Address } from "./common";

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
};

export type Worker = {
    id: number;
    name?: string;
    email?: string;
};
