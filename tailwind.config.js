/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /** Молочная база: фон страницы, поверхности, границы */
        milk: {
          50: "#FFFDFA",
          100: "#FBF6EE",
          200: "#F5EDE0",
          300: "#EBE0CE",
          400: "#DCCDB5",
        },
        /** Тёплые нейтральные оттенки для текста */
        cocoa: {
          400: "#A79B8B",
          500: "#8B7F6F",
          600: "#6B6155",
          700: "#514A41",
          800: "#3E3830",
          900: "#2E2A24",
        },
        /** Карамельный акцент */
        caramel: {
          50: "#FBF5EC",
          100: "#F5E9D8",
          200: "#EBD8BC",
          300: "#DDC09A",
          400: "#CBA675",
          500: "#B98F5C",
          600: "#966F44",
          700: "#7E5A34",
          800: "#66482A",
        },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(94, 78, 56, 0.04), 0 8px 24px -12px rgba(94, 78, 56, 0.18)",
        card: "0 1px 3px rgba(94, 78, 56, 0.05), 0 16px 40px -20px rgba(94, 78, 56, 0.28)",
      },
    },
  },
  plugins: [],
};
