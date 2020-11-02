
# About

`babel-plugin-theme-ui` babel plugin transformations for theme-ui themes.

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

in the following example the lookup is in a global scope of the theme colors.primary
```
export const theme = {
  colors: {
    primary: '#ffffff',
  },
  input: {
    bg: 'colors.primary'
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
    bg: '#ffffff'
  },
};
```

## Objects transforms

to avoid repetitive styles for multiple theme keys:

```
export const theme = {
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
  input: {
    bg: 'primary',
    border: 'solid 1px black'    
  },
  styles: {
    select: {
      bg: 'primary',
      border: 'solid 1px black'    
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