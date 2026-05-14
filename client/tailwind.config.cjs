// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0D0D0D",
          panel: "#141414",
          card: "#1C1A17",
        },
        border: {
          DEFAULT: "#2A2720",
        },
        primary: {
          DEFAULT: "#C9A84C", // Antique Gold
          hover: "#E2C06A",
        },
        secondary: {
          DEFAULT: "#8B6914", // Deeper Gold
        },
        text: {
          primary: "#F0E6D3",
          secondary: "#9A8F7E",
          muted: "#5C5347",
        },
        war: "#C0392B",
        culture: "#C9A84C",
        music: "#7D5BA6",
        religion: "#2980B9",
        ruins: "#7F8C8D",
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        heading: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
