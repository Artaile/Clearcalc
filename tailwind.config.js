/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            colors: {
                background: "#09090b",
                foreground: "#fcfcfc",
            },
            borderRadius: {
                "3xl": "1.5rem",
            },
        },
    },
    plugins: [],
};
