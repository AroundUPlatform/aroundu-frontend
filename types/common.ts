export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

export type Price = {
    currency: string;
    amount: number;
};

export type Address = {
    id?: number;
    country: string;
    postalCode: string;
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
    fullAddress?: string;
};
