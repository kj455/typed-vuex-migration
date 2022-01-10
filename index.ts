import core, { Transform, Collection } from "jscodeshift";


const transform: Transform = ({ source, path }, { j }) => {
  const ast = j(source);

  // add import statement
  addImport(ast, j);

  // replace 'getters' with 'getterTree'
  defineGettersTree(ast, j);

  // replace 'mutation' with 'mutationTree'
  defineMutationTree(ast, j);

  // replace 'action' with 'actionTree'
  defineActionTree(ast, j);

  return ast.toSource({
    quote: 'single',
  });
};

function addImport(ast: Collection, j: core.JSCodeshift) {
  const shouldImport = ast.find(j.ImportDeclaration, {
    type: "ImportDeclaration",
    source: {
      value: 'typed-vuex',
    }
  }).length === 0
  if (shouldImport) {
    ast.find(j.Program).get('body').get(0).insertBefore("import { getterTree, mutationTree, actionTree } from 'typed-vuex';")
  }
}

function defineGettersTree(ast: Collection, j: core.JSCodeshift) {
  // if getterTree is defined, do nothing
  const gettersTreeExist = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'getters',
          },
          init: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'getterTree',
            },
          }
        }
      ]
    }
  }).length === 1;
  if (gettersTreeExist) return;

  // if vuex2 getters is defined, define getterTree including its properties
  const foundAst = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "getters"
          },
          init: {
            type: "ObjectExpression",
          }
        }
      ]
    }
  })
  const shouldReplace = foundAst.length === 1
  if (shouldReplace) {
    return foundAst.replaceWith((path) => {
      return j.exportNamedDeclaration({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'getters',
            },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'getterTree',
              },
              arguments: [
                {
                  type: 'Identifier',
                  name: 'state',
                },
                {
                  type: 'ObjectExpression',
                  // @ts-expect-error
                  properties: path.value.declaration.declarations[0].init.properties
                }
              ]
            }
          }
        ]
      })
    })
  }

  // if no definition of getters, define empty getterTree after definition of state
  const stateAst = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "state"
          },
        }
      ]
    }
  })
  stateAst.at(-1).insertAfter('export const getters = getterTree(state, {});')


}

function defineMutationTree(ast: Collection, j: core.JSCodeshift) {
  // if mutationTree is defined, do nothing
  const mutationTreeExist = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'mutations',
          },
          init: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'mutationTree',
            },
          }
        }
      ]
    }
  }).length === 1;
  if (mutationTreeExist) return;

  // if vuex2 mutations is defined, define mutationTree including its properties
  const mutationsAst = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: 'Identifier',
            name: 'mutations',
          },
          init: {
            type: 'ObjectExpression',
          }
        }
      ]
    }
  })
  const mutationsExist = mutationsAst.length === 1
  if (mutationsExist) {
    return mutationsAst.replaceWith((path) => {
      return j.exportNamedDeclaration({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'mutations',
            },
            init: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'mutationTree',
              },
              arguments: [
                {
                  type: 'Identifier',
                  name: 'state'
                },
                {
                  type: 'ObjectExpression',
                  // @ts-expect-error
                  properties: path.value.declaration.declarations[0].init.properties
                }
              ]
            }
          }
        ]
      })
    })
  }

  // if no definition of mutations, define empty mutationTree after definition of getters
  const gettersAst = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "getters"
          },
        }
      ]
    }
  })
  gettersAst.at(-1).insertAfter('export const mutations = mutationTree(state, {});')
}

function defineActionTree(ast: Collection, j: core.JSCodeshift) {
  // if actionTree is defined, do nothing
  const actionTreeExist = ast.find(j.ExportNamedDeclaration, {
    type: 'ExportNamedDeclaration',
    declaration: {
      kind: 'const',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'actions',
          },
          init: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'actionTree',
            }
          }
        }
      ]
    }
  }).length === 1
  if (actionTreeExist) return;

  // if vuex2 actions is defined, define actionTree including its properties
  const actionsAst = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: 'Identifier',
            name: 'actions',
          },
          init: {
            type: 'ObjectExpression',
          }
        }
      ]
    }
  })
  const actionsExist = actionsAst.length === 1
  if (actionsExist) {
    return actionsAst
      .replaceWith((path) => {
        return j.exportNamedDeclaration({
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: {
                type: 'Identifier',
                name: 'actions',
              },
              init: {
                type: 'CallExpression',
                callee: {
                  type: 'Identifier',
                  name: 'actionTree',
                },
                arguments: [
                  {
                    type: 'ObjectExpression',
                    properties: [
                      {...j.property('init', j.identifier('state'), j.identifier('state')), shorthand: true},
                      {...j.property('init', j.identifier('getters'), j.identifier('getters')), shorthand: true},
                      {...j.property('init', j.identifier('mutations'), j.identifier('mutations')), shorthand: true},
                    ]
                  },
                  {
                    type: 'ObjectExpression',
                    // @ts-expect-error
                    properties: path.value.declaration.declarations[0].init.properties
                  }
                ]
              }
            }
          ]
        })
      })
  }

  // if no definition of actions, add empty actionTree after definition of mutation
  const mutationAst = ast.find(j.ExportNamedDeclaration, {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "mutations"
          },
        }
      ]
    }
  })
  mutationAst.at(-1).insertAfter('export const actions = actionTree({state, getters, mutations}, {});')
}

export default transform;