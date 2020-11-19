
# About

`babel-plugin-theme-ui` babel plugin transformations for theme-ui themes.

# Install

```sh
yarn add babel-plugin-theme-ui --dev
```

# Configuration

You can configure the plugin in your webpack configuration as a babel-loader plugin

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
## Javascript theme

```
const babelThemeUI = require('babel-plugin-theme-ui);

module: {
  rules: [
    {
      test: /theme.ts$/,
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

## Typescript theme

```
const babelThemeUI = require('babel-plugin-theme-ui);

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
```
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
```
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
```
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
```
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

```
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
```
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

```
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  button: {
    borderRadius: 'space.2',
  },
};
```
will be transformed to 
```
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  button: {
    borderRadius: 8,
  },
};
```

## Array values transformations

some of the theme-ui values are arrays - to be used based on the current screen resolution

```
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  input: {
    '--space-gap': ["space.2", "14px", "space.3", "space.4"],
  },
};
```

will be transformed to 
```
export const theme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  input: {
    "--space-gap": [8, "14px", 16, 32],
  },
};
```
notice above that the `space.2` key is replaced with the second value in the space array, while the `14px` is left intact since it is not a valid theme key