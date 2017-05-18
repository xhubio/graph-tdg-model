'use strict'

const createTimeRamp = require('../lib/TimeRamp2').createTimeRamp

const TIME_SHIFT = {
  iterations: 4 * 260,
  changes: {
    company: {
      start: 100,
      end: 50000,
      type: 'perIteration',
      min: 1,
      max: 1000,
    },
    user: {
      start: 2,
      end: 40000,
      type: 'perParent',
      min: 1,
    },
    account: {
      end: 50000 * 5,
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
      max: 10000,
      end: 1000000000
    },
    beneficary: {
      start: 500,
      end: 20000,
      type: 'perParent',
      min: 1,
    },
    bank: {
      end: 15,
    },
  },
}

const GENERATION_ORDER = {
  company: {
    children: {
      user: {},
      beneficary: {},
      account: {
        children: {
          statement: {
            children: {
              transaction: {
                links: {
                  beneficary: {},
                },
              },
            },
          },
        },
      },
    },
  },
  bank: {},
}

const res = createTimeRamp({
  timeShift: TIME_SHIFT,
  generationOrder: GENERATION_ORDER,
})

console.log(printMe(res))

/**
 * Prints the result in readable format
 */
// eslint-disable-next-line no-unused-vars
function printMe(dat) {
  const lines = []
  lines.push(`{`)
  Object.keys(dat).forEach(objName => {
    lines.push(`	"${objName}":{`)
    Object.keys(dat[objName]).forEach(iter => {
      const val = dat[objName][iter]
      lines.push(`	  "${iter}":${JSON.stringify(val)},`)
    })
    lines.push(`	},`)
  })
  lines.push(`}`)

  return lines.join('\n')
}
