// const path = require("path");
const babelThemeUI = require("../../dist/cjs");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /theme.js/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            plugins: [
              [
                babelThemeUI,
                {
                  colorNames: ["--bg-*", "--color-*"],
                },
              ],
            ],
          },
        },
      ],
    },
  });
};
