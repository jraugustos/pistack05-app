import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutros (Dark)
        bg: "var(--bg)",
        "bg-elev": "var(--bg-elev)",
        stroke: "var(--stroke)",
        muted: "var(--muted)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        
        // Semânticas
        primary: "var(--primary)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        cyan: "var(--cyan)",
        rose: "var(--rose)",
        
        // Cores por Etapa
        "accent-idea": "var(--accent-idea)",
        "accent-understanding": "var(--accent-understanding)",
        "accent-scope": "var(--accent-scope)",
        "accent-design": "var(--accent-design)",
        "accent-tech": "var(--accent-tech)",
        "accent-plan": "var(--accent-plan)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      spacing: {
        "1": "8px",
        "2": "12px",
        "3": "16px",
        "4": "20px",
        "5": "24px",
        "6": "32px",
      },
      boxShadow: {
        "1": "var(--shadow-1)",
        "2": "var(--shadow-2)",
      },
    },
  },
  plugins: [],
};

export default config;

