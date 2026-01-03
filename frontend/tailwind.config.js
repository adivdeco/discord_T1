/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                discord: {
                    'dark': '#36393f',
                    'darker': '#2f3136',
                    'darkest': '#202225',
                    'light': '#dcddde',
                    'brand': '#5865f2',
                    'brand-hover': '#4752c4',
                    'server-hover': '#36393f',
                }
            }
        },
    },
    plugins: [],
}
