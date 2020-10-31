import { AnyMxRecord } from "dns";

interface Leaves {
  value?: string;
  path?: any;
};

interface Tree {
  nodes: Record<string, Tree>;
};

type Value = {
  value: string;
  path: any
}
type Node = { __parent: Node | undefined } | Record<string, Tree> | Record<string, Value>;

const findPath = (tree: Node, value: Value) : Value | undefined => {
  const seg = typeof value.value === 'string' && value.value.split('.');
  if (seg && seg.length > 1) {
    return seg.reduce((t, s ) => t ? t[s]: undefined, tree );
  }
  return undefined;
}  
const transformTree = (fullTree: Node, current: Node) => {
  Object.keys(current).filter(key => key !== '__parent').forEach(key => {
    const item = current[key];
    if ('__parent' in item) {
      transformTree(fullTree, item);
    } else if ('path' in item) {
      const value = findPath(fullTree, item) ||  findPath(current, item);
      if (value) {
        item.path.node.value.value = value.value;
      }
    }
  })
}
export default ({
  types: t
}) => {
  let tree: Node = {
    __parent: undefined,
  };
  let current: Node = tree;
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
              case 'ObjectExpression':
                current[node.key.name] = {
                  __parent: current,
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
                  current = current.__parent as Node;
                }
                break;
            }
          }  
        }  
      },
      VariableDeclaration:  {
        enter(path) {
          tree = {
            __parent: undefined,
          };
          current = tree;
        },
        exit(path) {
          transformTree(tree, tree);
        }    
      }

    }
  };
}