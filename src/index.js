const consoleWarn = console.warn.bind(console) // eslint-disable-line no-console
const parentRegExp = /&/g
const refRegExp = /\$([\w-]+)/g

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

  function addConditional(name, rule, container) {
    const conditionalContainer = container.getRule(name)

    if (!conditionalContainer) {
      // Add conditional to container because it does not exist yet.
      container.addRule(name, {[rule.name]: rule.style[name]})
      return
    }

    // It exists, so now check if we have already defined styles
    // for example @media print { .some-style { display: none; } } .
    const ruleToExtend = conditionalContainer.getRule(rule.name)

    if (ruleToExtend) {
      ruleToExtend.style = {
        ...ruleToExtend.style,
        ...rule.style[name]
      }
      return
    }

    // Conditional rule in container has no rule so create it.
    conditionalContainer.addRule(rule.name, rule.style[name])
  }

  return rule => {
    if (rule.type !== 'regular') return
    const container = rule.options.parent
    let options
    let replaceRef

    for (const prop in rule.style) {
      const isNested = prop[0] === '&'
      const isNestedConditional = prop[0] === '@'

      if (!isNested && !isNestedConditional) continue

      if (options) options = {...options, index: options.index + 1}
      else {
        let {nestingLevel} = rule.options
        nestingLevel = nestingLevel === undefined ? 1 : nestingLevel + 1
        if (nestingLevel > 1) warn(`[JSS] Nesting is too deep "${prop}".`)
        options = {
          ...rule.options,
          named: false,
          nestingLevel,
          index: container.indexOf(rule) + 1
        }
      }

      if (isNested) {
        // Lazily create the ref replacer function just once for all nested rules within
        // the sheet.
        if (!replaceRef) replaceRef = getReplaceRef(container)
        const name = prop
          // Replace all & by the parent selector.
          .replace(parentRegExp, rule.selector)
          // Replace all $ref.
          .replace(refRegExp, replaceRef)

        container.addRule(name, rule.style[prop], options)
      }
      else if (isNestedConditional) {
        addConditional(prop, rule, container)
      }

      delete rule.style[prop]
    }
  }
}
