type Value = {
  value: string | string[] | object | number | number[];
  path: any
}

type Tree = { __parent: Tree | undefined } & (Partial<Value> | { [key: string]: Tree });

const findPath = (fullTree: Tree, currentNode: Tree, value: string | string[]) : Value | undefined => {
  const seg = typeof value === 'string' && value.split('.');
  if (seg && seg.length >= 1) {
    const findSeg = (tree: Tree): Value | undefined =>  seg.reduce((t: Tree, s: string ) => {
      if (!t) {
        return undefined;
      }
      return t ? Array.isArray(t.value) ? 
        { path: t.path, value: t.value[s] } :
          t[s]:
           undefined;
    }, tree );
    return findSeg(fullTree) || findSeg(currentNode);
  }
  return undefined;
}  
const transformTree = (fullTree: Tree, current: Tree) => {
  Object.keys(current).filter(key => key !== '__parent').forEach(key => {
    const item = current[key];
    if ('__parent' in item) {
      transformTree(fullTree, item);
    } else if ('path' in item) {
      let lookup: Value;
      if (Array.isArray(item.value)) {
        const items = item.value.map(v => findPath(fullTree, current, v));
        if (items && items.length) {
          lookup = { path: item.path, value: items}
        }
      } else {
         lookup = findPath(fullTree, current, item.value);
      }   
      
      if (lookup) {
        const { value, path } = lookup;
        switch (typeof value) {
          case 'object':
            if (!Array.isArray(value)) {
              item.path.node.value = path.node.value;
            } else {
              item.path.node.value.elements = item.path.node.value.elements.map((e, idx) => ({
                ...e, value: value[idx] !== undefined ? (value[idx] as any).value : e.value,
                  
                }));
            }
            break;
          case 'string':
          case 'number':
            item.path.node.value.value = value;
            break;
        }
      }
    }
  })
}
export default () => {
  let tree: Tree = {
    __parent: undefined,
  };
  let current: Tree = tree;
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
                  value: node.value.value,
                  path, 
                };
                break;
              case 'ArrayExpression':
                current[node.key.name] = {
                  value: node.value.elements.map(el => el.value),
                  path, 
                };
              break;
              case 'ObjectExpression':
                current[node.key.name] = {
                  __parent: current,
                  value: {},
                  path,
                }
                current = current[node.key.name ?? node.key.value];
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
          transformTree(tree, tree);
        }    
      }

    }
  };
}