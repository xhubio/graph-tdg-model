'use strict'

// eslint-disable-next-line no-unused-vars
export function printMe(timeRamp) {
  const lines = []
  lines.push(`{`)
  Object.keys(timeRamp).forEach(objName => {
    lines.push(`	"${objName}":{`)
    lines.push(`	  data:{`)
    Object.keys(timeRamp[objName].data).forEach(iter => {
      const val = timeRamp[objName].data[iter]
      lines.push(`	    "${iter}":${JSON.stringify(val)},`)
    })
    lines.push(`	  },`)

    Object.keys(timeRamp[objName]).forEach(key => {
      if (key !== 'data') {
        const val = timeRamp[objName][key]
        lines.push(`	  "${key}":${JSON.stringify(val)}`)
      }
    })

    lines.push(`	},`)
  })
  lines.push(`}`)

  return lines.join('\n')
}
