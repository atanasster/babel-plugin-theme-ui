import { scales } from "./scales";

export default {
  ...scales,
  speed: ["0.35s", "0.5s", "0.75"],
  colors: {
    primary: "#333",
    secondary: "#503",
  },
  styles: {
    a: {
      "--speed": "speed.1",
      "--test": "space.4",
      "--border": "borders.body",
      "--size": "sizes.sidebar",
    },
  },
};
