/**
 * Centralized asset paths.
 * Change any path here and it updates across the entire app.
 * All paths are relative to the /public directory.
 */

/* ── Brand / Logo ── */
export const LOGO_DARK = "/images/MainLogoWhite.png";
export const LOGO_LIGHT = "/images/MainLogo.png";
export const FAVICON = "/images/Icon.png";

/* ── Auth Pages ── */
export const IMG_LOGIN = "/images/LoginPage.png";
export const IMG_SIGNUP = "/images/RegistrationPage.png";

/* ── Landing Page Carousel ── */
export const LANDING_SLIDES = [
    { src: "/images/Page1.png", alt: "Book Services" },
    { src: "/images/Page2.png", alt: "Compare Bids" },
    { src: "/images/Page3.png", alt: "Track Progress" },
] as const;

/* ── Mobile Screenshots ── */
export const MOBILE_SCREENSHOTS = [
    "/images/Home.png",
    "/images/HomeBlue.png",
] as const;

/* ── Misc ── */
export const IMG_COMING_SOON = "/images/ComingSoon.png";
export const IMG_HELP_CENTER = "/images/HelpCenter.png";
export const IMG_HISTORY = "/images/History.png";
export const IMG_EMPTY_PROVIDER = "/images/ProviderEmptyScreen.png";

/* ── Placeholder / Fallbacks ── */
export const AVATAR_FALLBACK = "/images/AroundCircle.png";

/* ── Helper: pick logo by theme ── */
export function logoForTheme(theme: string | undefined) {
    return theme === "dark" ? LOGO_DARK : LOGO_LIGHT;
}
