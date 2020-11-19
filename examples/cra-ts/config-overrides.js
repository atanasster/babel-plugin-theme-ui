const { override, addWebpackModuleRule } = require('customize-cra');
const babelThemeUI = require('../../dist/cjs');

module.exports = override(
  addWebpackModuleRule({
    test: /theme.ts$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: [['typescript']],
      plugins: [
        [babelThemeUI, { 
          transformNativeColors: true,
          colorNames: ['--bg-*', '--color-*'],
        }]
      ]
    }
  })
);