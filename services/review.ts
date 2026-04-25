import { http } from "./http";
import type { Review, CreateReviewRequest } from "../types/review";

export const getJobReviews = async (jobId: number) => {
    return http<Review[]>(`/jobs/${jobId}/reviews`);
};

export const createReview = async (jobId: number, payload: CreateReviewRequest) => {
    return http<Review>(`/jobs/${jobId}/reviews`, { method: "POST", body: payload });
};

export const getUserReviews = async (userId: number) => {
    return http<Review[]>(`/users/${userId}/reviews`);
};
