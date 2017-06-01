'use strict'

import GraphModelBuilder from '../lib/GraphModelBuilder'

describe('GraphModelBuilder', () => {
  test.only('createObject', () => {
    const graphModelBuilder = new GraphModelBuilder()

    const model = graphModelBuilder.createModel(GENERATION_ORDER)

    // console.log(JSON.stringify(model, null, 2))

    expect(model).toBeDefined()
  })
})

// eslint-disable-next-line no-unused-vars
const TIME_SHIFT = {
  iterations: 10,
  changes: {
    company: {
      start: 1,
      end: 10,
      min: 0,
      max: 5,
    },
    user: {
      start: 1,
      end: 25,
      type: 'perParent',
      min: 1,
    },
    account: {
      end: 30,
      min: 1,
      type: 'perParent',
    },
    statement: {
      type: 'perIteration',
      min: 1,
      max: 1,
    },
    transaction: {
      type: 'perParent',
      min: 0,
      max: 10,
    },
    beneficary: {
      start: 2,
      end: 40,
      type: 'perParent',
      min: 1,
    },
    gumbo: {
      start: 0,
      end: 20,
      min: 0,
    },
    bazong: {
      start: 0,
      end: 60,
      min: 0,
    },
    flup: {
      start: 0,
      end: 250,
      min: 0,
    },
    bank: {
      end: 15,
    },
  },
}

// eslint-disable-next-line no-unused-vars
const GENERATION_ORDER = {
  company: {
    children: {
      user: {
        links: {
          flup: {
            where: 'user.parent.account.bazong = flup.parent',
            target: 1,
          },
        },
      },
      beneficary: {},
      account: {
        links: {
          bazong: {},
        },
        children: {
          statement: {
            children: {
              transaction: {
                links: {
                  beneficary: {
                    where: 'transaction.parent.parent.parent = beneficary.parent',
                    target: 1,
                  },
                  flup: {
                    where: 'transaction.parent.parent.bazong = flup.parent',
                    target: {
                      min: 2,
                      max: 10,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  gumbo: {
    children: {
      bazong: {
        children: {
          flup: {},
        },
      },
    },
  },
  bank: {},
}
