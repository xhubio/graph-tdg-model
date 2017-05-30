'use strict'

import logger from 'winston'
import assert from 'assert'

/**
 * Create the time ramp and dependencies between the objects.
 * Defines how many object should be created for each iteration
 *
 * The created data ramo looks like this:
 *  {
 *  		"<objectName>": {
 *     		"<iteration>": {
 *        "add"    : 5,												// how many objects will be added in this iteration
 *        "sum"    : 123											// how many objects where already added by this and the other iterations
 * 				"parent" : "<parentObjectName>",		// only set if this is not a root object
 *				"dist"   : [[0,16], [17,45], [46,66], [67,97]] // how many new objectz belong to which parent
 *     }
 *  }
 * The 'dist' property is an array. Each position in this array references the parent element. In this example
 * the parent has 4 elements. The first parent element will get the child element 0 to 16. So the elements
 * in the sub array defining a range of elements.
 *
 */
export function createTimeRamp({ timeShift, generationOrder }) {
  assert.ok(timeShift, 'TimeShift is not set')
  assert.ok(generationOrder, 'GenerationOrder is not set')
  logger.debug(`Create time ramp start'`, { function: 'createTimeRamp' })

  // stores the created time ramp
  const result = {}

  const resChildren = workOnChildren(timeShift, generationOrder)
  Object.keys(resChildren).forEach(name => {
    result[name] = resChildren[name]
  })
  return result
}

/**
 * Works on the elements of the generationOrder. It traveres this tree
 * recursivly.
 * @param timeShift {number} The timeShift configuration
 * @param generationOrder {object} The tree defining how to generate the objects
 * @param parentTimeRamp {object} The ramp up data object from the parent object
 * @param parentName {string} The name of the parent object
 * @return result {object} The amount of data to be created per iteration
 */
function workOnChildren(
  timeShift,
  generationOrder,
  parentTimeRamp,
  parentName
) {
  const result = {}
  if (generationOrder !== undefined) {
    Object.keys(generationOrder).forEach(childName => {
      const params = {
        iterations: timeShift.iterations,
        parentName,
        parentTimeRamp,
        objectConfig: {
          name: childName,
          ...timeShift.changes[childName],
          ...generationOrder[childName],
        },
      }
      // create the data for the current child object
      result[childName] = createRamp(params)

      // create the data for all the children
      const resChildren = workOnChildren(
        timeShift,
        generationOrder[childName].children,
        result[childName],
        childName
      )
      Object.keys(resChildren).forEach(name => {
        result[name] = resChildren[name]
      })
    })
  }

  return result
}

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

/**
 * Creates the timeramp for one object
 * @param iterations {number} The count of iterations
 * @param objectConfig {object} The configuration of this object
 * @param parentTimeRamp {object} The ramp up data object from the parent object
 * @param parentName {string} The name of the parent object
 * @return result {object} The amount of data to be created per iteration
 */
export function createRamp({
  iterations,
  objectConfig,
  parentTimeRamp,
  parentName,
}) {
  logger.debug(`Create time ramp for '${objectConfig.name}'`, {
    function: 'createRamp',
    object: objectConfig.name,
    parent: parentName,
  })

  // the summary count of all objects for all iterations
  // let changeSumAll = 0
  const { res, changeSumAll } = createRampMinStartVal({
    iterations,
    parentTimeRamp,
    objectConfig,
  })

  createRampRestValue({
    iterations,
    parentTimeRamp,
    objectConfig,
    currentTimeRamp: res,
    changeSumAll,
  })

  if (parentName) {
    Object.keys(res).forEach(key => {
      res[key].parent = parentName
    })
  }

  logger.debug(`Result`, { function: 'createRamp', result: res })

  const isPerIteration =
    objectConfig.type !== undefined && objectConfig.type === 'perIteration'

  const sumOfObjects = createSum({ ramp: res, isPerIteration })

  logger.info(
    `Created '${sumOfObjects}' objects of type '${objectConfig.name}'`,
    { function: 'createRamp' }
  )

  setParentCount({
    iterations,
    parentTimeRamp,
    result: res,
    isPerIteration,
  })

  return res
}

/**
 * Set the parent count for each child object
 * @param iterations {number} The count of iterations
 * @param parentTimeRamp {object} The ramp up data object from the parent object
 * @param result {object} The currnet result timeRamp
 * @param isPerIteration {boolean} Defines if the child values should be created perIteration or perParent
 */
export function setParentCount({
  iterations,
  parentTimeRamp,
  result,
  isPerIteration,
}) {
  if (parentTimeRamp) {
    let lastParentSum = 0 // the sum of the last parent value

    for (let i = 0; i < iterations; i++) {
      let parentTimeRampPart

      // ------------------------------------
      // Set parent start value
      // ------------------------------------
      if (result[i] !== undefined && result[i].parent !== undefined) {
        if (isPerIteration) {
          result[i].distStart = 0
        } else {
          result[i].distStart = lastParentSum
        }
      }

      if (parentTimeRamp !== undefined) {
        parentTimeRampPart = parentTimeRamp[i]
        if (
          parentTimeRampPart !== undefined &&
          parentTimeRampPart.sum !== undefined
        ) {
          lastParentSum = parentTimeRampPart.sum
        }
      }

      const parentCount = isPerIteration
        ? lastParentSum
        : parentTimeRampPart ? parentTimeRampPart.add : undefined

      // ------------------------------------
      // Set parent count
      // ------------------------------------
      if (parentCount && result[i]) {
        result[i].parentCount = parentCount
      }
    }
  }
}

/**
 * Creates the timeramp min vale and start val for one object
 * @param iterations {number} The count of iterations
 * @param parentTimeRamp {object} The ramp up data object from the parent object
 * @param objectConfig {object} The configuration of this object
 * @return result {object} The amount of data to be created per iteration
 */
export function createRampMinStartVal({
  iterations,
  parentTimeRamp,
  objectConfig,
}) {
  // this is a child object
  const isChild = parentTimeRamp !== undefined

  // Only relevant if this is a child object. Defines if the children
  // should be created for each iteration or only for the existing parents
  const isPerIteration =
    objectConfig.type !== undefined && objectConfig.type === 'perIteration'

  const res = {}
  let changeSumAll = 0
  let lastParentSum = 0 // the sum of the last parent value
  for (let i = 0; i < iterations; i++) {
    let parentForCurrentIteration = false

    let parentTimeRampPart
    if (parentTimeRamp !== undefined) {
      parentTimeRampPart = parentTimeRamp[i]
      if (
        parentTimeRampPart !== undefined &&
        parentTimeRampPart.sum !== undefined
      ) {
        parentForCurrentIteration = true
        lastParentSum = parentTimeRampPart.sum
      }
    }

    const parentCount = isPerIteration || !isChild
      ? lastParentSum
      : parentTimeRampPart ? parentTimeRampPart.add : undefined

    if (
      parentForCurrentIteration ||
      !isChild ||
      (isPerIteration && parentCount > 0)
    ) {
      // ------------------------------------
      // Set min values
      // ------------------------------------
      const resMin = createMinVal({
        min: objectConfig.min,
        parentCount,
        isChild,
      })
      changeSumAll = addChangeSum({
        changeSum: changeSumAll,
        newResult: resMin,
      })
      mergeResult({ iteration: i, result: res, newResult: resMin })

      if (i === 0) {
        // ------------------------------------
        // Set start values
        // ------------------------------------
        const resStart = createStartVal({
          start: objectConfig.start,
          min: objectConfig.min,
          parentCount,
          isChild,
        })
        changeSumAll = addChangeSum({
          changeSum: changeSumAll,
          newResult: resStart,
        })
        mergeResult({ iteration: i, result: res, newResult: resStart })
      }
    }
  }
  return { res, changeSumAll }
}

/**
 * Claculates the end value for a child object if none is given
 * @param iterations {number} The count of iterations
 * @param isPerIteration {boolean} Defines if the child values should be created perIteration or perParent
 * @param parentTimeRamp {object} The ramp up data object from the parent object
 * @param average {number} The number to multiply with the parents or the iterations
 * @return endValue {number} The calculated endValue
 */
export function calculateEndValue({
  parentTimeRamp,
  isPerIteration,
  iterations,
  average,
}) {
  // this is a child. So we take the average value
  let sum = 0
  if (isPerIteration) {
    // calculate the end value
    for (let i = 0; i < iterations; i++) {
      if (parentTimeRamp[i] !== undefined) {
        sum += parentTimeRamp[i].sum
      }
    }
  } else {
    let iter = iterations - 1
    while (sum === 0 && iter >= 0) {
      if (parentTimeRamp[iter] !== undefined) {
        sum = parentTimeRamp[iter].sum
      }
      iter--
    }
  }
  return sum * average
}

/**
 * Creates the timeramp rest values not created by min and start value. The given time ramp
 * will be updated by this function
 * @param iterations {number} The count of iterations
 * @param parentTimeRamp {object} The ramp up data object from the parent object
 * @param objectConfig {object} The configuration of this object
 * @param currentTimeRamp {object} The currently created values
 * @param changeSumAll {number} The coiunt of the currently created values
 * @return changeSumAll {number} The new change sum
 */
export function createRampRestValue({
  iterations,
  parentTimeRamp,
  objectConfig,
  currentTimeRamp,
  changeSumAll,
}) {
  let changeSumAllNew = changeSumAll
  const isChild = parentTimeRamp !== undefined

  // Only relevant if this is a child object. Defines if the children
  // should be created for each iteration or only for the existing parents
  const isPerIteration =
    objectConfig.type !== undefined && objectConfig.type === 'perIteration'

  if (
    (objectConfig.end === undefined && !isChild) ||
    (objectConfig.end === undefined &&
      objectConfig.min !== undefined &&
      objectConfig.min > 0) || // if min is defined no rest value calculation
    objectConfig.end === 0 ||
    objectConfig.end <= changeSumAllNew
  ) {
    // nothing to do
    return changeSumAllNew
  } else if (objectConfig.end === undefined) {
    // this is a child. So we take the average value
    // and claculate an end value
    let newEnd = 0
    let val = 1

    if (objectConfig.max !== undefined) {
      val = Math.floor(objectConfig.max / 2)
    }
    if (val === 0) {
      val = 1
    }

    newEnd = calculateEndValue({
      parentTimeRamp,
      isPerIteration,
      iterations,
      average: val,
    })

    objectConfig.end = newEnd
    logger.info(
      `Calculate 'end' value for object '${objectConfig.name}' as '${newEnd}'`
    )
  }

  const countMissing = objectConfig.end - changeSumAllNew
  if (countMissing === 0) {
    return
  }

  const average = getAveragePerIteration({ iterations, count: countMissing })

  let i = 0
  let lastChangeSum = changeSumAllNew
  let lastParentSum = 0
  while (changeSumAllNew < objectConfig.end) {
    if (i === iterations) {
      // the end was reached, restart
      i = 0
      if (changeSumAllNew === lastChangeSum) {
        // in this iteration was now new data added. This is in error
        logger.error(`No new items added in iteration ${i}`)
        break
      } else {
        lastChangeSum = changeSumAllNew
      }
    }

    // if the end value is reached, stop here
    if (changeSumAllNew === objectConfig.end) {
      break
    }

    let parentIndex
    let parentTimeRampPart
    if (isChild) {
      parentTimeRampPart = parentTimeRamp[i]
      if (
        parentTimeRampPart !== undefined &&
        parentTimeRampPart.sum !== undefined
      ) {
        // if per iteration we data from the first iteration to this one
        lastParentSum = parentTimeRampPart.sum
      }

      if (isPerIteration) {
        parentIndex = lastParentSum
      } else if (!isPerIteration && parentTimeRampPart !== undefined) {
        parentIndex = parentTimeRampPart.add
      }
    }

    if ((isChild && parentIndex > 0) || !isChild) {
      const resData = createSpreadData({
        average,
        changeSum: changeSumAllNew,
        parentRamp: parentTimeRampPart,
        parentIndex,
        end: objectConfig.end,
        max: objectConfig.max,
        currentTimeRampPart: currentTimeRamp[i],
      })
      changeSumAllNew = addChangeSum({
        changeSum: changeSumAllNew,
        newResult: resData,
      })
      mergeResult({
        iteration: i,
        result: currentTimeRamp,
        newResult: resData,
      })
    }
    i++
  }

  return changeSumAllNew
}

// // convert the array of values to be added into an array of ranges
// if (ramp[iteration].tmpDist !== undefined) {
//   if (isPerIteration) {
//     ramp[iteration].distStart = 0
//   } else {
//     ramp[iteration].distStart = sumLastIteration
//   }
//
//   ramp[iteration].dist = []
//   ramp[iteration].tmpDist.forEach(val => {
//     if (val === undefined) {
//       ramp[iteration].dist.push(undefined)
//     } else {
//       if (val === 1) {
//         ramp[iteration].dist.push(lastEnd)
//       } else {
//         ramp[iteration].dist.push([lastEnd, lastEnd + val - 1])
//       }
//       lastEnd += val
//     }
//   })
//   delete ramp[iteration].tmpDist
// }

/**
 * Spreads the prepared data in one iteration
 * @param timeRamp {object} The ramp up data object of one iteration
 * @param objectConfig {object} The configuration of this object
 * @return changeSumAll {number} The new change sum
 */
export function spreadForIteration({ timeRamp, objectConfig }) {
  if (timeRamp.parentCount) {
    const start = objectConfig.start ? objectConfig.start : 0
    const min = objectConfig.min ? objectConfig.min : 0
    const parentCount = timeRamp.parentCount
    const countAll = timeRamp.add

    let count = 0
    const tmpDist = []
    if (min > 0) {
      for (let i = 0; i < parentCount; i++) {
        if (i === 0 && start) {
          if (start > min) {
            tmpDist.push(start)
            count += start
          } else {
            tmpDist.push(min)
            count += min
          }
        } else {
          tmpDist.push(min)
          count += min
        }
      }
    }

    let average = Math.floor((countAll - count) / parentCount)
    if (average === 0) {
      average = 1
    }

    const max = objectConfig.max ? objectConfig.max : countAll
    debugger
    // spread the rest over all the parents
    while (count < countAll) {
      let changeCount = Math.floor(Math.random() * average)
      if (changeCount === 0) {
        changeCount = 1
      }

      // get the index for which parent the data will be set
      const parentIdx = Math.floor(Math.random() * parentCount)
      if (tmpDist[parentIdx] === undefined) {
        tmpDist[parentIdx] = 0
      }

      if (tmpDist[parentIdx] + changeCount > max) {
        changeCount = max - tmpDist[parentIdx]
      }

      tmpDist[parentIdx] += changeCount
      count += changeCount
    }
    return tmpDist
  }
}

/**
 * creates the data for a specific iteration.
 * @param average {object} The computed average object
 * @param changeSum {number} The current change summary value. This value must not exceed the end value
 * @param parentRamp {object} The data ramp object of the parent
 * @param parentIndex {object} The index to use for the parent ramp
 * @param end {number} The maximal amount of data to create
 * @param max {number} The maximal amount of data to be added in one iteration
 * @return res {object} The ramp part of the current index and the changeSum
 */
export function createSpreadData({
  average,
  changeSum,
  // parentRamp,
  // parentIndex,
  end,
  max,
  // currentTimeRampPart = { tmpDist: [] },
}) {
  assert.ok(average)
  // assert.ok(changeSum)
  assert.ok(end)

  // the maximumm count to add
  const maxChange = max ? max : end

  // get current change count
  let changeCount =
    Math.floor(Math.random() * (average.max - average.min)) + average.min
  if (changeSum + changeCount > end) {
    changeCount = end - changeSum
  }
  if (changeCount > maxChange) {
    changeCount = maxChange
  }

  // set the change count to the result object
  if (changeCount > 0) {
    // initialize the object for this iteration
    const res = {
      add: changeCount,
    }

    // if (parentRamp !== undefined) {
    //   // this is a child object. We need to spread the data under the parent objects
    //
    //   res.tmpDist = []
    //
    //   let countToSpread = changeCount
    //   const spreadAverage = getAveragePerIteration({
    //     iterations: parentIndex,
    //     count: countToSpread,
    //   })
    //
    //   while (countToSpread > 0) {
    //     // Get the count to be set in this iteration
    //     let count =
    //       Math.floor(Math.random() * (spreadAverage.max - spreadAverage.min)) +
    //       spreadAverage.min
    //
    //     if (count > max) {
    //       count = max
    //     }
    //     if (count > countToSpread) {
    //       count = countToSpread
    //     }
    //
    //     if (count > 0) {
    //       // get the index for which parent the data will be set
    //       const parentIdx = Math.floor(Math.random() * parentIndex)
    //       if (res.tmpDist[parentIdx] === undefined) {
    //         res.tmpDist[parentIdx] = 0
    //       }
    //
    //       if (
    //         currentTimeRampPart[parentIdx] !== undefined &&
    //         currentTimeRampPart[parentIdx] > 0 &&
    //         currentTimeRampPart[parentIdx] + count > max
    //       ) {
    //         // decrease the count as necessary
    //         count = max - currentTimeRampPart[parentIdx]
    //       }
    //       res.tmpDist[parentIdx] += count
    //       countToSpread -= count
    //     }
    //   }
    // }

    return res
  }
}

/**
 * Takes a ramp up data object and enters the sum field and also adjust the tmpDist to dist Array
 * @param ramp {object} The data ramp to add the sum field
 * @return sum {number} The sum of the created objects
 */
export function createSum({ ramp }) {
  function compareNumbers(a, b) {
    return parseInt(a, 10) - parseInt(b, 10)
  }

  assert.ok(ramp)

  // ensures that the iterations are sorted correctly
  const iterations = Object.keys(ramp)
  iterations.sort(compareNumbers)

  let sum = 0 // the current sum value
  let sumLastIteration = 0
  for (let i = 0; i < iterations.length; i++) {
    const iteration = iterations[i]
    if (ramp[iteration].add !== undefined) {
      // create the sum field
      sum += ramp[iteration].add
      ramp[iteration].sum = sum
      sumLastIteration = sum
    }
  }

  return sumLastIteration
}

/**
 * Updates the change sum. The new value will be returned
 * @param changeSum {number} The current changeSum
 * @param newResult {object} The result to be merged
 * @return changeSum {number} The new updated changeSum
 */
export function addChangeSum({ changeSum, newResult }) {
  if (newResult !== undefined) {
    return changeSum + newResult.add
  }
  return changeSum
}

/**
 * Create the minimum and maximum change per iteration.
 * It takes the count and devides it be the amount of iterations.
 * this is the number of everage elememnts per iteration
 * @param iterations {number} The count of iterations
 * @param count {number} How many data should be created at whole
 * @return result {object} The object with the created values
 */
export function getAveragePerIteration({ iterations, count }) {
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
 * Merges the new result into the existing one
 * @param iteration {object} The current iteration
 * @param result {object} The current existing result for all the iterations
 * @param newResult {object} The result to be merged (only one iteration)
 */
export function mergeResult({ iteration, result, newResult }) {
  if (newResult !== undefined) {
    if (result[iteration] === undefined) {
      result[iteration] = newResult
    } else {
      const part = result[iteration]
      if (part.add !== undefined && newResult.add !== undefined) {
        part.add += newResult.add
      } else if (newResult.add !== undefined) {
        part.add = newResult.add
      }
    }
  }
}

/**
 * Creates the min values for one iteration
 * @param min {number} The minimum count of objects
 * @param parentCount {object} The time ramp of the parent object
 * @param isChild {boolean} If true, then this is a child object
 * @return res {object} A timeRamp object part
 */
export function createMinVal({ min, parentCount, isChild }) {
  if (min !== undefined && min > 0) {
    const res = {}
    if (isChild) {
      res.add = parentCount * min
    } else {
      res.add = min
    }
    return res
  }
}

/**
 * Creates the start values for the first iteration.
 * @param start {number} The start count of objects.
 * @param min {number} The minimum count of objects
 * @param parentCount {number} The number of the parent objects.
 * @param isChild {boolesn} If true, then this is a child object
 * @return res {object} A timeRamp object part
 */
export function createStartVal({ min, start, parentCount, isChild }) {
  if (start !== undefined && start > 0) {
    const minVal = min ? min : 0
    let startVal = 0
    if (start > minVal) {
      startVal = start - minVal
    } else if (minVal >= start) {
      startVal = 0
    } else {
      startVal = start
    }

    const res = { add: startVal }
    if (isChild) {
      res.add = parentCount * startVal
    }
    return res
  }
}
