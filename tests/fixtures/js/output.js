export default {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#07c",
    secondary: "#609",
    modes: {
      dark: {
        text: "#fff",
        background: "#222",
        primary: "#0cf",
        secondary: "#90c",
      },
    },
  },
  fonts: {
    body:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: "inherit",
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      color: "text",
      bg: "background",
    },
    a: {
      color: "primary",
      textDecoration: "none",
      "--test": 32,
      "--bg-hover": "var(--theme-ui-colors-secondary)",
      ":hover": {
        color: "secondary",
        textDecoration: "underline",
      },
    },
  },
};
