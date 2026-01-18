import type { JobUrgency, PaymentMode } from "../types/job";

export const apiBaseFallback = "/api/v1";
export const bidBaseFallback = "/api/v1/bid";

export const currencyOptions = ["USD", "EUR", "INR", "GBP", "AED", "AUD"] as const;

export const countryOptions = ["US", "GB", "IN", "AE", "DE", "SG", "AU"] as const;

export const jobUrgencyOptions: JobUrgency[] = ["SUPER_URGENT", "URGENT", "MEDIUM", "NORMAL"];

export const paymentModeOptions: PaymentMode[] = ["ESCROW", "OFFLINE"];
