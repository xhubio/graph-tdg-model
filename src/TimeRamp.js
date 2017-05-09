'use strict'

import assert from 'assert'

/**
 * Create the minimum and maximum change per iteration
 * @param iterations {number} The count of iterations
 * @param count {number} How many data should be created at whole
 * @return result {object} The object with the created values
 */
function getAveragePerIteration({ iterations, count }) {
  assert(iterations && iterations > 0, 'Iterations must be greater than 0')
  assert(count && count > 0, 'Count must be greater than 0')

  const average = Math.floor(count / iterations)
  const min = Math.floor(average / 2)
  let max = Math.floor(min + average)
  if (max <= 1) {
    max = 2
  }
  return {
    average,
    min,
    max,
  }
}

/**
 * Create the ramp for the child components. These are depending on there parents
 *
 * const ramp = {
 * 	 "<iteration id>": {
 *     "add": <amount of data to be added in this iteration>
 *   }
 * }
 *
 * @param iterations {number} The count of iterations
 * @param parentRamp {object} The ramp up data object from the parent object
 * @param objectConfig {object} The configuration of this object
 * @param perParent {object} This object contains the imformation how to create the data per parent
 * @param perIteration {object} This object contains the imformation how to create the data per iteration
 * @param name {string} The name of the object working on
 * @return result {object} The amount of data to be created per iteration
 */
export function rampPerParent({
  iterations,
  parentRamp,
  objectConfig,
  perParent,
  perIteration,
  name,
}) {
  assert(
    iterations && iterations > 0,
    'iterations must be defined and greater than 0'
  )
  assert(parentRamp, 'parentRamp must be defined')
  assert(name, 'name must be defined')

  const res = {}
  let changeSum = 0

  // -----------------------------------
  // fill the minimum values
  // -----------------------------------
  if (perParent !== undefined && perParent.min > 0) {
    // the parent may not have an entry for each iteration
    Object.keys(parentRamp).forEach(iter => {
      res[iter] = {
        add: perParent.min,
      }
      changeSum += perParent.min
    })
  }

  // -----------------------------------
  // fill the minimum per iteration
  // -----------------------------------
  if (perIteration !== undefined && perIteration.min > 0) {
    let lastSum = 0
    for (let i = 0; i < iterations; i++) {
      if (parentRamp[i] !== undefined) {
        lastSum = parentRamp[i].sum
      }

      if (res[i] === undefined) {
        res[i] = {
          add: perIteration.min * lastSum,
        }
        changeSum += perIteration.min * lastSum
      } else if (res[i] < perIteration.min) {
        const val = perIteration.min * lastSum - res[i]
        res[i] += val
        changeSum += val
      }
    }
  }

  // -----------------------------------
  // add now the not yet added counts
  // -----------------------------------
  if (objectConfig !== undefined && objectConfig.end !== undefined) {
    // the amount of data not yet spread
    const restDataCount = objectConfig.end - changeSum
    const average = getAveragePerIteration({
      iterations,
      count: restDataCount,
    })

    // -----------------------------------
    // we can add the values on every iteration for every parent
    // so we go on the sum field of the parent
    // -----------------------------------
    if (perIteration !== undefined) {
      console.warn(
        'Das stimmt so noch nicht. bei perIteration muss der Wert mit der Summe der parents multiplizeirt werden'
      )
      // noch nicht klar ob der kommentar oben stimmt

      let i = 0
      let lastChangeSum = changeSum
      while (changeSum < objectConfig.end) {
        if (i === iterations) {
          i = 0
          if (changeSum === lastChangeSum) {
            // in this iteration was now new data added. This is in error
            console.error(`No new items added in iteration ${i}`)
            break
          } else {
            lastChangeSum = changeSum
          }
        }

        // if the end value is reached, stop here
        if (changeSum === objectConfig.end) {
          break
        }

        const addDataResult = addData({
          average,
          rampObject: res[i],
          changeSum,
          end: objectConfig.end,
          max: objectConfig.max,
        })
        changeSum = addDataResult.changeSum
        res[i] = addDataResult.rampObject
        i++
      }
    }

    if (perParent !== undefined) {
      const keys = Object.keys(res)

      let i = 0
      let lastChangeSum = changeSum
      while (changeSum < objectConfig.end) {
        if (i === keys.length - 1) {
          i = 0
          if (changeSum === lastChangeSum) {
            // in this iteration was now new data added. This is in error
            console.error(`No new items added in iteration ${i}`)
            break
          } else {
            lastChangeSum = changeSum
          }
        }

        // if the end value is reached, stop here
        if (changeSum === objectConfig.end) {
          break
        }

        const addDataResult = addData({
          average,
          rampObject: res[keys[i]],
          changeSum,
          end: objectConfig.end,
          max: objectConfig.max,
        })
        changeSum = addDataResult.changeSum
        res[keys[i]] = addDataResult.rampObject

        i++
      }
    }
  }

  if (perParent !== undefined) {
    // -------------------
    // There is NO end value defined
    // -------------------
    // just add values for each parent
    let min = perParent.min
    let max = perParent.max
    if (min === undefined) {
      min = 0
    }
    if (max === undefined) {
      max = 100
    }

    console.log('............ bin da ----------')

    Object.keys(parentRamp).forEach(iter => {
      const changeCount = Math.floor(Math.random() * (max - min)) + min
      if (changeCount > 0) {
        res[iter] = {
          add: changeCount,
        }
      }
    })
  }

  createSum({ ramp: res })

  return res
}

/**
 * Create the ramp of data changes per iteration. This method is called for all the topLevel components
 * @param iterations {number} The count of iterations
 * @param start {number} How many data should be created for iteration one
 * @param end {number} How many data should be created after the last iteration
 * @param min {number} The minimum of data which should be created per iteration
 * @param max {number} The maximum of data to be created per iteration
 * @param name {string} The name of the object working on
 * @return result {object} The amount of data to be created per iteration
 */
export function createRamp({ iterations, start = 0, end, min = 0, max, name }) {
  assert(iterations && iterations > 0, 'Iterations must be greater than 0')
  assert(end && end > 0, 'End must be greater than 0')

  const res = {}

  // set a default max value
  if (max === undefined) {
    // eslint-disable-next-line no-param-reassign
    max = end
  }

  // -----------------------------------
  // if a start value is defined set it
  // -----------------------------------
  let changeSum = start
  if (start > 0) {
    res[0] = {}
    res[0].add = start
  }

  // -----------------------------------
  // set a min value to all the iterations
  // -----------------------------------
  if (min > 0) {
    if (res[0] === undefined) {
      res[0] = {}
    }

    if (res[0].add < min) {
      const val = min - res[0]
      changeSum += val
      res[0].add += val
    }

    for (let i = 1; i < iterations; i++) {
      if (res[i] === undefined) {
        res[i] = {}
      }
      changeSum += min
      res[i].add = min
    }
  }

  // -----------------------------------
  // get the average change per iteration
  // -----------------------------------
  let average
  let startidx = 0
  if (res[0] === undefined) {
    // there where no start value given, so we start with an index of 0
    average = getAveragePerIteration({ iterations, count: end })
  } else {
    startidx = 1
    average = getAveragePerIteration({
      iterations: iterations - 1,
      count: end - changeSum,
    })
  }

  // -----------------------------------
  // now spread the rest over the iterations
  // -----------------------------------
  let i = startidx
  let lastChangeSum = changeSum
  while (changeSum < end) {
    if (i === iterations) {
      i = 1
      if (changeSum === lastChangeSum) {
        // in this iteration was now new data added. This is in error
        console.error(`No new items added in iteration ${i} for ${name}`)
        break
      } else {
        lastChangeSum = changeSum
      }
    }

    // if the end value is reached, stop here
    if (changeSum === end) {
      break
    }

    const addDataResult = addData({
      average,
      rampObject: res[i],
      changeSum,
      end,
      max,
    })

    changeSum = addDataResult.changeSum
    res[i] = addDataResult.rampObject

    i++
  }

  // create the sum field
  createSum({ ramp: res })

  return res
}

/**
 * Adds the data for a specified iteration
 * @param average {object} The computed average object
 * @param rampObject {object} The data ramp object on a specific ramp index
 * @param changeSum {number} The current change summary value
 * @param end {number} The maximal amount of data to create
 * @param max {number} The maximal amount of data to be added in one iteration
 * @return res {object} The ramp part of the current index and the changeSum
 */
function addData({ average, rampObject, changeSum, end, max }) {
  let res
  let maxChange = max

  if (rampObject !== undefined) {
    res = rampObject
  }
  if (maxChange === undefined) {
    maxChange = end
  }

  // get current change count
  let changeCount =
    Math.floor(Math.random() * (average.max - average.min)) + average.min
  if (changeSum + changeCount > end) {
    changeCount = end - changeSum
  }

  // set the change count to the result object
  if (changeCount > 0) {
    // initialize the object for this iteration
    if (res === undefined) {
      res = {}
    }

    if (changeCount > maxChange) {
      changeCount = maxChange
    }

    if (res.add === undefined) {
      res.add = changeCount
    } else {
      if (res.add + changeCount > maxChange) {
        changeCount = maxChange - res.add
      }
      res.add += changeCount
    }
  }
  return { changeSum: changeSum + changeCount, rampObject: res }
}

/**
 * Takes a ramp up data object and enters the sum field
 * @param ramp {object} The data ramp to add the sum field
 */
function createSum({ ramp }) {
  function compareNumbers(a, b) {
    return parseInt(a, 10) - parseInt(b, 10)
  }

  let sum = 0
  const keys = Object.keys(ramp)
  keys.sort(compareNumbers)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (ramp[key] !== undefined && ramp[key].add !== undefined) {
      sum += ramp[key].add
      ramp[key].sum = sum
    }
  }
}
