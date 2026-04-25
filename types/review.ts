export type Review = {
    id: number;
    jobId: number;
    reviewerId: number;
    revieweeId: number;
    rating: number;
    comment?: string;
    createdAt?: string;
};

export type CreateReviewRequest = {
    rating: number;
    comment?: string;
};
