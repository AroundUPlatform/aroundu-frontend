import type { Config } from "tailwindcss";

/** Helper — maps a CSS variable (space-separated RGB channels) to a Tailwind color with opacity support */
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
    darkMode: "class",
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./services/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}", "./types/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: rgb("--color-background"),
                surface: {
                    DEFAULT: rgb("--color-surface"),
                    strong: rgb("--color-surface-strong"),
                },
                text: rgb("--color-text"),
                muted: rgb("--color-muted"),
                brand: {
                    DEFAULT: rgb("--color-brand"),
                    strong: rgb("--color-brand-strong"),
                },
                danger: rgb("--color-danger"),
                success: rgb("--color-success"),
                warning: rgb("--color-warning"),
                border: `rgb(var(--color-border) / var(--border-alpha))`,
            },
            boxShadow: {
                card: "0 8px 32px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)",
                "card-hover": "0 16px 48px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.25)",
                "card-light": "0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
                brand: "0 8px 24px rgba(99, 179, 237, 0.2)",
                glow: "0 0 20px rgba(99, 179, 237, 0.15)",
            },
            backgroundImage: {
                aurora:
                    "radial-gradient(ellipse at 15% 5%, rgba(99, 179, 237, 0.06), transparent 50%)," +
                    "radial-gradient(ellipse at 85% 20%, rgba(66, 153, 225, 0.04), transparent 40%)," +
                    "radial-gradient(ellipse at 50% 80%, rgba(72, 210, 143, 0.03), transparent 50%)," +
                    "linear-gradient(180deg, rgb(var(--color-background)) 0%, rgb(var(--color-surface)) 100%)",
            },
            fontFamily: {
                sans: ["var(--font-body)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
                display: ["var(--font-display)", "Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "16px",
                "2xl": "20px",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "pulse-scale": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.03)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-6px)" },
                },
                "gradient-x": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                "glow-pulse": {
                    "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
                    "50%": { opacity: "0.8", transform: "scale(1.05)" },
                },
                "spin-slow": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                ripple: {
                    "0%": { transform: "scale(0.8)", opacity: "1" },
                    "100%": { transform: "scale(2.4)", opacity: "0" },
                },
                "float-delayed": {
                    "0%, 100%": { transform: "translateY(0) translateX(0)" },
                    "33%": { transform: "translateY(-8px) translateX(4px)" },
                    "66%": { transform: "translateY(4px) translateX(-6px)" },
                },
                "morph-blob": {
                    "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
                    "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
                    "50%": { borderRadius: "50% 60% 30% 60% / 30% 70% 50% 60%" },
                    "75%": { borderRadius: "60% 30% 60% 40% / 70% 40% 60% 30%" },
                },
                "text-gradient": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                "counter-spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(-360deg)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.4s ease-out forwards",
                "slide-up": "slide-up 0.5s ease-out forwards",
                shimmer: "shimmer 2s linear infinite",
                "pulse-scale": "pulse-scale 3s ease-in-out infinite",
                float: "float 4s ease-in-out infinite",
                "gradient-x": "gradient-x 6s ease infinite",
                "glow-pulse": "glow-pulse 3s ease-in-out infinite",
                "spin-slow": "spin-slow 20s linear infinite",
                ripple: "ripple 1.5s ease-out infinite",
                "float-delayed": "float-delayed 6s ease-in-out infinite",
                "morph-blob": "morph-blob 8s ease-in-out infinite",
                "text-gradient": "text-gradient 4s ease infinite",
                "counter-spin": "counter-spin 25s linear infinite",
            },
        },
    },
    plugins: [],
};

export default config;
