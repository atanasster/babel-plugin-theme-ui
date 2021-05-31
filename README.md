# About

`babel-plugin-theme-ui` babel plugin transformations for theme-ui themes.

# Install

```sh
yarn add babel-plugin-theme-ui --dev
```

# Configuration

You can configure the plugin in your webpack configuration as a babel-loader plugin [see examples](#example-configurations)

## Options

### useCustomProperties: boolean (default true)

When this option is set to false, the plugin will not transform color properties to use css variables ie `var(--theme-ui-colors-primary)`

### colorNames: string[] (default []),

a list of the color property names to be transformed to css variables. We are using internally [micromatch](https://github.com/micromatch/micromatch) - a glob matching for javascript/node.js and you can use matching patterns for the color properties.

### rootNames: string[] (default ['root', 'colors'])

a list of the theme section not the be transformed into using css variables.

### transformNativeColors: boolean (default false)

if you set this option to true, the plugin will also transform the `native` color names of theme-ui - such as `bg`. This can offset the color lookups at build-time rather than run-time.

Currently the following property names are treated as `color` style names:

```
  "color",
  "backgroundColor",
  "borderColor",
  "caretColor",
  "columnRuleColor",
  "borderTopColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRightColor",
  "outlineColor",
  "fill",
  "stroke",
  "bg",
```

## spaceFormats: Record<string, string | function (value: any) => string> (default { space: value => `"${value}px"`,})

you can use this option and apply custom formatting to the transformed values - by default the `space` values are transformed to strings by adding `px` at the end.

# Example configurations

## Javascript theme

```js
const babelThemeUI = require('babel-plugin-theme-ui');

module: {
  rules: [
    {
      test: /theme.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        plugins: [
          [
            babelThemeUI,
            {
              transformNativeColors: true,
              useCustomProperties: false,
              colorNames: ['--bg-*', '--color-*'],
              rootNames: ['root', 'body'],
            }
          ]
        ]
      }
    },
  ],
},
```

## Gatsby Plugin Theme UI

```js
const path = require("path");
const babelThemeUI = require('babel-plugin-theme-ui');

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
              colorNames: ["--bg-*", "--color-*"],
            },
          ],
        ],
      },
    },
  ],
},
```

## Next.JS webpack config

```js
// next.config.js
const babelThemeUI = require('babel-plugin-theme-ui');

module.exports = {
  webpack(config, options) {
    config.module.rules.push({
      test: /theme.ts$/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: 'babel-loader',
          options: {
            presets: [['next/babel']],
            plugins: [
              [
                babelThemeUI,
                {
                  transformNativeColors: true,
                  useCustomProperties: false,
                  colorNames: ['--bg-*', '--color-*'],
                  rootNames: ['root', 'body'],
                }
              ]
            ]
          }
        },
      ],
    })
  }
}
```

## Typescript theme

```ts
const babelThemeUI = require('babel-plugin-theme-ui');

module: {
  rules: [
    {
      test: /theme.ts$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: [['typescript']],
        plugins: [
          [
            babelThemeUI,
            {
              transformNativeColors: true,
              useCustomProperties: false,
              colorNames: ['--bg-*', '--color-*'],
              rootNames: ['root', 'body'],
            }
          ]
        ]
      }
    },
  ],
},
```

# Transforms

## Keys in current scope

`secondary` and `green` are child nodes of the same parent (`colors`):

```js
export const theme = {
  colors: {
    green:{
      30: '#00aa00',
    },
    secondary: 'green.30'
  },
};
```

will be transformed to

```js
export const theme = {
  colors: {
    green:{
      30: '#00aa00',
    },
    secondary: '#00aa00'
  },
};
```

## Keys from global scope

in the following example the lookup is in a global scope of the theme colors

```js
export const theme = {
  colors: {
    primary: '#ffffff',
  },
  input: {
    bg: 'primary'
  },
};
```

will be transformed to

```js
export const theme = {
  colors: {
    primary: '#ffffff',
  },
  input: {
    bg: 'var(--theme-ui-colors-primary)',
  },
};
```

## Objects transforms

to avoid repetitive styles for multiple theme keys:

```js
export const theme = {
  colors: {
    primary: 'tomato',
  },
  input: {
    bg: 'primary',
    '--bg-random': 'primary',
    border: 'solid 1px black',
  },
  styles: {
    select: 'input',
  },
};
```

will be transformed to

```js
export const theme = {
  colors: {
    primary: "tomato",
  },
  input: {
    bg: "primary",
    "--bg-random": "var(--theme-ui-colors-primary)",
    border: "solid 1px black",
  },
  styles: {
    select: {
      bg: "primary",
      "--bg-random": "var(--theme-ui-colors-primary)",
      border: "solid 1px black",
    },
  },
};
```

## Array index transformations

to get shortcuts into array keys in the theme, such as `spaces` and `fontSizes`

```js
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  button: {
    borderRadius: 'space.2',
  },
};
```

will be transformed to

```js
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  button: {
    borderRadius: "8px",
  },
};
```

## Array values transformations

some of the theme-ui values are arrays - to be used based on the current screen resolution

```js
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  input: {
    '--space-gap': ["space.2", "14px", "space.3", "space.4"],
  },
};
```

will be transformed to

```js
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  input: {
    "--space-gap": ["8px", "14px", "16px", "32px"],
  },
};
```

notice above that the `space.2` key is replaced with the second value in the space array, while the `14px` is left intact since it is not a valid theme key

## References to custom scales

Custom scales can be created to supplement [those already existing](https://theme-ui.com/theme-spec).

Simply create a new scale, then reference it in a variant

```js
  speed: ["0.35s", "0.5s", "0.75s"],
  ease: {
    in: "ease-in",
    out: "ease-out",
    inOut: "ease-in-out",
  },
```

```js
  a: {
  color: "primary",
  "--speed": "speed.1",
  "--ease": "ease.out",
  transition: "color var(--speed, 0.35s) var(--ease, ease)"
},
```

## Theme composition

When your theme definition grows, it is common to separate the scales into their on objects that will get merged into the theme object

```js
const scales = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
}

const layout = {
  '--margin': 'space.3',
  '--bg-random': 'primary',
  ease: 'speed.2'
}

const font = {
  '--margin': 'space.3',
  '--color-some': 'primary',
  ease: 'speed.0'
}

export default {
  ...scales,
  speed: ["0.35s", "0.5s", "0.75"],
  colors: {
    primary: '#333',
    secondary: '#503'
  },
  styles: {
    h1: layout,
    h2: {
      ...layout,
      '--color-more': 'secondary',
    },
    h3: {
      ...font,
    },
    a: {
      '--test': 'space.4',
    },
  },
}
```

will be transformed to

```js
const scales = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
};
const layout = {
  "--margin": "16px",
  "--bg-random": "var(--theme-ui-colors-primary)",
  ease: "0.75",
};
const font = {
  "--margin": "16px",
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
      "--test": "32px",
    },
  },
};
```
