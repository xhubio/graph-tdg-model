'use strict'

import {
  createSum,
  // createRampRestValue,
  createTimeRamp,
  spreadForIteration,
  createSpreadData,
  getAveragePerIteration,
  createRampMinStartVal,
  mergeResult,
  createMinVal,
  createStartVal,
} from '../lib/TimeRamp'

describe('createTimeRamp', () => {
  test.only('with changeSum > end', () => {
    const res = createTimeRamp({
      timeShift: TIME_SHIFT,
      generationOrder: GENERATION_ORDER,
    })
    console.log(printMe(res))
  })
})
//
// describe('createRampRestValue', () => {
//   describe('is root', () => {
//     it('xxxx', () => {
//       const currentTimeRamp = {}
//       const changeSum = createRampRestValue({
//         iterations: 5,
//         parentTimeRamp: undefined,
//         objectConfig: {
//           start: 0,
//           end: 70,
//           type: 'perIteration',
//           min: 2,
//           max: 20,
//         },
//         currentTimeRamp,
//         changeSumAll: 3,
//       })
//
//       expect(currentTimeRamp).toEqual({
//         '0': { add: 2 },
//         '1': { add: 2 },
//         '2': { add: 2 },
//         '3': { add: 2 },
//         '4': { add: 2 },
//       })
//       expect(changeSum).toEqual(5)
//     })
//   })
//   describe('is child', () => {})
// })

describe('spreadForIteration', () => {
  it('1', () => {
    const timeRamp = {
      add: 44,
      parent: 'account',
      sum: 58,
      distStart: 0,
      parentCount: 20,
    }
    const objectConfig = {
      end: 30,
      min: 1,
      type: 'perParent',
    }
    const res = spreadForIteration({ timeRamp, objectConfig })
    expect(res.length).toEqual(timeRamp.parentCount)
    let sum = 0
    res.forEach(val => {
      sum += val
    })
    expect(sum).toEqual(timeRamp.add)
  })
  it('2', () => {
    const timeRamp = {
      add: 44,
      parent: 'account',
      sum: 58,
      distStart: 0,
      parentCount: 6,
    }
    const objectConfig = {
      end: 30,
      min: 1,
      type: 'perParent',
    }
    const res = spreadForIteration({ timeRamp, objectConfig })
    expect(res.length).toEqual(timeRamp.parentCount)
    let sum = 0
    res.forEach(val => {
      sum += val
    })
    expect(sum).toEqual(timeRamp.add)
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
      const average = { average: 50, max: 100, min: 40 }
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
      const average = { average: 90, max: 100, min: 11 }
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
      expect(res.add).toBeGreaterThan(0)
      expect(res.add).toBeLessThan(11)
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
      const parentIndex = 2
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
      const parentIndex = 2
      const res = createSpreadData({
        average,
        changeSum,
        parentRamp,
        parentIndex,
        end,
        max,
        currentTimeRamp,
      })
      // should return the value to get from 34 to 40(the end value)
      // expect(res).toEqual({ add: 6, tmpDist: [undefined, undefined, 4, 2] })

      expect(res.add).toBeGreaterThan(0)
      expect(res.add).toBeLessThan(7)
    })
    it('with changeCount > max', () => {
      const average = { average: 50, max: 100, min: 1 }
      const changeSum = 34
      const end = 100
      const max = 10
      const currentTimeRamp = { add: 1, sum: 1 }
      const parentRamp = { add: 1, sum: 4 }
      const parentIndex = 2
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
      expect(res.add).toBeGreaterThan(0)
      expect(res.add).toBeLessThan(11)
    })
    it('with changeCount <= max', () => {
      const average = { average: 3, max: 9, min: 1 }
      const changeSum = 34
      const end = 100
      const max = 10
      const currentTimeRamp = { add: 1, sum: 1 }
      const parentRamp = { add: 1, sum: 4 }
      const parentIndex = 2
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
    })
    it('bigger data', () => {
      const average = { average: 15, max: 100, min: 1 }
      const changeSum = 34
      const end = 1000
      const max = 100
      const currentTimeRamp = { add: 1, sum: 1 }
      const parentRamp = { add: 35, sum: 36 }
      const parentIndex = 34
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
    })
  })
})

describe('createRampMinStartVal', () => {
  describe('min', () => {
    describe('root object', () => {
      it('set min', () => {
        const res = createRampMinStartVal({
          iterations: 5,
          parentTimeRamp: undefined,
          objectConfig: {
            start: 0,
            end: 700,
            type: 'perIteration',
            min: 2,
            max: 100,
          },
        })
        expect(res).toEqual({
          changeSumAll: 10,
          res: {
            '0': { add: 2 },
            '1': { add: 2 },
            '2': { add: 2 },
            '3': { add: 2 },
            '4': { add: 2 },
          },
        })
      })
    })
    describe('child object', () => {
      it('set min per iteration', () => {
        const res = createRampMinStartVal({
          iterations: 5,
          parentTimeRamp: {
            '1': { add: 3, sum: 3 },
            '2': { add: 1, sum: 4 },
            '4': { add: 1, sum: 5 },
          },
          objectConfig: {
            start: 0,
            end: 700,
            type: 'perIteration',
            min: 2,
            max: 100,
          },
        })
        expect(res).toEqual({
          changeSumAll: 32,
          res: {
            // "0" undefined because the parent does not exists AND no values till know
            '1': { add: 6 },
            '2': { add: 8 },
            '3': { add: 8 }, // "3" exists because there are values from before. So same result as for "2"
            '4': { add: 10 },
          },
        })
      })
      it('set min per perParent', () => {
        const res = createRampMinStartVal({
          iterations: 5,
          parentTimeRamp: {
            '1': { add: 3, sum: 3 },
            '2': { add: 1, sum: 4 },
            '4': { add: 1, sum: 5 },
          },
          objectConfig: {
            start: 0,
            end: 700,
            type: 'perParent',
            min: 2,
            max: 100,
          },
        })
        expect(res).toEqual({
          changeSumAll: 10,
          res: {
            // "0" undefined because the parent does not exists
            '1': { add: 6 },
            '2': { add: 2 },
            // "3" does not exists because there is no parent
            '4': { add: 2 },
          },
        })
      })
    })
  })
  describe('start', () => {
    describe('root object', () => {
      it('set start', () => {
        const res = createRampMinStartVal({
          iterations: 5,
          parentTimeRamp: undefined,
          objectConfig: {
            start: 3,
            end: 700,
            type: 'perIteration',
            min: 0,
            max: 100,
          },
        })
        expect(res).toEqual({ changeSumAll: 3, res: { '0': { add: 3 } } })
      })
      describe('child object', () => {
        it('set start per iteration', () => {
          const res = createRampMinStartVal({
            iterations: 5,
            parentTimeRamp: {
              '1': { add: 3, sum: 3 },
              '2': { add: 1, sum: 4 },
              '4': { add: 1, sum: 5 },
            },
            objectConfig: {
              start: 3,
              end: 700,
              type: 'perIteration',
              min: 0,
              max: 100,
            },
          })
          expect(res).toEqual({
            // even a start value need any parent number
            changeSumAll: 0,
            res: {},
          })
        })
        it('set start per iteration', () => {
          const res = createRampMinStartVal({
            iterations: 5,
            parentTimeRamp: {
              '0': { add: 3, sum: 3 },
              '1': { add: 1, sum: 4 },
              '2': { add: 1, sum: 5 },
            },
            objectConfig: {
              start: 3,
              end: 700,
              type: 'perIteration',
              min: 0,
              max: 100,
            },
          })
          expect(res).toEqual({
            // even a start value need any parent number
            changeSumAll: 9,
            res: { '0': { add: 9 } },
          })
        })

        it('set start per parent', () => {
          const res = createRampMinStartVal({
            iterations: 5,
            parentTimeRamp: {
              '0': { add: 3, sum: 3 },
              '1': { add: 1, sum: 4 },
              '2': { add: 1, sum: 5 },
            },
            objectConfig: {
              start: 3,
              end: 700,
              type: 'perParent',
              min: 0,
              max: 100,
            },
          })
          expect(res).toEqual({
            // even a start value need any parent number
            changeSumAll: 9,
            res: { '0': { add: 9 } },
          })
        })
      })
    })
  })
  describe('both', () => {
    it('min and start', () => {
      const res = createRampMinStartVal({
        iterations: 5,
        parentTimeRamp: {
          '0': { add: 3, sum: 3 },
          '1': { add: 1, sum: 4 },
          '2': { add: 1, sum: 5 },
          '3': { add: 2, sum: 5 },
        },
        objectConfig: {
          start: 3,
          end: 700,
          type: 'perIteration',
          min: 2,
          max: 100,
        },
      })
      expect(res).toEqual({
        changeSumAll: 47,
        res: {
          '0': { add: 9 },
          '1': { add: 8 },
          '2': { add: 10 },
          '3': { add: 10 },
          '4': { add: 10 },
        },
      })
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
      const resSum = createSum({ ramp })
      expect(resSum).toEqual(11)
    })
    it('wrong iteration order', () => {
      const ramp = {
        '0': { add: 3 },
        '3': { add: 5 },
        '2': { add: 1 },
        '1': { add: 2 },
      }
      const resSum = createSum({ ramp })
      expect(resSum).toEqual(11)
    })
    it('with gaps', () => {
      const ramp = { '0': { add: 3 }, '2': { add: 3 }, '3': { add: 5 } }
      const resSum = createSum({ ramp })
      expect(resSum).toEqual(11)
    })
  })
  describe('for child object', () => {
    it('right iteration order', () => {
      const ramp = {
        '0': { add: 3 },
        '1': { add: 2 },
        '2': { add: 1 },
        '3': { add: 5 },
      }
      const resSum = createSum({ ramp })
      expect(resSum).toEqual(11)
    })
    it('wrong iteration order', () => {
      const ramp = {
        '0': { add: 3 },
        '2': { add: 1 },
        '3': { add: 5 },
        '1': { add: 2 },
      }
      const resSum = createSum({ ramp })
      expect(resSum).toEqual(11)
    })
    it('with gaps', () => {
      const ramp = {
        '0': { add: 3 },
        '1': { add: 2 },
        '3': { add: 6 },
      }
      const resSum = createSum({ ramp })
      expect(resSum).toEqual(11)
    })
  })
})

describe('getAveragePerIteration', () => {
  it('iterations > count', () => {
    // the perParent si defined through the parentIndex values
    const iterations = 100
    const count = 10
    const res = getAveragePerIteration({ iterations, count })
    expect(res).toEqual({ average: 0, max: 2, min: 0 })
  })

  it('iterations == count', () => {
    // the perParent si defined through the parentIndex values
    const iterations = 100
    const count = 100
    const res = getAveragePerIteration({ iterations, count })
    expect(res).toEqual({ average: 1, max: 2, min: 0 })
  })

  it('iterations < count', () => {
    // the perParent si defined through the parentIndex values
    const iterations = 10
    const count = 100
    const res = getAveragePerIteration({ iterations, count })
    expect(res).toEqual({ average: 10, max: 15, min: 5 })
  })
})

describe('mergeResult', () => {
  it('newResult undefined', () => {
    const result = { '1': { add: 5, sum: 7 } }
    mergeResult({ iteration: 1, result, newResult: undefined })
    expect(result).toEqual({ '1': { add: 5, sum: 7 } })
  })

  it('newResult.add undefined', () => {
    const result = { '1': { add: 5, sum: 7 } }
    const newResult = { sum: 10 }
    mergeResult({ iteration: 1, result, newResult })
    expect(result).toEqual({ '1': { add: 5, sum: 7 } })
  })

  it('result for iteration is undefined', () => {
    const result = { '1': { add: 5, sum: 7 } }
    const newResult = { sum: 10, add: 3 }
    mergeResult({ iteration: 2, result, newResult })
    expect(result).toEqual({
      '1': { add: 5, sum: 7 },
      '2': { add: 3, sum: 10 },
    })
  })

  it('result.add for iteration is undefined', () => {
    const result = { '1': { sum: 7 } }
    const newResult = { sum: 10, add: 3 }
    mergeResult({ iteration: 1, result, newResult })
    expect(result).toEqual({ '1': { add: 3, sum: 7 } })
  })

  it('result.add adn newResult.add', () => {
    const result = { '1': { sum: 7, add: 3 } }
    const newResult = { sum: 10, add: 3 }
    mergeResult({ iteration: 1, result, newResult })
    expect(result).toEqual({ '1': { add: 6, sum: 7 } })
  })

  it('both undefined', () => {
    const result = undefined
    const newResult = undefined
    mergeResult({ iteration: 1, result, newResult })
    expect(result).toBe(undefined)
  })
})

describe('createStartVal', () => {
  describe('root object', () => {
    it('no start, no existing val', () => {
      const res = createStartVal({
        min: undefined,
        start: undefined,
        parentCount: undefined,
        isChild: false,
      })
      expect(res).toBe(undefined)
    })

    it('no start, existing val', () => {
      const res = createStartVal({
        min: 3,
        start: undefined,
        parentCount: undefined,
        isChild: false,
      })
      expect(res).toBe(undefined)
    })

    it('no existing val', () => {
      const res = createStartVal({
        min: undefined,
        start: 4,
        parentCount: undefined,
        isChild: false,
      })
      expect(res).toEqual({ add: 4 })
    })

    it('existing val < start', () => {
      const res = createStartVal({
        min: 1,
        start: 4,
        parentCount: undefined,
        isChild: false,
      })
      expect(res).toEqual({ add: 3 })
    })

    it('existing val == start', () => {
      const res = createStartVal({
        start: 5,
        min: 5,
        parentCount: undefined,
        isChild: false,
      })
      expect(res).toEqual({ add: 0 })
    })

    it('existing val > start', () => {
      const res = createStartVal({
        start: 4,
        min: 5,
        parentCount: undefined,
        isChild: false,
      })
      expect(res).toEqual({ add: 0 })
    })
  })
  describe('child object', () => {
    it('no existing val, perIteration and per parent', () => {
      const res = createStartVal({
        min: 0,
        start: 4,
        parentCount: 6,
        isChild: true,
      })
      expect(res).toEqual({ add: 24 })
    })
    it('existing val < start, perIteration and per parent', () => {
      const res = createStartVal({
        min: 2,
        start: 4,
        parentCount: 5,
        isChild: true,
      })
      expect(res).toEqual({
        add: 10,
      })
    })
    it('existing val = start, perIteration and per parent', () => {
      const res = createStartVal({
        min: 4,
        start: 4,
        parentCount: 5,
        isChild: true,
      })
      expect(res).toEqual({
        add: 0,
      })
    })
    it('existing val  > start, perIteration and per parent', () => {
      const res = createStartVal({
        min: 5,
        start: 4,
        parentCount: 5,
        isChild: true,
      })
      expect(res).toEqual({
        add: 0,
      })
    })
  })
})

describe('createMinVal', () => {
  it('for root object', () => {
    const res = createMinVal({ min: 2, parentCount: undefined, isChild: false })
    expect(res).toEqual({
      add: 2,
    })
  })

  it('perParent 1', () => {
    const res = createMinVal({ min: 2, parentCount: 5, isChild: true })
    expect(res).toEqual({
      add: 10,
    })
  })

  it('perParent 2', () => {
    const res = createMinVal({ min: 2, parentCount: 11, isChild: true })
    expect(res).toEqual({
      add: 22,
    })
  })

  it('no min value', () => {
    const res = createMinVal({ min: 0, parentCount: 3, isChild: true })
    expect(res).toEqual(undefined)
  })
})

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
            where:"user.parent.account.bazong = flup.parent"
            target:1
          }
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
                    where:"transaction.parent.parent.parent = beneficary.parent"
                    target:1
                  },
                  flup: {
                    where:"transaction.parent.parent.bazong = flup.parent"
                    target:{
                      min: 2,
                      max: 10
                    }
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
