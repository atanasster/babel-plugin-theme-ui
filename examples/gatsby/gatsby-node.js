const babelThemeUI = require('../../dist/cjs')
exports.onCreateWebpackConfig = ({
  actions,
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /theme.ts$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: [['typescript']],
            plugins: [
              [babelThemeUI, { colorNames: ['color', 'bg', '--bg-hover']}]
            ]
          }
        },
      ],
    },
  })
}