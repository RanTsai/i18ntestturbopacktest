/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,md,mdx}",
  ],
  theme: { extend: {} },
  plugins: [
    require("tailwind-scrollbar-hide"),
    require("@tailwindcss/typography"),
  ],
};
