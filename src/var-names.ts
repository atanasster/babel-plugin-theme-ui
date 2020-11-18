const toVarName = (key: string) => `--theme-ui-colors-${key}`
export const toVarValue = (key: string, value?: string | number) =>
  `var(${toVarName(key)}${value ? `, ${value}` : ''})`