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

  function addNestedRule(name, rule, container, options, replaceRef) {
    const nameExtended = name
      // Replace all & by the parent selector.
      .replace(parentRegExp, rule.selector)
      // Replace all $ref.
      .replace(refRegExp, replaceRef)

    container.addRule(nameExtended, rule.style[name], options)
  }

  function addNestedConditional(name, rule, container) {
    const containerConditionalRule = container.getRule(name)

    // Check if conditional rule already exists in container.
    if (containerConditionalRule) {
      // It exists, so now check if we have already defined styles
      // for example @media print { .some-style { display: none; } } .
      const ruleToExtend = containerConditionalRule.getRule(rule.name)

      if (ruleToExtend) {
        ruleToExtend.style = {
          ...ruleToExtend.style,
          ...rule.style[name]
        }
      }
      else {
        // Conditional rule in container has no rule so create it.
        containerConditionalRule.addRule(rule.name, rule.style[name])
      }
    }
    else {
      // Add conditional to container because it does not exist yet.
      container.addRule(name, {[rule.name]: rule.style[name]})
    }
  }

  return rule => {
    if (rule.type !== 'regular') return
    const container = rule.options.parent
    let options
    let replaceRef
    let index
    let isNestedRule
    let isNestedConditional


    for (const prop in rule.style) {
      isNestedRule = prop[0] === '&'
      isNestedConditional = prop[0] === '@'

      if (isNestedRule || isNestedConditional) {
        if (!options) {
          let {level} = rule.options
          level = level === undefined ? 1 : level + 1
          if (level > 1) warn(`[JSS] Nesting is too deep "${prop}".`)
          options = {...rule.options, named: false, level, index}
        }
        index = (index === undefined ? container.indexOf(rule) : index) + 1
        options.index = index

        if (isNestedRule) {
          // Lazily create the ref replacer function just once for all nested rules within
          // the sheet.
          if (!replaceRef) replaceRef = getReplaceRef(container)
          addNestedRule(prop, rule, container, options, replaceRef)
        }
        else if (isNestedConditional) {
          addNestedConditional(prop, rule, container)
        }

        delete rule.style[prop]
      }
    }
  }
}
