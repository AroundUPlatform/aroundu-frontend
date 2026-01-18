export type Role = "CLIENT" | "WORKER" | "ADMIN";

export type Session = {
    userId: number;
    email: string;
    role: Role;
};

export type LoginResponse = {
    userId: number;
    token: string;
    type: string;
    email: string;
    role: string;
};
