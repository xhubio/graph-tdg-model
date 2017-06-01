'use strict'

import path from 'path'
import fs from 'fs'

/**
 * Loads a json file and returns the json object
 */
export function loadJson(fileName) {
  const generationOrderFile = path.join(__dirname, 'fixtures', fileName)
  // eslint-disable-next-line no-sync
  const generationOrderContent = fs.readFileSync(generationOrderFile)
  return JSON.parse(generationOrderContent)
}
