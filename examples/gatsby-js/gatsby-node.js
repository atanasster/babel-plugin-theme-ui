const path = require("path");
const babelThemeUI = require("../../dist/cjs");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /index.js$/,
          exclude: /node_modules/,
          include: path.resolve(__dirname, "src/gatsby-plugin-theme-ui"),
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
