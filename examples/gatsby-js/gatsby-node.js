// const path = require("path");
const babelThemeUI = require("../../dist/cjs");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /theme.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            plugins: [
              [
                babelThemeUI,
                {
                  transformNativeColors: true,
                  useCustomProperties: false,
                  colorNames: ["--bg-*", "--color-*"],
                  rootNames: ["root", "body"],
                },
              ],
            ],
          },
        },
      ],
    },
  });
};
