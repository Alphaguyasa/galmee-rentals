import localFont from "next/font/local";

// Fira Sans was drawn for small screens: open shapes and tabular figures that hold up on a cheap phone in daylight.
export const latin = localFont({
  src: [
    { path: "./fonts/fira-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fira-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/fira-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-latin",
  display: "swap",
});

// Noto Sans Ethiopic for Amharic (Ge'ez script). Latin glyphs fall through to Fira Sans first.
export const ethiopic = localFont({
  src: [
    { path: "./fonts/noto-sans-ethiopic-ethiopic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-ethiopic-ethiopic-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-ethiopic",
  display: "swap",
  preload: false,
});
