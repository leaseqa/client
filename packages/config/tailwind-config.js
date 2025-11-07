/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "../../apps/web/app/**/*.{ts,tsx}",
    "../../apps/web/components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          25: "#f8fafc",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};

module.exports = config;
