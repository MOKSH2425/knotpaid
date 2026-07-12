import { TextStyle } from "react-native";

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 34,
    fontWeight: "800",
  },

  h2: {
    fontSize: 28,
    fontWeight: "700",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  body: {
    fontSize: 16,
    fontWeight: "400",
  },

  caption: {
    fontSize: 13,
    fontWeight: "400",
  },

  button: {
    fontSize: 16,
    fontWeight: "700",
  },
};

export default Typography;