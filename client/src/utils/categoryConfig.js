// src/utils/categoryConfig.js
// Configuration for each historical category: color (Tailwind), emoji icon, and display label.

export const categoryConfig = {
  war: {
    label: "War",
    color: "war",
    hex: "#C0392B",
    icon: "⚔️",
  },
  culture: {
    label: "Culture",
    color: "culture",
    hex: "#C9A84C",
    icon: "🏛️",
  },
  religion: {
    label: "Religion",
    color: "religion",
    hex: "#2980B9",
    icon: "🕌",
  },
  architecture: {
    label: "Architecture",
    color: "architecture",
    hex: "#E67E22",
    icon: "🏗️",
  },
};

export const BANNER_CATEGORY_COLORS = {
  war: { color: '#C0392B', label: '⚔️ War & Conflict' },
  culture: { color: '#C9A84C', label: '🏛️ Culture & Arts' },
  music: { color: '#7D5BA6', label: '🎵 Music & Performance' },
  religion: { color: '#2980B9', label: '🕌 Faith & Religion' },
  architecture: { color: '#E67E22', label: '🏗️ Architecture & Heritage' },
  science: { color: '#27AE60', label: '🔭 Science & Discovery' },
};
