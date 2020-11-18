
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
### colorNames: string[] (default ['color', 'bg', 'backgroundColor'],

a list of the color property names to be transformed to css variables

### rootNames: string[] (default ['root', 'colors'])

a list of the theme section not the be transformed into using css variables.
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
              useCustomProperties: false, 
              colorNames: ['color', 'bg', 'backgroundColor', '--bg-hover', '--color-hover', '--bg-random', '--color'],
              rootNames = ['root', 'body'],
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
              useCustomProperties: false, 
              colorNames: ['color', 'bg', 'backgroundColor', '--bg-hover', '--color-hover', '--bg-random', '--color'],
              rootNames = ['root', 'body'],
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
    border: 'solid 1px black'    
  },
  styles: {
    select: 'input'
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
    bg: "var(--theme-ui-colors-primary)",
    border: "solid 1px black",
  },
  styles: {
    select: {
      bg: "var(--theme-ui-colors-primary)",
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