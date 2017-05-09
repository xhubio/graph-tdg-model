'use strict'

import logger from 'winston'

import createTimeRamp from '../lib/TimeRamp2'

import demo from './fixtures/demo'
// import fs from 'fs'

// import { assert } from 'chai'

logger.level = 'debug'

describe('Main', () => {

  it('test me', () => {

    const ramp = createTimeRamp({ timeShift: demo.timeShift, generationOrder: demo.generationOrder })

    // const iterations = demo.timeShift.iterations
    //
    // const res = {}
    // const keys = Object.keys(ramp)
    //
    // keys.forEach(key => {
    //   res[key] = []
    // })
    // for (let i = 0; i < iterations; i++) {
    //   keys.forEach(key => {
    //     let sum
    //     if (ramp[key][i] !== undefined && ramp[key][i].sum !== undefined) {
    //       sum = ramp[key][i].sum
    //     }
    //     res[key].push(sum)
    //   })
    // }
    //
    // const data = []
    // keys.forEach(key => {
    //   data.push(`${key};` + res[key].join(';'))
    // })
    //
    // // eslint-disable-next-line no-sync
    // fs.writeFileSync('./tests/volatile/data.csv', data.join(`\n`), { encoding: 'utf-8' })

    console.log('---- test')
    console.log(JSON.stringify(ramp, null, 2))

  })


})
