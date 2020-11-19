import { scales } from '@theme-ui/css';
import { toVarValue } from './var-names';

type Value = {
  __value: string | string[] | object | number | number[];
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
    return findSeg(fullTree) || findSeg(currentNode);
  }
  return undefined;
}

interface TransformProps {
  useCustomProperties: boolean; 
  fullTree: Tree;
  parentKey?: string;
  current: Tree;
  rootNames: string[];
  colorNames: string[];
}

const transformTree = (props: TransformProps) => {
  const { useCustomProperties, fullTree, parentKey, current, rootNames, colorNames } = props;
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
        if (colorNames.includes(key) && fullTree['colors']?.[item.__value]) {
          if (useCustomProperties && !rootNames.includes(parentKey)){ 
            item.__path.node.value.value = toVarValue(item.__value);
          } else {
            item.__path.node.value.value = item.__value;
          };         
        } else {
          lookup = findPath(fullTree, current, item.__value);
        }
      }   
      
      if (lookup) {
        const { __value, __path } = lookup;
        switch (typeof __value) {
          case 'object':
            if (!Array.isArray(__value)) {
              item.__path.node.value = __path.node.value;
            } else {
              item.__path.node.value.elements = item.__path.node.value.elements.map((e, idx) => ({
                ...e, value: __value[idx] !== undefined ? (__value[idx] as unknown as Value).__value : e.value,
                  
                }));
            }
            break;
          case 'string':
          case 'number':
            item.__path.node.value.value = __value;
            break;
        }
      }
    }
  })
}

const nativeColorScales = Object.keys(scales).filter(key => scales[key] === 'colors');
nativeColorScales.push('bg');

export default (_: any, options: { 
    useCustomProperties: boolean;
    rootNames: string[];
    colorNames: string[];
    transformNativeColors: boolean;
    defaultColorScales
  }) => {
  const { 
    useCustomProperties: customProps = true,
    transformNativeColors = false,
    colorNames: customColorNames = [],
    rootNames = ['root', 'colors'],
   } = options;  
  let tree: Tree = {
    __parent: undefined,
  };
  const colorNames = transformNativeColors ? [...customColorNames, ...nativeColorScales] : customColorNames;
  let current: Tree = tree;
  let useCustomProperties: boolean = customProps;
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
      VariableDeclaration:  {
        enter() {
          tree = {
            __parent: undefined,
          };
          current = tree;
        },
        exit() {
          transformTree({
            
            fullTree: tree, 
            current: tree,
            rootNames,
            colorNames,
            useCustomProperties, 
          });
        }    
      }

    }
  };
}