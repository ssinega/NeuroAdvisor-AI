/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                background: "#08090D", // Deeper, more sophisticated black
                panel: "#0E1117",      // Dark navy slate
                card: "#151921",       // Polished card background
                accent: {
                    DEFAULT: "#00E5FF", // Vibrant clinical cyan
                    hover: "#33EBFF",
                    muted: "rgba(0, 229, 255, 0.12)",
                },
                medical: {
                    teal: "#00F0E0",     // Bright surgical teal
                    blue: "#2563EB",     // Professional medical blue
                    soft: "#94A3B8",     // Slate for secondary info
                    white: "#F8FAFC",    // Pure clinical off-white
                },
                danger: "#FF3333",
                warning: "#FFAB00",
                success: "#00E676",
                primary: "#FFFFFF",     // Pure white for labels
                muted: "#8A99AF",       // Softer gray for less emphasis
            },
            boxShadow: {
                'clinical': '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.08)',
                'accent-glow': '0 0 20px rgba(0, 229, 255, 0.25)',
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
            }
        },
    },
    plugins: [],
}
