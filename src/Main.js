'use strict'

import assert from 'assert'

import { createRamp, rampPerParent } from './TimeRamp'

// const DEFAULT_MAX = 1000000

// type ChangeDefinition = {
//   start ? : number,
//   end ? : number,
//   min ? : number,
//   max ? : number
// }
//
// type TimeShiftObject = {
//   iterations: number,
//   changes: ChangeDefinition
// }
// type ParentConfigItem =  {
// 	name: string,
// 	ramp,
// 	objectConfig: ChangeDefinition
// }

export default function doit({ timeShift, generationOrder, parentConfig = [] }) {
  const result = {}

  if (generationOrder === undefined) {
    return result
  }

  // for how many iteration the data should be created
  const iterations = timeShift.iterations


  Object.keys(generationOrder).forEach(name => {
    console.log(`Work on generation of: ${name}`)

    const objectConfig = timeShift.changes[name]

    let ramp
    if (parentConfig.length === 0) {
      // in this case just create the ramp without any other constraints
      assert(objectConfig, 'objectConfig')
      ramp = createRamp({ iterations: timeShift.iterations, ...objectConfig, name })
      // console.log(JSON.stringify(ramp, null, 2))
    } else {
      const parentConfigElement = parentConfig[parentConfig.length - 1]
      assert(parentConfigElement, 'parentConfigElement')

      const parentRamp = parentConfigElement.ramp
      assert(parentRamp, 'parentRamp')

      // console.log(`name -> ${name}`)

      let perParent
      let perIteration
      if (generationOrder[name].config !== undefined) {
        perParent = generationOrder[name].config.perParent
        perIteration = generationOrder[name].config.perIteration
      }

      ramp = rampPerParent({ iterations, parentRamp, objectConfig, perParent, perIteration, name })
    }

    result[name] = ramp

    // -----------------------------
    // work on the children
    // -----------------------------
    if (generationOrder[name].children !== undefined) {
      parentConfig.push({
        name,
        ramp,
        objectConfig
      })

      // work on the children
      const childrenRamp = doit({ timeShift, generationOrder: generationOrder[name].children, parentConfig })
      assert(childrenRamp, 'childrenRamp must not be undefined')

      parentConfig.pop()

      // console.log(JSON.stringify(childrenRamp, null, 2))

      Object.keys(childrenRamp).forEach(rampName => {
        // console.log(`add children ramp ${rampName}`)
        // console.log(`###################`)
        // console.log(JSON.stringify(childrenRamp, null, 2))
        // console.log(`###################`)
        result[rampName] = childrenRamp[rampName]
      })
    }

  })


  return result
}
