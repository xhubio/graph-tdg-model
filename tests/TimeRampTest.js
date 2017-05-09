'use strict'

import {
  getParentIndices,
  createMinVal,
  createStartVal,
  mergeResult,
} from '../lib/TimeRamp2'
// import { assert } from 'chai'

describe('TimeRamp', () => {
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

    it('hier weiter', () => {
      expect(true).toEqual(false)
    })

    // 'for child object no existing val, perParent'
    // 'for child object no existing val, perIteration'
    // 'for child object existing val <, =, > start perParent'
    // 'for child object existing val <, =, > start perIteration'
    //
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
