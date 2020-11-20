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
      "--speed": "0.5s",
      "--test": "32px",
      "--border": "2px solid",
      "--size": "256px",
    },
  },
};
