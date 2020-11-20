const scales = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
};
const layout = {
  "--margin": '"16px"',
  "--bg-random": "var(--theme-ui-colors-primary)",
  ease: "0.75",
};
const font = {
  "--margin": '"16px"',
  "--color-some": "var(--theme-ui-colors-primary)",
  ease: "0.35s",
};
export default {
  ...scales,
  speed: ["0.35s", "0.5s", "0.75"],
  colors: {
    primary: "#333",
    secondary: "#503",
  },
  styles: {
    h1: layout,
    h2: { ...layout, "--color-more": "var(--theme-ui-colors-secondary)" },
    h3: { ...font },
    a: {
      "--test": '"32px"',
    },
  },
};
