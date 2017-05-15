'use strict'

import logger from 'winston'
import assert from 'assert'

// // TODO: wenn perIteration. Dann die Daten nur erzeugen wenn sum > 0. Wenn zu diesem Zeitpunkt noch kein Parent da ist
// // können auch noch keine children existieren!!!

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
      // console.log(params)

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

// /**
//  * Creates the timeramp for one object
//  * @param iterations {number} The count of iterations
//  * @param objectConfig {object} The configuration of this object
//  * @param parentRamp {object} The ramp up data object from the parent object
//  * @param parentName {string} The name of the parent object
//  * @return result {object} The amount of data to be created per iteration
//  */
// export function createRamp({
//   iterations,
//   objectConfig,
//   parentTimeRamp,
//   parentName,
// }) {
//   const res = {}
//
//   // this is a child object
//   const isChild = parentTimeRamp !== undefined
//
//   const isPerIteration =
//     objectConfig.type !== undefined && objectConfig.type === 'perIteration'
//
//   let changeSumAll = 0 // the summary count of all objects for all iterations
//
//   // const name = objectConfig.name
//
//   logger.debug(`Create time ramp for '${objectConfig.name}'`, {
//     function: 'createRamp',
//     object: objectConfig.name,
//     parent: parentName,
//   })
//
//   // ------------------
//   // Set min and start values
//   // ------------------
//   let lastParentSum = 0 // the sum of the last parent value
//   for (let i = 0; i < iterations; i++) {
//     let parentForCurrentIteration = false
//
//     let parentTimeRampPart
//     if (parentTimeRamp !== undefined) {
//       parentTimeRampPart = parentTimeRamp[i]
//       if (
//         parentTimeRampPart !== undefined &&
//         parentTimeRampPart.sum !== undefined
//       ) {
//         parentForCurrentIteration = true
//         lastParentSum = parentTimeRampPart.sum
//       }
//     }
//
//     // const parentIndex = getParentIndices(
//     //   objectConfig,
//     //   parentTimeRampPart,
//     //   lastParentSum
//     // )
//
//     // let parentObjectCount = 0
//     // if (isPerIteration || !isChild) {
//     //   parentObjectCount = lastParentSum
//     // }else{
//     //   parentObjectCount = parentTimeRampPart.add
//     // }
//
//     let resMin
//     if (isPerIteration || !isChild) {
//       resMin = createMinVal(objectConfig.min, lastParentSum, isChild)
//     } else if (parentForCurrentIteration) {
//       resMin = createMinVal(objectConfig.min, parentTimeRampPart.add, isChild)
//     }
//     changeSumAll = addChangeSum({changeSumAll, resMin})
//     mergeResult(i, res, resMin)
//
//     // if (parentIndex !== undefined) {
//
//     // const resMin = createMinVal(
//     //   objectConfig.min,
//     //   parentTimeRampPart,
//     //   parentIndex
//     // )
//     // changeSumAll = addChangeSum({changeSumAll, resMin})
//     // mergeResult(i, res, resMin)
//     // }
//
//     // create start value
//     let resStart
//     if (isPerIteration || !isChild) {
//       resStart = createStartVal(objectConfig.start, res, lastParentSum, isChild)
//     } else if (parentForCurrentIteration) {
//       resStart = createStartVal(
//         objectConfig.start,
//         res,
//         parentTimeRampPart.add,
//         isChild
//       )
//     }
//     changeSumAll = addChangeSum({changeSumAll, resStart})
//     mergeResult(i, res, resStart)
//
//     // if (i === 0 && parentIndex !== undefined) {
//     //   const resStart = createStartVal(
//     //     res[i],
//     //     objectConfig.start,
//     //     parentTimeRampPart,
//     //     parentIndex
//     //   )
//     //   changeSumAll = addChangeSum({changeSumAll, resStart})
//     //   mergeResult(i, res, resStart)
//     // }
//   }
//
//   // ------------------
//   // Set the other values if needed
//   // ------------------
//   if (
//     objectConfig.end !== undefined &&
//     objectConfig.end > 0 &&
//     objectConfig.end > changeSumAll
//   ) {
//     const countMissing = objectConfig.end - changeSumAll
//     const average = getAveragePerIteration(iterations, countMissing)
//
//     // check if we could set data only on existing iterations or also for new ones.
//     // Root objects could always be set for all iterations. If a child, then the object
//     // type is relevant
//     let setForAllIterations = false
//     if (parentTimeRamp === undefined || objectConfig.type === 'perIteration') {
//       setForAllIterations = true
//     }
//
//     let i = 0
//     let lastChangeSum = changeSumAll
//     lastParentSum = 0
//     while (changeSumAll < objectConfig.end) {
//       if (i === iterations) {
//         // the end was reached, restart
//         i = 0
//         if (changeSumAll === lastChangeSum) {
//           // in this iteration was now new data added. This is in error
//           logger.error(`No new items added in iteration ${i}`)
//           break
//         } else {
//           lastChangeSum = changeSumAll
//         }
//       }
//
//       // if the end value is reached, stop here
//       if (changeSumAll === objectConfig.end) {
//         break
//       }
//
//       if (setForAllIterations || res[i] !== undefined) {
//         let parentTimeRampPart
//         if (parentTimeRamp !== undefined) {
//           parentTimeRampPart = parentTimeRamp[i]
//           if (
//             parentTimeRampPart !== undefined &&
//             parentTimeRampPart.sum !== undefined
//           ) {
//             lastParentSum = parentTimeRampPart.sum
//           }
//         }
//         const parentIndex = getParentIndices(
//           objectConfig,
//           parentTimeRampPart,
//           lastParentSum
//         )
//
//         // if (parentIndex !== undefined) {
//         // create the data
//         const resData = createSpreadData({
//           average,
//           changeSum: changeSumAll,
//           parentRamp: parentTimeRampPart,
//           parentIndex,
//           end: objectConfig.end,
//           max: objectConfig.max,
//           currentTimeRamp: res[i],
//         })
//
//         changeSumAll = addChangeSum({changeSumAll, resData})
//         mergeResult(i, res, resData)
//         // }
//       }
//       i++
//     }
//   }
//
//   logger.debug(`Result`, { function: 'createRamp', result: res })
//
//   createSum(res)
//
//   return res
// }

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
  debugger
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
          alreadyAdded: res[i] ? res[i].sum : undefined,
          currentTmpDist: res[i] ? res[i].tmpDist : undefined,
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
 * Creates the timeramp for one object
 * @param iterations {number} The count of iterations
 * @param objectConfig {object} The configuration of this object
 * @param parentRamp {object} The ramp up data object from the parent object
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
  const res = createRampMinStartVal({
    iterations,
    parentTimeRamp,
    objectConfig,
  })

  console.log(res)

  // // ------------------
  // // Set the other values if needed
  // // ------------------
  // if (
  //   objectConfig.end !== undefined &&
  //   objectConfig.end > 0 &&
  //   objectConfig.end > changeSumAll
  // ) {
  //   const countMissing = objectConfig.end - changeSumAll
  //   const average = getAveragePerIteration(iterations, countMissing)
  //
  //   // check if we could set data only on existing iterations or also for new ones.
  //   // Root objects could always be set for all iterations. If a child, then the object
  //   // type is relevant
  //   let setForAllIterations = false
  //   if (parentTimeRamp === undefined || objectConfig.type === 'perIteration') {
  //     setForAllIterations = true
  //   }
  //
  //   let i = 0
  //   let lastChangeSum = changeSumAll
  //   let lastParentSum = 0
  //   while (changeSumAll < objectConfig.end) {
  //     if (i === iterations) {
  //       // the end was reached, restart
  //       i = 0
  //       if (changeSumAll === lastChangeSum) {
  //         // in this iteration was now new data added. This is in error
  //         logger.error(`No new items added in iteration ${i}`)
  //         break
  //       } else {
  //         lastChangeSum = changeSumAll
  //       }
  //     }
  //
  //     // if the end value is reached, stop here
  //     if (changeSumAll === objectConfig.end) {
  //       break
  //     }
  //
  //     if (setForAllIterations || res[i] !== undefined) {
  //       let parentTimeRampPart
  //       if (parentTimeRamp !== undefined) {
  //         parentTimeRampPart = parentTimeRamp[i]
  //         if (
  //           parentTimeRampPart !== undefined &&
  //           parentTimeRampPart.sum !== undefined
  //         ) {
  //           lastParentSum = parentTimeRampPart.sum
  //         }
  //       }
  //       const parentIndex = getParentIndices(
  //         objectConfig,
  //         parentTimeRampPart,
  //         lastParentSum
  //       )
  //
  //       // if (parentIndex !== undefined) {
  //       // create the data
  //       const resData = createSpreadData({
  //         average,
  //         changeSum: changeSumAll,
  //         parentRamp: parentTimeRampPart,
  //         parentIndex,
  //         end: objectConfig.end,
  //         max: objectConfig.max,
  //         currentTimeRamp: res[i],
  //       })
  //
  //       changeSumAll = addChangeSum({ changeSumAll, resData })
  //       mergeResult(i, res, resData)
  //       // }
  //     }
  //     i++
  //   }
  // }

  logger.debug(`Result`, { function: 'createRamp', result: res })

  createSum(res)

  return res
}

/**
 * Takes a ramp up data object and enters the sum field and also adjust the tmpDist to dist Array
 * @param ramp {object} The data ramp to add the sum field
 */
export function createSum(ramp) {
  function compareNumbers(a, b) {
    return parseInt(a, 10) - parseInt(b, 10)
  }

  // ensures that the iterations are sorted correctly
  const iterations = Object.keys(ramp)
  iterations.sort(compareNumbers)

  let sum = 0 // the current sum value
  let lastEnd = 0 // the end of the last range value

  for (let i = 0; i < iterations.length; i++) {
    const iteration = iterations[i]
    if (ramp[iteration].add !== undefined) {
      // convert the array of values to be added into an array of ranges
      if (ramp[iteration].tmpDist !== undefined) {
        ramp[iteration].dist = []
        ramp[iteration].tmpDist.forEach(val => {
          if (val === undefined) {
            ramp[iteration].dist.push(undefined)
          } else {
            if (val === 1) {
              ramp[iteration].dist.push(lastEnd)
            } else {
              ramp[iteration].dist.push([lastEnd, lastEnd + val - 1])
            }
            lastEnd += val
          }
        })
        delete ramp[iteration].tmpDist
      }

      // create the sum field
      sum += ramp[iteration].add
      ramp[iteration].sum = sum
    }
  }
}

// /**
//  * Adds the data for a specific iteration.
//  * @param average {object} The computed average object
//  * @param changeSum {number} The current change summary value. This value must not exceed the end value
//  * @param parentRamp {object} The data ramp object of the parent
//  * @param parentIndex {object} The index to use for the parent ramp
//  * @param end {number} The maximal amount of data to create
//  * @param max {number} The maximal amount of data to be added in one iteration
//  * @return res {object} The ramp part of the current index and the changeSum
//  */
// export function createSpreadData({
//   average,
//   changeSum,
//   parentRamp,
//   parentIndex,
//   end,
//   max,
//   currentTimeRamp = { tmpDist: [] },
// }) {
//   assert.ok(average)
//   // assert.ok(changeSum)
//   assert.ok(end)
//
//   // the maximumm count to add
//   const maxChange = max ? max : end
//
//   // get current change count
//   let changeCount =
//     Math.floor(Math.random() * (average.max - average.min)) + average.min
//   if (changeSum + changeCount > end) {
//     changeCount = end - changeSum
//   }
//   if (changeCount > maxChange) {
//     changeCount = maxChange
//   }
//
//   // set the change count to the result object
//   if (changeCount > 0) {
//     // initialize the object for this iteration
//     const res = {
//       add: changeCount,
//     }
//
//     if (parentRamp !== undefined) {
//       // this is a child object. We need to spread the data under the parent objects
//
//       res.tmpDist = []
//
//       let countToSpread = changeCount
//       const spreadAverage = getAveragePerIteration(
//         parentIndex.end - parentIndex.start,
//         countToSpread
//       )
//
//       while (countToSpread > 0) {
//         // Get the count to be set in this iteration
//         let count =
//           Math.floor(Math.random() * (spreadAverage.max - spreadAverage.min)) +
//           spreadAverage.min
//
//         if (count > max) {
//           count = max
//         }
//         if (count > countToSpread) {
//           count = countToSpread
//         }
//
//         if (count > 0) {
//           // get the index for which parent the data will be set
//           const parentIdx =
//             Math.floor(Math.random() * (parentIndex.end - parentIndex.start)) +
//             parentIndex.start
//           if (res.tmpDist[parentIdx] === undefined) {
//             res.tmpDist[parentIdx] = 0
//           }
//
//           if (
//             currentTimeRamp[parentIdx] !== undefined &&
//             currentTimeRamp[parentIdx] > 0 &&
//             currentTimeRamp[parentIdx] + count > max
//           ) {
//             // decrease the count as necessary
//             count = max - currentTimeRamp[parentIdx]
//           }
//           res.tmpDist[parentIdx] += count
//           countToSpread -= count
//         }
//       }
//     }
//
//     return res
//   }
// }
//

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

      if (part.tmpDist !== undefined && newResult.tmpDist !== undefined) {
        for (let i = 0; i < newResult.tmpDist.length; i++) {
          if (
            part.tmpDist[i] !== undefined &&
            newResult.tmpDist[i] !== undefined
          ) {
            part.tmpDist[i] += newResult.tmpDist[i]
          } else if (newResult.tmpDist[i] !== undefined) {
            part.tmpDist[i] = newResult.tmpDist[i]
          }
        }
      } else if (newResult.tmpDist !== undefined) {
        part.tmpDist = newResult.tmpDist
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
      res.tmpDist = []
      let sumCount = 0
      for (let i = 0; i < parentCount; i++) {
        sumCount += min
        res.tmpDist[i] = min
      }
      res.add = sumCount
    } else {
      // this is a root object
      res.add = min
    }
    return res
  }
}

/**
 * Creates the start values for the first iteration.
 * @param start {number} The start count of objects.
 * @param alreadyAdded {number} The already existing count
 * @param currentTmpDist {object} The already existing tmpDist array for this iteration
 * @param parentCount {number} The number of the parent objects.
 * @param isChild {boolesn} If true, then this is a child object
 * @return res {object} A timeRamp object part
 */
export function createStartVal({
  start,
  alreadyAdded,
  currentTmpDist,
  parentCount,
  isChild,
}) {
  if (start !== undefined && start > 0) {
    const res = {}

    if (isChild) {
      res.tmpDist = []
      let sumCount = 0
      for (let i = 0; i < parentCount; i++) {
        let addVal = start
        if (currentTmpDist !== undefined && currentTmpDist[i] !== undefined) {
          if (currentTmpDist[i] < start) {
            addVal = start - currentTmpDist[i]
          } else {
            addVal = 0
          }
        }
        res.tmpDist[i] = addVal
        sumCount += addVal
      }
      res.add = sumCount
    } else if (alreadyAdded === undefined) {
      res.add = start
    } else if (alreadyAdded < start) {
      // we need to add additional values
      res.add = start - alreadyAdded
    }

    return res
  }
}
