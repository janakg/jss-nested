'use strict'

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
  jss.uid.reset()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '& b': {float: 'left'}
    }
  })
  ok(sheet.rules['.a--jss-0-0'])
  ok(sheet.rules['.a--jss-0-0 b'])
  equal(sheet.toString(), '.a--jss-0-0 {\n  float: left;\n}\n.a--jss-0-0 b {\n  float: left;\n}')
})

test('nesting in a conditional namespaced rule', function () {
  jss.uid.reset()
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
  ok(sheet.rules['.a--jss-0-0'])
  ok(sheet.rules['@media'])
  equal(sheet.toString(), '.a--jss-0-0 {\n  color: green;\n}\n@media {\n  .a--jss-0-0:hover {\n    color: red;\n  }\n}')
})
