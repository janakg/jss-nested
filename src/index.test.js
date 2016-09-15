import expect from 'expect.js'
import nested from './index'
import jssExtend from 'jss-extend'
import {create} from 'jss'

const noWarn = message => expect(message).to.be(undefined)

describe('jss-nested', () => {
  let jss

  beforeEach(() => {
    jss = create().use(nested({warn: noWarn}))
  })

  describe('nesting with space', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '& b': {float: 'left'}
        }
      }, {named: false})
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('a b')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'a b {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('nesting without space', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '&b': {float: 'left'}
        }
      }, {named: false})
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('ab')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'ab {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('multi nesting', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '&b': {float: 'left'},
          '& c': {float: 'left'}
        }
      }, {named: false})
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('ab')).to.not.be(undefined)
      expect(sheet.getRule('a c')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'ab {\n' +
        '  float: left;\n' +
        '}\n' +
        'a c {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('multi nesting in one selector', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '&b, &c': {float: 'left'}
        }
      }, {named: false})
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('ab, ac')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'ab, ac {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('.addRules()', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          height: '1px'
        }
      }, {named: false})

      sheet.addRules({
        b: {
          height: '2px',
          '& c': {
            height: '3px'
          }
        }
      })
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  height: 1px;\n' +
        '}\n' +
        'b {\n' +
        '  height: 2px;\n' +
        '}\n' +
        'b c {\n' +
        '  height: 3px;\n' +
        '}'
      )
    })
  })

  describe('nesting in a namespaced rule', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '& b': {float: 'left'}
        },
        c: {
          float: 'left'
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('.a-3182562902 b')).to.not.be(undefined)
      expect(sheet.getRule('c')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-3182562902 {\n' +
        '  float: left;\n' +
        '}\n' +
        '.a-3182562902 b {\n' +
        '  float: left;\n' +
        '}\n' +
        '.c-3787690649 {\n' +
        '  float: left;\n' +
        '}'
      )
    })
  })

  describe('nesting in a conditional namespaced rule', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          color: 'green'
        },
        '@media': {
          a: {
            '&:hover': {color: 'red'}
          }
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('@media')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-460900105 {\n' +
        '  color: green;\n' +
        '}\n' +
        '@media {\n' +
        '  .a-460900105:hover {\n' +
        '    color: red;\n' +
        '  }\n' +
        '}'
      )
    })
  })

  describe('nesting a conditional rule inside a regular rule', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          color: 'green',
          '@media': {
            width: '200px'
          }
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('@media')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-3036715211 {\n' +
        '  color: green;\n' +
        '}\n' +
        '@media {\n' +
        '  .a-3036715211 {\n' +
        '    width: 200px;\n' +
        '  }\n' +
        '}'
      )
    })
  })

  describe('merge nested conditional to container conditional', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          color: 'green',
          '@media': {
            width: '200px'
          }
        },
        '@media': {
          a: {
            color: 'blue'
          }
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('@media')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-3036715211 {\n' +
        '  color: green;\n' +
        '}\n' +
        '@media {\n' +
        '  .a-3036715211 {\n' +
        '    color: blue;\n' +
        '    width: 200px;\n' +
        '  }\n' +
        '}'
      )
    })
  })

  describe('merge nested conditional to container conditional with existing rule', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          color: 'green',
          '@media': {
            width: '200px'
          }
        },
        '@media': {
          b: {
            color: 'blue'
          }
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('@media')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-3036715211 {\n' +
        '  color: green;\n' +
        '}\n' +
        '@media {\n' +
        '  .b-1243194637 {\n' +
        '    color: blue;\n' +
        '  }\n' +
        '  .a-3036715211 {\n' +
        '    width: 200px;\n' +
        '  }\n' +
        '}'
      )
    })
  })

  describe('warnings', () => {
    let localJss
    let warning

    beforeEach(() => {
      const warn = message => {
        warning = message
      }
      localJss = create().use(nested({warn}))
    })

    afterEach(() => {
      warning = null
    })

    it('should warn when referenced rule is not found', () => {
      localJss.createStyleSheet({
        a: {
          '& $b': {float: 'left'}
        }
      })

      expect(warning).to.be('[JSS] Could not find the referenced rule "b".')
    })

    it('should warn when nesting is too deep', () => {
      localJss.createStyleSheet({
        a: {
          '& .a': {
            float: 'left',
            '& .b': {float: 'left'}
          }
        }
      })

      expect(warning).to.be('[JSS] Nesting is too deep "& .b".')
    })
  })

  describe('local refs', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          float: 'left',
          '& $b': {float: 'left'},
          '& $b-warn': {float: 'right'}
        },
        b: {
          color: 'red'
        },
        'b-warn': {
          color: 'orange'
        }
      })
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-1261267506 {\n' +
        '  float: left;\n' +
        '}\n' +
        '.a-1261267506 .b-3645560457 {\n' +
        '  float: left;\n' +
        '}\n' +
        '.a-1261267506 .b-warn-1549041947 {\n' +
        '  float: right;\n' +
        '}\n' +
        '.b-3645560457 {\n' +
        '  color: red;\n' +
        '}\n' +
        '.b-warn-1549041947 {\n' +
        '  color: orange;\n' +
        '}'
      )
    })
  })

  describe('nesting conditionals in combination with extend plugin', () => {
    let sheet
    let localJss

    beforeEach(() => {
      localJss = create().use(jssExtend()).use(nested())
      sheet = localJss.createStyleSheet({
        button: {
          color: 'green',
          'background-color': 'aqua',
          '@media': {
            width: '200px'
          }
        },
        'red-button': {
          extend: 'button',
          color: 'red'
        }
      })
    })

    it('should add rules', () => {
      expect(sheet.getRule('button')).to.not.be(undefined)
      expect(sheet.getRule('@media')).to.not.be(undefined)
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.button-148595348 {\n' +
        '  color: green;\n' +
        '  background-color: aqua;\n' +
        '}\n' +
        '.red-button-4175883671 {\n' +
        '  color: red;\n' +
        '  background-color: aqua;\n' +
        '}\n' +
        '@media {\n' +
        '  .button-148595348 {\n' +
        '    width: 200px;\n' +
        '  }\n' +
        '  .red-button-4175883671 {\n' +
        '    width: 200px;\n' +
        '  }\n' +
        '}'
      )
    })
  })
})
