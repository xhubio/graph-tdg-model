'use strict'

import {
  createTimeRamp,
  getParentIndices,
  createMinVal,
  createStartVal,
  mergeResult,
  getAveragePerIteration,
  createSpreadData,
  createSum,
} from '../lib/TimeRamp2'

const TIME_SHIFT = {
  iterations: 10,
  changes: {
    company: {
      start: 1,
      end: 10,
      type: 'perIteration',
      min: 0,
      max: 5,
    },
    user: {
      start: 1,
      end: 20,
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
      start: 10,
      end: 20,
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

describe('TimeRamp', () => {
  describe('gum', () => {
    test.only('with changeSum > end', () => {
      const res = createTimeRamp({
        timeShift: TIME_SHIFT,
        generationOrder: GENERATION_ORDER,
      })
      console.log(printMe(res))
    })
  })
})

describe('createSum', () => {
  describe('for root object', () => {
    it('right iteration order', () => {
      const ramp = {
        '0': { add: 3 },
        '1': { add: 2 },
        '2': { add: 1 },
        '3': { add: 5 },
      }
      createSum(ramp)
      expect(ramp).toEqual({
        '0': { add: 3, sum: 3 },
        '1': { add: 2, sum: 5 },
        '2': { add: 1, sum: 6 },
        '3': { add: 5, sum: 11 },
      })
    })
    it('wrong iteration order', () => {
      const ramp = {
        '0': { add: 3 },
        '3': { add: 5 },
        '2': { add: 1 },
        '1': { add: 2 },
      }
      createSum(ramp)
      expect(ramp).toEqual({
        '0': { add: 3, sum: 3 },
        '1': { add: 2, sum: 5 },
        '2': { add: 1, sum: 6 },
        '3': { add: 5, sum: 11 },
      })
    })
    it('with gaps', () => {
      const ramp = { '0': { add: 3 }, '2': { add: 3 }, '3': { add: 5 } }
      createSum(ramp)
      expect(ramp).toEqual({
        '0': { add: 3, sum: 3 },
        '2': { add: 3, sum: 6 },
        '3': { add: 5, sum: 11 },
      })
    })

    describe('for child object', () => {
      it('right iteration order', () => {
        const ramp = {
          '0': { add: 3, tmpDist: [1, 2, undefined] },
          '1': { add: 2, tmpDist: [undefined, 1, 1] },
          '2': { add: 1, tmpDist: [undefined, 1, undefined] },
          '3': { add: 5, tmpDist: [2, undefined, 3] },
        }
        createSum(ramp)
        expect(ramp).toEqual({
          '0': { add: 3, sum: 3, dist: [0, [1, 2], undefined] },
          '1': { add: 2, sum: 5, dist: [undefined, 3, 4] },
          '2': { add: 1, sum: 6, dist: [undefined, 5, undefined] },
          '3': { add: 5, sum: 11, dist: [[6, 7], undefined, [8, 10]] },
        })
      })
      it('wrong iteration order', () => {
        const ramp = {
          '0': { add: 3, tmpDist: [1, 2, undefined] },
          '2': { add: 1, tmpDist: [undefined, 1, undefined] },
          '3': { add: 5, tmpDist: [2, undefined, 3] },
          '1': { add: 2, tmpDist: [undefined, 1, 1] },
        }
        createSum(ramp)
        expect(ramp).toEqual({
          '0': { add: 3, sum: 3, dist: [0, [1, 2], undefined] },
          '1': { add: 2, sum: 5, dist: [undefined, 3, 4] },
          '2': { add: 1, sum: 6, dist: [undefined, 5, undefined] },
          '3': { add: 5, sum: 11, dist: [[6, 7], undefined, [8, 10]] },
        })
      })
      it('with gaps', () => {
        const ramp = {
          '0': { add: 3, tmpDist: [1, 2, undefined] },
          '1': { add: 2, tmpDist: [undefined, 1, 1] },
          '3': { add: 6, tmpDist: [3, undefined, 3] },
        }
        createSum(ramp)
        expect(ramp).toEqual({
          '0': { add: 3, sum: 3, dist: [0, [1, 2], undefined] },
          '1': { add: 2, sum: 5, dist: [undefined, 3, 4] },
          '3': { add: 6, sum: 11, dist: [[5, 7], undefined, [8, 10]] },
        })
      })
    })
  })

  describe('createSpreadData', () => {
    describe('is root', () => {
      it('with changeSum > end', () => {
        const average = { average: 50, max: 100, min: 1 }
        const changeSum = 41
        const end = 40
        const max = 100
        const currentTimeRamp = { add: 1, sum: 1 }
        const res = createSpreadData({
          average,
          changeSum,
          end,
          max,
          currentTimeRamp,
        })
        // should always return undefined as the changeSum is already greater than max
        expect(res).toBeUndefined()
      })
      it('with changeSum <= end', () => {
        const average = { average: 50, max: 100, min: 1 }
        const changeSum = 34
        const end = 40
        const max = 100
        const currentTimeRamp = { add: 1, sum: 1 }
        const res = createSpreadData({
          average,
          changeSum,
          end,
          max,
          currentTimeRamp,
        })
        // should always return the value to get from 34 to 40(the end value)
        expect(res).toEqual({ add: 6 })
      })
      it('with changeCount > max', () => {
        const average = { average: 50, max: 100, min: 1 }
        const changeSum = 34
        const end = 100
        const max = 10
        const currentTimeRamp = { add: 1, sum: 1 }
        const res = createSpreadData({
          average,
          changeSum,
          end,
          max,
          currentTimeRamp,
        })
        // should always return the max value
        expect(res).toEqual({ add: 10 })
      })
      it('with changeCount <= max', () => {
        const average = { average: 3, max: 9, min: 1 }
        const changeSum = 34
        const end = 100
        const max = 10
        const currentTimeRamp = { add: 1, sum: 1 }
        const res = createSpreadData({
          average,
          changeSum,
          end,
          max,
          currentTimeRamp,
        })
        // should retun a value less then max
        expect(`${res.add}`).toMatch(new RegExp('^\\d$'))
      })
    })

    describe('is child', () => {
      it('with changeSum > end', () => {
        const average = { average: 50, max: 100, min: 1 }
        const changeSum = 41
        const end = 40
        const max = 100
        const currentTimeRamp = { add: 1, sum: 1 }
        const parentRamp = { add: 1, sum: 4 }
        const parentIndex = { start: 2, end: 4 }
        const res = createSpreadData({
          average,
          changeSum,
          parentRamp,
          parentIndex,
          end,
          max,
          currentTimeRamp,
        })
        // should always return undefined as the changeSum is already greater than max
        expect(res).toBeUndefined()
      })
      it('with changeSum <= end', () => {
        const average = { average: 50, max: 100, min: 1 }
        const changeSum = 34
        const end = 40
        const max = 100
        const currentTimeRamp = { add: 1, sum: 1 }
        const parentRamp = { add: 1, sum: 4 }
        const parentIndex = { start: 2, end: 4 }
        const res = createSpreadData({
          average,
          changeSum,
          parentRamp,
          parentIndex,
          end,
          max,
          currentTimeRamp,
        })
        // should always return the value to get from 34 to 40(the end value)
        // expect(res).toEqual({ add: 6, tmpDist: [undefined, undefined, 4, 2] })
        const expectedVal = res.add
        let actualVal = 0
        if (res.tmpDist[2] !== undefined) {
          actualVal += res.tmpDist[2]
        }
        if (res.tmpDist[3] !== undefined) {
          actualVal += res.tmpDist[3]
        }
        expect(expectedVal).toEqual(actualVal)
      })
      it('with changeCount > max', () => {
        const average = { average: 50, max: 100, min: 1 }
        const changeSum = 34
        const end = 100
        const max = 10
        const currentTimeRamp = { add: 1, sum: 1 }
        const parentRamp = { add: 1, sum: 4 }
        const parentIndex = { start: 2, end: 4 }
        const res = createSpreadData({
          average,
          changeSum,
          parentRamp,
          parentIndex,
          end,
          max,
          currentTimeRamp,
        })
        // should always return the max value
        // expect(res).toEqual({ add: 10, tmpDist: [undefined, undefined, 8, 4] })

        let allTmpVal = 0
        res.tmpDist.forEach(val => {
          allTmpVal += val
        })
        expect(res.add).toEqual(allTmpVal)
      })
      it('with changeCount <= max', () => {
        const average = { average: 3, max: 9, min: 1 }
        const changeSum = 34
        const end = 100
        const max = 10
        const currentTimeRamp = { add: 1, sum: 1 }
        const parentRamp = { add: 1, sum: 4 }
        const parentIndex = { start: 2, end: 4 }
        const res = createSpreadData({
          average,
          changeSum,
          parentRamp,
          parentIndex,
          end,
          max,
          currentTimeRamp,
        })
        // should retun a value less then max
        expect(`${res.add}`).toMatch(new RegExp('^\\d$'))
        expect(`${res.tmpDist}`).toBeDefined()
      })
      it('bigger data', () => {
        const average = { average: 15, max: 100, min: 1 }
        const changeSum = 34
        const end = 1000
        const max = 100
        const currentTimeRamp = { add: 1, sum: 1 }
        const parentRamp = { add: 35, sum: 36 }
        const parentIndex = { start: 2, end: 36 }
        const res = createSpreadData({
          average,
          changeSum,
          parentRamp,
          parentIndex,
          end,
          max,
          currentTimeRamp,
        })
        // should retun a value less then max
        expect(`${res.add}`).toMatch(new RegExp('^\\d+$'))
        expect(`${res.tmpDist}`).toBeDefined()
        let allTmpVal = 0
        res.tmpDist.forEach(val => {
          allTmpVal += val
        })
        expect(res.add).toEqual(allTmpVal)
        expect(res.tmpDist.length).toBeGreaterThan(32) // the number may change
      })
    })
  })

  describe('getAveragePerIteration', () => {
    it('iterations > count', () => {
      // the perParent si defined through the parentIndex values
      const iterations = 100
      const count = 10
      const res = getAveragePerIteration(iterations, count)
      expect(res).toEqual({ average: 0, max: 2, min: 0 })
    })

    it('iterations == count', () => {
      // the perParent si defined through the parentIndex values
      const iterations = 100
      const count = 100
      const res = getAveragePerIteration(iterations, count)
      expect(res).toEqual({ average: 1, max: 2, min: 0 })
    })

    it('iterations < count', () => {
      // the perParent si defined through the parentIndex values
      const iterations = 10
      const count = 100
      const res = getAveragePerIteration(iterations, count)
      expect(res).toEqual({ average: 10, max: 15, min: 5 })
    })
  })

  describe('createStartVal', () => {
    it('for root object no start, no existing val', () => {
      // the perParent si defined through the parentIndex values
      const currentTimeRamp = {}
      const start = undefined
      const res = createStartVal(currentTimeRamp, start, undefined, undefined)
      expect(res).toBe(undefined)
    })

    it('for root object no start, existing val', () => {
      // the perParent si defined through the parentIndex values
      const currentTimeRamp = { add: 3 }
      const start = undefined
      const res = createStartVal(currentTimeRamp, start, undefined, undefined)
      expect(res).toBe(undefined)
    })

    it('for root object no existing val', () => {
      // the perParent si defined through the parentIndex values
      const currentTimeRamp = {}
      const start = 4
      const res = createStartVal(currentTimeRamp, start, undefined, undefined)
      expect(res).toEqual({ add: 4 })
    })

    it('for root object existing val < start', () => {
      // the perParent si defined through the parentIndex values
      const currentTimeRamp = { add: 1 }
      const start = 4
      const res = createStartVal(currentTimeRamp, start, undefined, undefined)
      expect(res).toEqual({ add: 3 })
    })

    it('for root object existing val == start', () => {
      // the perParent si defined through the parentIndex values
      const currentTimeRamp = { add: 5 }
      const start = 5
      const res = createStartVal(currentTimeRamp, start, undefined, undefined)
      expect(res).toEqual({})
    })
    it('for root object existing val > start', () => {
      // the perParent si defined through the parentIndex values
      const currentTimeRamp = { add: 5 }
      const start = 4
      const res = createStartVal(currentTimeRamp, start, undefined, undefined)
      expect(res).toEqual({})
    })

    it('for child object no existing val, perParent', () => {
      // the perParent si defined through the parentIndex values
      const parentRamp = { add: 5, sum: 6 }
      const parentIndex = { start: 2, end: 6 }
      const currentTimeRamp = undefined
      const start = 4
      const res = createStartVal(
        currentTimeRamp,
        start,
        parentRamp,
        parentIndex
      )
      expect(res).toEqual({
        add: 16,
        tmpDist: [undefined, undefined, 4, 4, 4, 4],
      })
    })

    it('for child object no existing val, perIteration', () => {
      // the perParent si defined through the parentIndex values
      const parentRamp = { add: 5, sum: 6 }
      const parentIndex = { start: 0, end: 6 }
      const currentTimeRamp = undefined
      const start = 4
      const res = createStartVal(
        currentTimeRamp,
        start,
        parentRamp,
        parentIndex
      )
      expect(res).toEqual({ add: 24, tmpDist: [4, 4, 4, 4, 4, 4] })
    })

    it('for child object existing val <, =, > start perParent', () => {
      // the perParent si defined through the parentIndex values
      const parentRamp = { add: 5, sum: 6 }
      const parentIndex = { start: 2, end: 6 }
      const currentTimeRamp = { add: 15, tmpDist: [1, 1, 1, 4, 8] }
      const start = 4
      const res = createStartVal(
        currentTimeRamp,
        start,
        parentRamp,
        parentIndex
      )
      expect(res).toEqual({
        add: 7,
        tmpDist: [undefined, undefined, 3, 0, 0, 4],
      })
    })

    it('for child object existing val <, =, > start perIteration', () => {
      // the perParent si defined through the parentIndex values
      const parentRamp = { add: 5, sum: 6 }
      const parentIndex = { start: 0, end: 6 }
      const currentTimeRamp = { add: 15, tmpDist: [1, 1, 1, 4, 8] }
      const start = 4
      const res = createStartVal(
        currentTimeRamp,
        start,
        parentRamp,
        parentIndex
      )
      expect(res).toEqual({ add: 13, tmpDist: [3, 3, 3, 0, 0, 4] })
    })
  })

  describe('getParentIndices', () => {
    it('perIteration', () => {
      const parentRamp = {
        add: 5,
        sum: 11,
      }
      const index = getParentIndices('perIteration', parentRamp)
      expect(index).toEqual({ start: 0, end: 11 })
    })

    it('perParent', () => {
      const parentRamp = {
        add: 5,
        sum: 11,
      }
      const index = getParentIndices('perParent', parentRamp)
      expect(index).toEqual({ start: 6, end: 11 })
    })
  })

  describe('createMinVal', () => {
    it('for root object', () => {
      // the perParent si defined through the parentIndex values
      const min = 2
      const res = createMinVal(min, undefined, undefined)
      expect(res).toEqual({
        add: 2,
      })
    })

    it('perParent', () => {
      // the perParent si defined through the parentIndex values
      const min = 2
      const parentRamp = {
        add: 5,
        sum: 11,
      }
      const parentIndex = {
        start: 6,
        end: 11,
      }
      const res = createMinVal(min, parentRamp, parentIndex)
      expect(res).toEqual({
        add: 10,
        tmpDist: [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          2,
          2,
          2,
          2,
          2,
        ],
      })
    })

    it('perParent', () => {
      // the perParent si defined through the parentIndex values
      const min = 2
      const parentRamp = {
        add: 5,
        sum: 11,
      }
      const parentIndex = {
        start: 0,
        end: 11,
      }
      const res = createMinVal(min, parentRamp, parentIndex)
      expect(res).toEqual({
        add: 22,
        tmpDist: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      })
    })

    it('no min value', () => {
      // the perParent si defined through the parentIndex values
      const min = 0
      const parentRamp = {
        add: 5,
        sum: 11,
      }
      const parentIndex = {
        start: 0,
        end: 3,
      }
      const res = createMinVal(min, parentRamp, parentIndex)
      expect(res).toEqual(undefined)
    })
  })

  describe('mergeResult', () => {
    it('newResult undefined', () => {
      const result = { '1': { add: 5, sum: 7 } }
      mergeResult(1, result, undefined)
      expect(result).toEqual({ '1': { add: 5, sum: 7 } })
    })

    it('newResult.add undefined', () => {
      const result = { '1': { add: 5, sum: 7 } }
      const newResult = { sum: 10 }
      mergeResult(1, result, newResult)
      expect(result).toEqual({ '1': { add: 5, sum: 7 } })
    })

    it('result for iteration is undefined', () => {
      const result = { '1': { add: 5, sum: 7 } }
      const newResult = { sum: 10, add: 3 }
      mergeResult(2, result, newResult)
      expect(result).toEqual({
        '1': { add: 5, sum: 7 },
        '2': { add: 3, sum: 10 },
      })
    })

    it('result.add for iteration is undefined', () => {
      const result = { '1': { sum: 7 } }
      const newResult = { sum: 10, add: 3 }
      mergeResult(1, result, newResult)
      expect(result).toEqual({ '1': { add: 3, sum: 7 } })
    })

    it('result.add adn newResult.add', () => {
      const result = { '1': { sum: 7, add: 3 } }
      const newResult = { sum: 10, add: 3 }
      mergeResult(1, result, newResult)
      expect(result).toEqual({ '1': { add: 6, sum: 7 } })
    })

    it('both undefined', () => {
      const result = undefined
      const newResult = undefined
      mergeResult(1, result, newResult)
      expect(result).toBe(undefined)
    })

    it('tmpDist: new tmpDist undefined ', () => {
      const result = { '1': { add: 7, tmpDist: [1, 3, 2, 1] } }
      const newResult = { sum: 10, add: 3 }
      mergeResult(1, result, newResult)
      expect(result).toEqual({ '1': { add: 10, tmpDist: [1, 3, 2, 1] } })
    })

    it('tmpDist: result tmpDist undefined ', () => {
      const result = { '1': { add: 7 } }
      const newResult = { sum: 10, add: 3, tmpDist: [1, 3, 2, 1] }
      mergeResult(1, result, newResult)
      expect(result).toEqual({ '1': { add: 10, tmpDist: [1, 3, 2, 1] } })
    })

    it('tmpDist: both defined ', () => {
      const result = { '1': { add: 7, tmpDist: [1, 1, 1, 1] } }
      const newResult = { sum: 10, add: 3, tmpDist: [1, 3, 2, 1] }
      mergeResult(1, result, newResult)
      expect(result).toEqual({ '1': { add: 10, tmpDist: [2, 4, 3, 2] } })
    })
  })
})
