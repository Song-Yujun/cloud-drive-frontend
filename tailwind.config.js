/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // v4 中 plugins 的使用方式略有不同，但基础配置通常没问题
  plugins: [],
}