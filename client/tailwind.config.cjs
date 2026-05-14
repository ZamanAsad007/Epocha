// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 100%, 55%)",
        secondary: "hsl(45, 100%, 55%)",
        accent: "hsl(280, 70%, 60%)",
        war: "hsl(0, 80%, 50%)",
        culture: "hsl(30, 80%, 50%)",
        music: "hsl(280, 80%, 50%)",
        religion: "hsl(210, 80%, 50%)",
        ruins: "hsl(0, 0%, 50%)",
      },
    },
  },
  plugins: [],
};
