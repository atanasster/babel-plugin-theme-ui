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