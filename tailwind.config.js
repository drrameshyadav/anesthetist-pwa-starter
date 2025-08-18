/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Noto Sans","Ubuntu","Cantarell","Helvetica Neue","Arial","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"]
      }
    },
  },
  plugins: [],
}
