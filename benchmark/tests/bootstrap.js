import {create} from 'jss'
import nestedBootstrap from '../fixtures/modify_bootstrap.json'

import nested from '../../src/index'

const jss = create()

jss.use(nested())

suite('Bootstrap JSS to CSS', () => {
  benchmark('named with nested .toString()', () => {
    jss
      .createStyleSheet(nestedBootstrap)
      .toString()
  })
})
