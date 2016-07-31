'use strict'

var jss = window.jss.default

QUnit.module('Nested rules plugin', {
  setup: function () {
    jss.use(jssNested.default())
  },
  teardown: function () {
    jss.plugins.registry = []
  }
})

test('nesting with space', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '& b': {float: 'left'}
    }
  }, {named: false})
  ok(sheet.rules.a)
  ok(sheet.rules['a b'])
  equal(sheet.toString(), 'a {\n  float: left;\n}\na b {\n  float: left;\n}')
})

test('nesting without space', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b': {float: 'left'}
    }
  }, {named: false})
  ok(sheet.rules.a)
  ok(sheet.rules['ab'])
  equal(sheet.toString(), 'a {\n  float: left;\n}\nab {\n  float: left;\n}')
})

test('multi nesting', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b': {float: 'left'},
      '& c': {float: 'left'}
    }
  }, {named: false})
  ok(sheet.rules.a)
  ok(sheet.rules.ab)
  ok(sheet.rules['a c'])
  equal(sheet.toString(), 'a {\n  float: left;\n}\nab {\n  float: left;\n}\na c {\n  float: left;\n}')
})

test('multi nesting in one selector', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b, &c': {float: 'left'}
    }
  }, {named: false})
  ok(sheet.rules.a)
  ok(sheet.rules['ab, ac'])
  equal(sheet.toString(), 'a {\n  float: left;\n}\nab, ac {\n  float: left;\n}')
})

test('deep nesting', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b': {
        float: 'left',
        '&c': {
          float: 'left'
        }
      }
    }
  }, {named: false})
  ok(sheet.rules.a)
  ok(sheet.rules.ab)
  ok(sheet.rules.abc)
  equal(sheet.toString(), 'a {\n  float: left;\n}\nab {\n  float: left;\n}\nabc {\n  float: left;\n}')
})

test('addRules', function () {
  var sheet = jss.createStyleSheet({
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
  equal(sheet.toString(), 'a {\n  height: 1px;\n}\nb {\n  height: 2px;\n}\nb c {\n  height: 3px;\n}')
})

test('nesting in a namespaced rule', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '& b': {float: 'left'}
    }
  })
  ok(sheet.rules['.a-3182562902'])
  ok(sheet.rules['.a-3182562902 b'])
  equal(sheet.toString(), '.a-3182562902 {\n  float: left;\n}\n.a-3182562902 b {\n  float: left;\n}')
})

test('nesting in a conditional namespaced rule', function () {
  var sheet = jss.createStyleSheet({
    a: {
      color: 'green'
    },
    '@media': {
      a: {
        '&:hover': {color: 'red'}
      }
    }
  })
  ok(sheet.rules['.a-460900105'])
  ok(sheet.rules['@media'])
  equal(sheet.toString(), '.a-460900105 {\n  color: green;\n}\n@media {\n  .a-460900105:hover {\n    color: red;\n  }\n}')
})

test('local rule ref', function () {
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '& $b': {float: 'left'}
    },
    b: {
      color: 'red'
    }
  })

  var css = '' +
    '.a-2101561448 {\n' +
    '  float: left;\n' +
    '}\n' +
    '.b-3645560457 {\n' +
    '  color: red;\n' +
    '}\n' +
    '.a-2101561448 .b-3645560457 {\n' +
    '  float: left;\n' +
    '}'

  equal(sheet.toString(), css)
})
