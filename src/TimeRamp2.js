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
export default function createTimeRamp({ timeShift, generationOrder }) {
  logger.debug(`Create time ramp start'`, { function: 'createTimeRamp' })
  console.log('häää')

  // stores the created time ramp
  const resultTimeRamp = {}

  // console.log(JSON.stringify(timeShift, null, 2))

  // for how many iteration the data should be created
  const iterations = timeShift.iterations

  // iterate the root objects
  Object.keys(generationOrder).forEach(objectName => {
    logger.debug(`Create time ramp for '${objectName}'`, {
      function: 'createTimeRamp',
      object: objectName,
    })
    const objectConfig = {
      ...timeShift.changes[objectName],
      ...generationOrder[objectName],
    }
    objectConfig.name = objectName

    const params = {
      iterations,
      objectConfig,
    }

    // create the root data objects
    const res = createRamp(params)
    Object.keys(res).forEach(name => {
      resultTimeRamp[name] = res[name]
    })
  })

  return resultTimeRamp
}

/**
 * Handles the child objects of a parent object. This is a recursiv function
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
  const res = {}

  let changeSumAll = 0 // the summary count of all objects for all iterations

  // const name = objectConfig.name

  logger.debug(`Create time ramp for '${objectConfig.name}'`, {
    function: 'createRamp',
    object: objectConfig.name,
    parent: parentName,
  })

  for (let i = 0; i < iterations; i++) {
    let parentTimeRampPart
    if (parentTimeRamp !== undefined) {
      parentTimeRampPart = parentTimeRamp[i]
    }
    const parentIndex = getParentIndices(objectConfig, parentTimeRampPart)

    // ------------------
    // create min value
    // ------------------
    const resMin = createMinVal(
      objectConfig.min,
      parentTimeRampPart,
      parentIndex
    )
    changeSumAll = addChangeSum(changeSumAll, resMin)
    mergeResult(i, res, resMin)

    // ------------------
    // create start value
    // ------------------
    if (i === 0) {
      const resStart = createStartVal(
        objectConfig.start,
        parentTimeRampPart,
        parentIndex
      )
      changeSumAll = addChangeSum(changeSumAll, resStart)
      mergeResult(i, res, resStart)
    }
  }

  logger.debug(`Result`, { function: 'createRamp', result: res })

  return res
}

/**
 * Creates the start values for the first iteration
 * @param currentRes {object} The already existing timeRamp data for this iteration
 * @param start {number} The start count of objects
 * @param parentRamp {object} The time ramp of the parent object
 * @param parentIndex {object} An object with a 'start' and 'end' property.
 * @return res {object} A timeRamp object part
 */
export function createStartVal(
  currentTimeRamp,
  start,
  parentRamp,
  parentIndex
) {
  assert(currentTimeRamp)

  if (start !== undefined && start > 0) {
    const res = {}
    if (parentRamp !== undefined) {
      // this is a child object
      assert(parentIndex)

      res.tmpDist = []
      let sumCount = 0
      for (let i = parentIndex.start; i < parentIndex.end; i++) {
        let addVal = start
        if (currentTimeRamp.tmpDist[i] !== undefined) {
          if (currentTimeRamp.tmpDist[i] < start) {
            addVal = start - currentTimeRamp.tmpDist[i]
          } else {
            addVal = 0
          }
        }
        res.tmpDist[i] = addVal
        sumCount += addVal
      }
      res.add = sumCount
    } else if (currentTimeRamp.add === undefined) {
      res.add = start
    } else if (currentTimeRamp.add < start) {
      // we need to add additional values
      res.add = start - currentTimeRamp.add
    }

    return res
  }
}

/**
 * Updates the change sum. The new value will be returned
 * @param changeSum {number} The current changeSum
 * @param newResult {object} The result to be merged
 * @return changeSum {number} The new updated changeSum
 */
function addChangeSum(changeSum, newResult) {
  if (newResult !== undefined) {
    return changeSum + newResult.add
  }
  return changeSum
}

/**
 * Merges the new result into the existing one
 * @param iteration {object} The current iteration
 * @param result {object} The current existing result for all the iterations
 * @param newResult {object} The result to be merged (only one iteration)
 */
export function mergeResult(iteration, result, newResult) {
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

// type parentIndex = {
// 	start : number,
// 	end: number
// }
/**
 * Creates the index ranges for the array to be filled. If the parentRamp is not defined
 * it will return undefined
 * @param objectType {string} The config type of this object (perParent|perIteration)
 * @param parentRamp {object} The time ramp of the parent object
 * @return index {object} An object with a 'start' and 'end' property.
 */
export function getParentIndices(objectType, parentRamp) {
  assert(objectType)

  if (parentRamp !== undefined) {
    const add = parentRamp.add ? parentRamp.add : 0
    let start = 0
    const end = parentRamp.sum ? parentRamp.sum : 0
    if (objectType === 'perParent') {
      start = end - add
    }
    return {
      start,
      end,
    }
  }
  return undefined
}

/**
 * Creates the min values for one iteration
 * @param min {number} The minimum count of objects
 * @param parentRamp {object} The time ramp of the parent object
 * @param parentIndex {object} An object with a 'start' and 'end' property.
 * @return res {object} A timeRamp object part
 */
export function createMinVal(min, parentRamp, parentIndex) {
  if (min !== undefined && min > 0) {
    const res = {}
    if (parentRamp !== undefined) {
      // this is a child object
      assert(parentIndex)

      res.tmpDist = []
      let sumCount = 0
      for (let i = parentIndex.start; i < parentIndex.end; i++) {
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
