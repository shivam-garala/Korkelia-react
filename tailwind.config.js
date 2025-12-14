/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/routes/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Inter",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        secondary: "#0ea5e9",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
      borderRadius: {
        card: "14px",
        button: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
