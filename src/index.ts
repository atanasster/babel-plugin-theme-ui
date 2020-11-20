import { scales } from '@theme-ui/css';
import micromatch from 'micromatch';
import { toVarValue } from './var-names';

type Value = {
  __value: string | string[] | object | number | number[];
  scale?: string;
  __path: any
}


type Tree = { __parent: Tree | undefined } & (Partial<Value> | { [key: string]: Tree });

const findPath = (fullTree: Tree, currentNode: Tree, value: string | string[]) : Value | undefined => {
  const seg = typeof value === 'string' ? value.split('.') : undefined;
  if (seg && seg.length > 0) {
    const findSeg = (tree: Tree): Value | undefined =>  seg.reduce((t: Tree, s: string | number ) => {
      if (!t) {
        return undefined;
      }
      return t ? Array.isArray(t.__value) ? 
        { __path: t.__path, __value: t.__value[s] } :
          t[s]:
           undefined;
    }, tree );
    const retVal: Value | undefined = findSeg(fullTree) || findSeg(currentNode);
    seg.pop();
    return retVal ? { ...retVal, scale: seg.join('.') } : retVal;
  }
  return undefined;
}

type TransformProps = {
  fullTree: Tree;
  parentKey?: string;
  current: Tree;
} & PluginOptions

interface PluginOptions { 
  useCustomProperties?: boolean;
  rootNames?: string[];
  colorNames?: string[];
  transformNativeColors?: boolean;
  spaceFormats?: Record<string, string | ((value: any) => string)> 
}

const transformValue = (spaceFormats: PluginOptions['spaceFormats'], key: string, value: any) => {
  if (spaceFormats[key]) {
    const formatter = spaceFormats[key];
    if (typeof formatter === 'function') {
      return (formatter as (value: any) => string)(value)
    } else {
      return formatter;
    }
  }
  return value;
}

const transformTree = (props: TransformProps) => {
  const { useCustomProperties, fullTree, parentKey, current, rootNames, colorNames, spaceFormats } = props;
  Object.keys(current).filter(key => !['__parent', '__path', '__value'].includes(key)).forEach(key => {
    const item = current[key];
    if ('__parent' in item) {
      transformTree({...props, parentKey: key, current: item });
    } else if ('__path' in item) {
      let lookup: Value;
      if (Array.isArray(item.__value)) {
        const items = item.__value.map(v => findPath(fullTree, current, v));
        if (items && items.length) {
          lookup = { __path: item.__path, __value: items}
        }
      } else {
        if (micromatch.isMatch(key, colorNames) && fullTree['colors']?.[item.__value]) {
          if (rootNames.includes(parentKey)) {
            item.__path.node.value.value = item.__value;
          } 
          else if (useCustomProperties){ 
            item.__path.node.value.value = toVarValue(item.__value);
          } else {
            item.__path.node.value.value = fullTree['colors']?.[item.__value].__value;
          };         
        } else {
          lookup = findPath(fullTree, current, item.__value);
        }
      }   
      
      if (lookup) {
        const { __value, __path, scale } = lookup;
        switch (typeof __value) {
          case 'object':
            if (!Array.isArray(__value)) {
              item.__path.node.value = transformValue(spaceFormats, scale, __path.node.value);
            } else {
              item.__path.node.value.elements = item.__path.node.value.elements.map((e, idx) => ({
                ...e, value: __value[idx] !== undefined ? transformValue(spaceFormats, scale, (__value[idx] as unknown as Value).__value) : transformValue(spaceFormats, scale, e.value),
                  
                }));
            }
            break;
          case 'string':
          case 'number':
            item.__path.node.value.value = transformValue(spaceFormats, scale, __value );
            break;
        }
      }
    }
  })
}

const nativeColorNames = Object.keys(scales).filter(key => scales[key] === 'colors');
nativeColorNames.push('bg');

export default (_: any, options: PluginOptions) => {
  const { 
    useCustomProperties: customProps = true,
    transformNativeColors = false,
    colorNames: customColorNames = [],
    rootNames = ['root', 'colors'],
    spaceFormats = {
      space: value => `"${value}px"`,
    }
   } = options;
   const globalSpace = {};
  let tree: Tree = {
    __parent: undefined,
  };
  const colorNames = transformNativeColors ? [...customColorNames, ...nativeColorNames] : customColorNames;
  let current: Tree = tree;
  let useCustomProperties: boolean = customProps;
  const ThemeDefinition = {
    enter() {
      tree = {
        __parent: undefined,
      };
      current = tree;
    },
    exit(path) {
      transformTree({
        fullTree: tree, 
        current: tree,
        rootNames,
        colorNames,
        useCustomProperties,
        transformNativeColors,
        spaceFormats,
      });
      const declarations = path.node.declarations;
      if (declarations) {
        if (Array.isArray(declarations) && declarations.length > 0) {
          const declaration = declarations[0];
          const name = declaration.id?.name;
          if (name) {
            globalSpace[name] = {...tree};
          }
        }
      }
    }    
  };
  return {
    name: 'theme-ui parser',
    visitor: {
      ObjectProperty: {
        enter(path) {
          const node = path.node;
          if (node.value) {
            switch(node.value.type) {
              case 'StringLiteral':
                current[node.key.name ?? node.key.value] = {
                  __value: node.value.value,
                  __path: path, 
                };
                break;
              case 'ArrayExpression':
                current[node.key.name ?? node.key.value] = {
                  __value: node.value.elements.map(el => el.value),
                  __path: path, 
                };
              break;
              case 'ObjectExpression':
                current[node.key.name ?? node.key.value] = {
                  __parent: current,
                  __value: {},
                  __path: path,
                }
                current = current[node.key.name ?? node.key.value];
                break;

              case 'Identifier':
                if (current && globalSpace[node.key?.name]) {
                  current = Object.assign(current, globalSpace[node.key?.name]);
                }
                break;
              case 'BooleanLiteral': 
                if (node.key.name === 'useCustomProperties') {
                  useCustomProperties = node.value.value;
                };
              break;
            }
          }
        },
        exit(path) {
          const node = path.node;
          if (node.value) {
            switch (node.value.type) {
              case 'ObjectExpression': 
                if (current.__parent) {
                  current = current.__parent as Tree;
                }
                break;
            }
          }  
        }  
      },
      SpreadElement: {
        enter(path) {
          const node = path.node;
          if (globalSpace[node.argument?.name]) {
            current = Object.assign(current, globalSpace[node.argument?.name]);
          }

        }
      },    
      ExportDefaultDeclaration: ThemeDefinition,
      VariableDeclaration:  ThemeDefinition,
    }
  };
}