/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brick-white': '#E5E5E5',
                'brick-black': '#050505',
                'brick-red': '#DC2626',
                'brick-gray': '#9CA3AF',
            }
        },
    },
    plugins: [],
}
