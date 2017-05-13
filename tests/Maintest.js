'use strict'

const createTimeRamp = require('../lib/TimeRamp2').createTimeRamp

const TIME_SHIFT = {
  iterations: 4 * 260,
  changes: {
    company: {
      start: 100,
      end: 200000,
      type: 'perIteration',
      min: 1,
      max: 1000,
    },
    user: {
      start: 2,
      end: 400000,
      type: 'perParent',
      min: 1,
    },
    account: {
      end: 200000 * 5,
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
    },
    beneficary: {
      start: 500,
      end: 200000,
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
        // children: {
        //   statement: {
        //     children: {
        //       transaction: {
        //         links: {
        //           beneficary: {},
        //         },
        //       },
        //     },
        //   },
        // },
      },
    },
  },
  bank: {},
}

createTimeRamp({
  timeShift: TIME_SHIFT,
  generationOrder: GENERATION_ORDER,
})
