const consoleWarn = console.warn.bind(console) // eslint-disable-line no-console
const parentRegExp = /&/g
const refRegExp = /\$(\w+)/g

/**
 * Convert nested rules to separate, remove them from original styles.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssNested({warn = consoleWarn} = {}) {
  // Get a function to be used for $ref replacement.
  function getReplaceRef(container) {
    return (match, name) => {
      const rule = container.getRule(name)
      if (rule) return rule.selector
      warn(`[JSS] Could not find the referenced rule "${name}".`)
      return name
    }
  }

  function handeNestedRule(prop, rule, container, options, replaceRef) {
    const name = prop
      // Replace all & by the parent selector.
      .replace(parentRegExp, rule.selector)
      // Replace all $ref.
      .replace(refRegExp, replaceRef)

    container.addRule(name, rule.style[prop], options)
  }

  function handleNestedConditional(prop, rule, container) {
    const name = prop  // e.g. @media print
    const containerConditionalRule = container.getRule(name)

    // check if conditional rule already exists in container
    if (containerConditionalRule) {
      // exists, so now check if we have already defined styles
      // e.g. @media print { .some-style { color: green; } }
      const ruleToExtend = containerConditionalRule.rules.get(rule.name)

      if (ruleToExtend) {
        // yep found the style so we have to extend it
        ruleToExtend.style = {
          ...ruleToExtend.style,
          ...rule.style[prop]
        }
      }
      else {
        // found no style so create it
        containerConditionalRule.addRule(rule.name, rule.style[prop])
      }
    }
    else {
      // container do not have a registered conditional rule
      container.addRule(name, {[rule.name]: rule.style[prop]})
    }
  }

  function isNestedRule(prop) {
    return prop[0] === '&'
  }

  function isNestedConditional(prop) {
    return prop[0] === '@'
  }

  function isNested(prop) {
    return isNestedRule(prop) || isNestedConditional(prop)
  }

  return rule => {
    if (rule.type !== 'regular') return
    const container = rule.options.parent
    let options
    let replaceRef
    let index

    for (const prop in rule.style) {
      if (isNested(prop)) {
        if (!options) {
          let {level} = rule.options
          level = level === undefined ? 1 : level + 1
          if (level > 1) warn(`[JSS] Nesting is too deep "${prop}".`)
          options = {...rule.options, named: false, level, index}
        }
        index = (index === undefined ? container.indexOf(rule) : index) + 1
        options.index = index

        if (isNestedRule(prop)) {
          // Lazily create the ref replacer function just once for all nested rules within
          // the sheet.
          if (!replaceRef) replaceRef = getReplaceRef(container)
          handeNestedRule(prop, rule, container, options, replaceRef)
        }
        else if (isNestedConditional(prop)) {
          handleNestedConditional(prop, rule, container)
        }

        delete rule.style[prop]
      }
    }
  }
}
