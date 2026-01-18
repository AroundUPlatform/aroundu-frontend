import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./services/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}", "./types/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#0f172a",
                surface: "#0b1224",
                "surface-strong": "#111a30",
                text: "#e5ecff",
                muted: "#8ba0c6",
                brand: {
                    DEFAULT: "#5be0b3",
                    strong: "#3bc68f",
                },
                danger: "#ff6b6b",
                border: "rgba(255, 255, 255, 0.08)",
            },
            boxShadow: {
                card: "0 10px 50px rgba(0, 0, 0, 0.45)",
                brand: "0 10px 30px rgba(91, 224, 179, 0.25)",
            },
            backgroundImage: {
                aurora:
                    "radial-gradient(circle at 20% 20%, rgba(91, 224, 179, 0.12), transparent 35%)," +
                    "radial-gradient(circle at 80% 0%, rgba(59, 198, 143, 0.12), transparent 25%)," +
                    "linear-gradient(160deg, #0a1020 0%, #0f172a 35%, #0b1224 100%)",
            },
            fontFamily: {
                sans: ["var(--font-body)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "18px",
            },
        },
    },
    plugins: [],
};

export default config;
